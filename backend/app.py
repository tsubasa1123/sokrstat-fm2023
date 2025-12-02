# app.py - API Flask pour Football Manager 2023
import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from config import config
from models import db, Player
from sqlalchemy import func, or_
import pandas as pd
from io import BytesIO
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
from datetime import datetime, timedelta

# === Déterminer l'environnement ===
env = os.environ.get('FLASK_ENV', 'development')

# === Configuration de l'application Flask ===
app = Flask(__name__)
app.config.from_object(config[env])

# CORS (Configuration permissive)
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Initialisation de SQLAlchemy
db.init_app(app)

# ====================
# PAGE D'ACCUEIL
# ====================
@app.route("/")
def home():
    """Page d'accueil de l'API"""
    try:
        total_players = Player.query.count()
    except Exception as e:
        total_players = 0
        print(f"Erreur DB: {e}")
    
    return jsonify({
        "message": "API SokrStat Football Manager 2023",
        "version": "2.5 (Full Features)",
        "environment": env,
        "total_players": total_players,
        "database": "connected" if total_players >= 0 else "error",
        "endpoints": {
            "compare": "/api/compare (POST)",
            "export_player": "/api/players/<id>/export/<format>",
            "stats": "/api/stats/*"
        }
    })

# ====================
# JOUEURS - LISTE
# ====================
@app.route("/api/players")
def get_players():
    """Récupère les joueurs avec filtres"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 50, type=int), 100)
        
        position = request.args.get("position")
        nationality = request.args.get("nationality")
        club = request.args.get("club")
        min_age = request.args.get("min_age", type=int)
        max_age = request.args.get("max_age", type=int)
        
        sort_by = request.args.get("sort_by", "name")
        order = request.args.get("order", "asc")
        
        query = Player.query
        
        if position: query = query.filter(Player.position == position)
        if nationality: query = query.filter(Player.nationality == nationality)
        if club: query = query.filter(Player.club.ilike(f"%{club}%"))
        if min_age: query = query.filter(Player.age >= min_age)
        if max_age: query = query.filter(Player.age <= max_age)
        
        if hasattr(Player, sort_by):
            sort_column = getattr(Player, sort_by)
            if order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
        else:
             query = query.order_by(Player.name.asc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            "players": [p.to_dict() for p in paginated.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": paginated.total,
                "pages": paginated.pages
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ====================
#  EXPORT JOUEUR 
# ====================
@app.route("/api/players/<int:player_id>/export/<format>")
def export_player(player_id, format):
    """
    Exporte les données d'un joueur unique
    Formats: csv, excel, pdf
    """
    # Imports locaux pour éviter les erreurs si libs manquantes
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
    except ImportError:
        print("ReportLab non installé")

    # Récupérer le joueur
    player = Player.query.get_or_404(player_id)
    player_data = player.to_dict(include_all_stats=True)
    
    if format == 'csv':
        output = BytesIO()
        # Aplatir les données pour le CSV
        rows = []
        for key, value in player_data.items():
            if isinstance(value, dict):
                for k, v in value.items():
                    rows.append([f"{key}_{k}", str(v)])
            else:
                rows.append([key, str(value)])
        
        df = pd.DataFrame(rows, columns=['Attribut', 'Valeur'])
        df.to_csv(output, index=False, encoding='utf-8-sig')
        output.seek(0)
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'{player.name.replace(" ", "_")}_stats.csv'
        )
    
    elif format == 'excel':
        output = BytesIO()
        rows = []
        for key, value in player_data.items():
            if isinstance(value, dict):
                for k, v in value.items():
                    rows.append({'Catégorie': key, 'Attribut': k, 'Valeur': str(v)})
            else:
                rows.append({'Catégorie': 'Général', 'Attribut': key, 'Valeur': str(value)})
        
        df = pd.DataFrame(rows)
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Statistiques')
        
        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{player.name.replace(" ", "_")}_stats.xlsx'
        )
    
    elif format == 'pdf':
        output = BytesIO()
        doc = SimpleDocTemplate(output, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=20, alignment=1)
        elements.append(Paragraph(f"Fiche: {player.name}", title_style))
        
        # Données tabulaires
        data = [['Catégorie', 'Attribut', 'Valeur']]
        for key, value in player_data.items():
            if isinstance(value, dict):
                for k, v in value.items():
                    data.append([key, k, str(v)])
            else:
                data.append(['Général', key, str(value)])

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        doc.build(elements)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'{player.name.replace(" ", "_")}_stats.pdf'
        )
    
    else:
        return jsonify({"error": "Format non supporté"}), 400

# ====================
# JOUEUR DÉTAILLÉ
# ====================
@app.route("/api/players/<player_id>")
def get_player(player_id):
    """Récupère un joueur par ID"""
    try:
        player = Player.query.filter(
            or_(Player.id == player_id, Player.id == int(player_id) if str(player_id).isdigit() else False)
        ).first_or_404()
        return jsonify(player.to_dict(include_all_stats=True))
    except Exception:
         return jsonify({"error": "Joueur introuvable"}), 404

# ====================
# RECHERCHE
# ====================
@app.route("/api/search")
def search_players():
    """Recherche de joueurs"""
    query_text = request.args.get("q", "").strip()
    limit = min(request.args.get("limit", 20, type=int), 50)
    
    if not query_text: return jsonify([])
    
    players = Player.query.filter(
        or_(
            Player.name.ilike(f"%{query_text}%"),
            Player.club.ilike(f"%{query_text}%"),
            Player.nationality.ilike(f"%{query_text}%")
        )
    ).limit(limit).all()
    
    return jsonify([p.to_dict() for p in players])

# ====================
# 🔐 AUTHENTIFICATION ADMIN
# ====================

# Credentials admin (en production, utiliser des variables d'environnement)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH', 
    generate_password_hash('admin123'))  # Changez ce mot de passe !
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-prod')

def token_required(f):
    """Décorateur pour protéger les routes admin"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            # Supprimer "Bearer " si présent
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # Vérifier expiration
            if datetime.utcnow().timestamp() > data['exp']:
                return jsonify({'error': 'Token expiré'}), 401
                
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token invalide'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Connexion admin"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Identifiants manquants'}), 400
    
    # Vérifier les credentials
    if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
        # Générer token JWT valide 24h
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'Connexion réussie',
            'token': token,
            'username': username
        })
    
    return jsonify({'error': 'Identifiants incorrects'}), 401

@app.route("/api/auth/verify", methods=["GET"])
@token_required
def verify_token():
    """Vérifier si le token est valide"""
    return jsonify({'message': 'Token valide'})

# Ajouter un joueur
@app.route("/api/players", methods=["POST"])
@token_required
def add_player():
    data = request.get_json()
    new_player = Player(
        name=data['name'],
        age=data['age'],
        nationality=data['nationality'],
        club=data['club'],
        position=data['position']
    )
    db.session.add(new_player)
    db.session.commit()
    return jsonify({"message": "Joueur ajouté", "id": new_player.id}), 201

# Modifier un joueur
@app.route("/api/players/<int:player_id>", methods=["PUT"])
@token_required
def update_player(player_id):
    player = Player.query.get_or_404(player_id)
    data = request.get_json()
    
    player.name = data.get('name', player.name)
    player.age = data.get('age', player.age)
    player.club = data.get('club', player.club)
    
    db.session.commit()
    return jsonify({"message": "Joueur mis à jour"})

# Supprimer un joueur
@app.route("/api/players/<int:player_id>", methods=["DELETE"])
@token_required
def delete_player(player_id):
    player = Player.query.get_or_404(player_id)
    db.session.delete(player)
    db.session.commit()
    return jsonify({"message": "Joueur supprimé"})

# ====================
#  COMPARATEUR 
# ====================
@app.route("/api/compare", methods=["POST"])
def compare_players():
    """Compare jusqu'à 4 joueurs"""
    try:
        data = request.get_json() or {}
        ids = data.get("players", [])
        
        if not ids or len(ids) < 2:
            return jsonify({"error": "Minimum 2 joueurs requis"}), 400
        
        players = Player.query.filter(Player.id.in_(ids)).all()
        result = [p.to_dict(include_all_stats=True) for p in players]
        return jsonify(result)
    except Exception as e:
        print(f"Erreur Compare: {e}")
        return jsonify({"error": str(e)}), 500

# ====================
# STATISTIQUES 
# ====================
@app.route("/api/stats/overview")
def stats_overview():
    try:
        total_players = Player.query.count()
        nationalities_count = db.session.query(func.count(func.distinct(Player.nationality))).scalar()
        clubs_count = db.session.query(func.count(func.distinct(Player.club))).filter(Player.club.isnot(None)).scalar()
        
        avg_age_query = db.session.query(func.avg(Player.age)).filter(Player.age.isnot(None)).scalar()
        avg_age = float(avg_age_query) if avg_age_query else 0.0
        
        return jsonify({
            "total_players": total_players,
            "nationalities": nationalities_count,
            "clubs": clubs_count,
            "average_age": round(avg_age, 1)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stats/top-players")
def get_top_players():
    attribute = request.args.get("attribute", "finishing")
    limit = min(request.args.get("limit", 10, type=int), 50)
    
    query = Player.query.filter(getattr(Player, attribute).isnot(None))
    top_players = query.order_by(getattr(Player, attribute).desc()).limit(limit).all()
    
    return jsonify([{
        "id": p.id, "name": p.name, "club": p.club, 
        "position": p.position, "nationality": p.nationality, 
        "value": getattr(p, attribute, 0)
    } for p in top_players])

@app.route("/api/stats/nationalities")
def get_nationalities():
    limit = min(request.args.get("limit", 20, type=int), 50)
    nationalities = db.session.query(Player.nationality, func.count(Player.id).label('count')) \
        .filter(Player.nationality.isnot(None)) \
        .group_by(Player.nationality) \
        .order_by(func.count(Player.id).desc()).limit(limit).all()
    return jsonify([{"nationality": nat, "count": count} for nat, count in nationalities])

@app.route("/api/stats/positions")
def get_positions():
    positions = db.session.query(Player.position, func.count(Player.id).label('count')) \
        .filter(Player.position.isnot(None)).group_by(Player.position).all()
    return jsonify([{"position": pos, "count": count} for pos, count in positions])

# ====================
# FILTRES
# ====================
@app.route("/api/filters/nationalities")
def list_nationalities():
    nats = db.session.query(Player.nationality).distinct().order_by(Player.nationality).all()
    return jsonify([n[0] for n in nats if n[0]])

@app.route("/api/filters/positions")
def list_positions():
    pos = db.session.query(Player.position).distinct().order_by(Player.position).all()
    return jsonify([p[0] for p in pos if p[0]])


# ====================
#  IMPORT CSV/EXCEL ADMIN
# ====================

@app.route("/api/admin/import", methods=["POST"])
@token_required
def import_data():
    """Importer des joueurs depuis CSV/Excel"""
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400
    
    # Vérifier l'extension
    allowed_extensions = {'.csv', '.xlsx', '.xls'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return jsonify({'error': f'Format non supporté. Utilisez {", ".join(allowed_extensions)}'}), 400
    
    try:
        # Lire le fichier
        if file_ext == '.csv':
            df = pd.read_csv(file, encoding='utf-8')
        else:  # Excel
            df = pd.read_excel(file, engine='openpyxl')
        
        # Nettoyer les colonnes
        df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
        
        # Supprimer colonnes index
        cols_to_drop = [col for col in df.columns if 'unnamed' in col.lower()]
        if cols_to_drop:
            df = df.drop(columns=cols_to_drop)
        
        # Vérifier colonnes obligatoires
        required_columns = {'name', 'age', 'nationality', 'position'}
        missing_columns = required_columns - set(df.columns)
        
        if missing_columns:
            return jsonify({
                'error': f'Colonnes manquantes : {", ".join(missing_columns)}'
            }), 400
        
        # Import par batch
        batch_size = 100
        total = len(df)
        imported = 0
        errors = []
        
        for i in range(0, total, batch_size):
            batch = df.iloc[i:i+batch_size]
            
            for idx, row in batch.iterrows():
                try:
                    # Vérifier si le joueur existe déjà (par nom)
                    existing = Player.query.filter_by(name=row['name']).first()
                    
                    if existing:
                        # Mise à jour
                        for col in df.columns:
                            if hasattr(existing, col) and pd.notna(row[col]):
                                setattr(existing, col, row[col])
                    else:
                        # Création
                        player_data = {col: row[col] for col in df.columns if hasattr(Player, col) and pd.notna(row[col])}
                        new_player = Player(**player_data)
                        db.session.add(new_player)
                    
                    imported += 1
                    
                except Exception as e:
                    errors.append(f"Ligne {idx + 2}: {str(e)}")
            
            db.session.commit()
        
        return jsonify({
            'message': f'Import terminé : {imported}/{total} joueurs',
            'imported': imported,
            'total': total,
            'errors': errors[:10]  # Max 10 erreurs affichées
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur lors de l\'import : {str(e)}'}), 500

# ====================
# RÉINITIALISATION MOT DE PASSE
# ====================

# En mémoire : codes de réinitialisation
reset_codes = {}

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Générer un code de réinitialisation"""
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Nom d\'utilisateur requis'}), 400
    
    # Vérifier que l'utilisateur existe
    if username != ADMIN_USERNAME:
        return jsonify({'error': 'Utilisateur introuvable'}), 404
    
    # Générer un code à 6 chiffres
    import random
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Stocker avec expiration 15 min
    reset_codes[username] = {
        'code': code,
        'expires': datetime.utcnow() + timedelta(minutes=15)
    }
    
    # En production, envoyer par email
    # Pour le dev, on retourne le code (À SUPPRIMER EN PROD)
    return jsonify({
        'message': 'Code de réinitialisation généré',
        'code': code,  # ⚠️ SUPPRIMER EN PRODUCTION
        'note': 'En production, ce code serait envoyé par email'
    })

@app.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    """Réinitialiser le mot de passe avec le code"""
    data = request.get_json()
    username = data.get('username')
    code = data.get('code')
    new_password = data.get('new_password')
    
    if not all([username, code, new_password]):
        return jsonify({'error': 'Tous les champs sont requis'}), 400
    
    # Vérifier le code
    if username not in reset_codes:
        return jsonify({'error': 'Aucun code de réinitialisation trouvé'}), 404
    
    stored = reset_codes[username]
    
    # Vérifier expiration
    if datetime.utcnow() > stored['expires']:
        del reset_codes[username]
        return jsonify({'error': 'Code expiré. Demandez un nouveau code'}), 400
    
    # Vérifier le code
    if stored['code'] != code:
        return jsonify({'error': 'Code incorrect'}), 400
    
    # Réinitialiser le mot de passe
    global ADMIN_PASSWORD_HASH
    ADMIN_PASSWORD_HASH = generate_password_hash(new_password)
    
    # Supprimer le code
    del reset_codes[username]
    
    return jsonify({
        'message': 'Mot de passe réinitialisé avec succès'
    })

# ====================
#  DÉMARRAGE SERVEUR
# ====================
if __name__ == "__main__":
    with app.app_context():
        pass
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))