# app.py - API Flask pour Football Manager 2023
import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from config import config
from models import db, Player
from sqlalchemy import func, or_, inspect
import pandas as pd
from io import BytesIO

# === Déterminer l'environnement ===
env = os.environ.get('FLASK_ENV', 'development')

# === Configuration de l'application Flask ===
app = Flask(__name__)
app.config.from_object(config[env])

# CORS (Configuration permissive pour éviter les blocages Vercel)
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
        print(f"⚠️ Erreur DB: {e}")
    
    return jsonify({
        "message": "✅ API SokrStat Football Manager 2023",
        "version": "2.1",
        "environment": env,
        "debug": app.config.get('DEBUG', False),
        "total_players": total_players,
        "database": "connected" if total_players >= 0 else "error",
        "endpoints": {
            "players": "/api/players",
            "search": "/api/search?q=Messi",
            "player_detail": "/api/players/<id>",
            "compare": "/api/compare (POST)",
            "stats": "/api/stats/*",
            "export": "/api/export/csv"
        }
    })

# ====================
# JOUEURS - LISTE AVEC FILTRES
# ====================
@app.route("/api/players")
def get_players():
    """Récupère les joueurs avec filtres avancés"""
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
        
        if position:
            query = query.filter(Player.position == position)
        if nationality:
            query = query.filter(Player.nationality == nationality)
        if club:
            query = query.filter(Player.club.ilike(f"%{club}%"))
        if min_age:
            query = query.filter(Player.age >= min_age)
        if max_age:
            query = query.filter(Player.age <= max_age)
        
        # Sécurité sur le tri
        if hasattr(Player, sort_by):
            sort_column = getattr(Player, sort_by)
        else:
            sort_column = Player.name

        if order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            "players": [p.to_dict() for p in paginated.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": paginated.total,
                "pages": paginated.pages,
                "has_next": paginated.has_next,
                "has_prev": paginated.has_prev
            }
        })
    except Exception as e:
        print(f"❌ Erreur /api/players: {e}")
        return jsonify({"error": str(e)}), 500

# ====================
# 📥 EXPORT JOUEUR INDIVIDUEL
# ====================
@app.route("/api/players/<int:player_id>/export/<format>")
def export_player(player_id, format):
    """
    Exporte les données d'un joueur unique
    Formats: csv, excel, pdf
    """
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    
    # Récupérer le joueur
    player = Player.query.get_or_404(player_id)
    player_data = player.to_dict(include_all_stats=True)
    
    if format == 'csv':
        # CSV
        output = BytesIO()
        
        # Préparer les données en format clé-valeur
        rows = []
        for key, value in player_data.items():
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
        # Excel
        output = BytesIO()
        
        # Créer un DataFrame
        rows = []
        for key, value in player_data.items():
            rows.append({'Attribut': key, 'Valeur': str(value)})
        
        df = pd.DataFrame(rows)
        
        # Créer le fichier Excel avec mise en forme
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Statistiques')
            
            # Accéder à la feuille pour la mise en forme
            workbook = writer.book
            worksheet = writer.sheets['Statistiques']
            
            # Ajuster la largeur des colonnes
            worksheet.column_dimensions['A'].width = 30
            worksheet.column_dimensions['B'].width = 50
        
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'{player.name.replace(" ", "_")}_stats.xlsx'
        )
    
    elif format == 'pdf':
        # PDF
        output = BytesIO()
        
        # Créer le document PDF
        doc = SimpleDocTemplate(output, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Style personnalisé pour le titre
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=1  # Centré
        )
        
        # Titre
        title = Paragraph(f"Fiche Joueur : {player.name}", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Informations principales
        info_style = styles['Normal']
        main_info = [
            f"<b>Âge:</b> {player.age} ans",
            f"<b>Nationalité:</b> {player.nationality}",
            f"<b>Club:</b> {player.club or 'N/A'}",
            f"<b>Position:</b> {player.position}",
            f"<b>Pied:</b> {player.preferred_foot or 'N/A'}",
        ]
        
        for info in main_info:
            elements.append(Paragraph(info, info_style))
            elements.append(Spacer(1, 0.1*inch))
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Tableau des attributs techniques
        tech_data = [['Attribut', 'Valeur']]
        
        # Catégories d'attributs
        categories = {
            'Technique': ['corners', 'crossing', 'dribbling', 'finishing', 'first_touch', 
                         'free_kicks', 'heading', 'long_shots', 'passing', 'technique'],
            'Mental': ['aggression', 'anticipation', 'bravery', 'composure', 'concentration',
                      'decisions', 'determination', 'flair', 'leadership', 'vision'],
            'Physique': ['acceleration', 'agility', 'balance', 'jumping', 'pace', 
                        'stamina', 'strength']
        }
        
        for category, attrs in categories.items():
            tech_data.append([f'=== {category} ===', ''])
            for attr in attrs:
                if hasattr(player, attr):
                    value = getattr(player, attr)
                    if value is not None:
                        tech_data.append([attr.replace('_', ' ').title(), str(value)])
        
        # Créer le tableau
        table = Table(tech_data, colWidths=[3*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        
        # Construire le PDF
        doc.build(elements)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'{player.name.replace(" ", "_")}_stats.pdf'
        )
    
    else:
        return jsonify({"error": "Format non supporté. Utilisez csv, excel ou pdf"}), 400

# ====================
# JOUEUR DÉTAILLÉ
# ====================
@app.route("/api/players/<player_id>")
def get_player(player_id):
    """Récupère un joueur par ID ou UID"""
    # On essaie de trouver par ID numérique standard
    player = Player.query.filter(
        or_(Player.id == player_id, Player.id == int(player_id) if player_id.isdigit() else False)
    ).first_or_404()
    
    return jsonify(player.to_dict(include_all_stats=True))

# ====================
# 🔍 RECHERCHE AVANCÉE
# ====================
@app.route("/api/search")
def search_players():
    """Recherche de joueurs par nom, club, ou nationalité"""
    query_text = request.args.get("q", "").strip()
    limit = min(request.args.get("limit", 20, type=int), 50)
    
    if not query_text:
        return jsonify([])
    
    # Recherche insensible à la casse
    players = Player.query.filter(
        or_(
            Player.name.ilike(f"%{query_text}%"),
            Player.club.ilike(f"%{query_text}%"),
            Player.nationality.ilike(f"%{query_text}%")
        )
    ).limit(limit).all()
    
    return jsonify([p.to_dict() for p in players])

# ====================
# 🔄 COMPARATEUR
# ====================
@app.route("/api/compare", methods=["POST"])
def compare_players():
    """Compare 2 à 4 joueurs"""
    data = request.get_json()
    ids = data.get("players", [])
    
    if len(ids) < 2:
        return jsonify({"error": "Minimum 2 joueurs requis"}), 400
    if len(ids) > 4:
        return jsonify({"error": "Maximum 4 joueurs"}), 400
    
    # Conversion des IDs en format compatible DB
    players = Player.query.filter(Player.id.in_(ids)).all()
    
    if len(players) != len(ids):
        return jsonify({"error": "Un ou plusieurs joueurs introuvables"}), 404
    
    result = [p.to_dict(include_all_stats=True) for p in players]
    return jsonify(result)

# ====================
# 📊 STATISTIQUES GLOBALES 
# ====================
@app.route("/api/stats/overview")
def stats_overview():
    """Vue d'ensemble des statistiques de la base"""
    try:
        total_players = Player.query.count()
        
        nationalities_count = db.session.query(
            func.count(func.distinct(Player.nationality))
        ).scalar()
        
        clubs_count = db.session.query(
            func.count(func.distinct(Player.club))
        ).filter(Player.club.isnot(None)).scalar()
        
        # Correction du bug float/decimal
        avg_age_query = db.session.query(func.avg(Player.age)).filter(
            Player.age.isnot(None)
        ).scalar()
        
        # On convertit explicitement en float pour que JSON le voit comme un nombre
        # et que .toFixed() fonctionne sur le frontend
        avg_age = float(avg_age_query) if avg_age_query else 0.0
        
        positions = db.session.query(
            Player.position,
            func.count(Player.id).label('count')
        ).filter(Player.position.isnot(None)).group_by(
            Player.position
        ).all()
        
        return jsonify({
            "total_players": total_players,
            "nationalities": nationalities_count,
            "clubs": clubs_count,
            "average_age": round(avg_age, 1), # Renvoie un nombre (ex: 24.5)
            "positions": {pos: count for pos, count in positions}
        })
    except Exception as e:
        print(f"❌ Erreur Stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/stats/top-players")
def get_top_players():
    """Top joueurs par attribut spécifique"""
    attribute = request.args.get("attribute", "finishing")
    position = request.args.get("position")
    limit = min(request.args.get("limit", 10, type=int), 50)
    
    # Vérifier si l'attribut existe dans le modèle ou via le mapping
    # Pour simplifier, on utilise getattr sur le modèle, 
    # mais attention : il faut utiliser le nom de l'attribut Python (ex: 'finishing')
    if not hasattr(Player, attribute):
        return jsonify({"error": f"Attribut '{attribute}' invalide"}), 400
    
    query = Player.query.filter(
        getattr(Player, attribute).isnot(None)
    )
    
    if position:
        query = query.filter(Player.position == position)
    
    top_players = query.order_by(
        getattr(Player, attribute).desc()
    ).limit(limit).all()
    
    # On renvoie un format simplifié
    result = []
    for p in top_players:
        val = getattr(p, attribute)
        # Conversion sécu pour le JSON
        try:
            val = int(val)
        except:
            pass
            
        result.append({
            "id": p.id,
            "name": p.name,
            "club": p.club,
            "position": p.position,
            "nationality": p.nationality,
            "value": val
        })

    return jsonify(result)

@app.route("/api/stats/nationalities")
def get_nationalities():
    """Top nationalités par nombre de joueurs"""
    limit = min(request.args.get("limit", 20, type=int), 50)
    
    nationalities = db.session.query(
        Player.nationality,
        func.count(Player.id).label('count')
    ).filter(
        Player.nationality.isnot(None)
    ).group_by(
        Player.nationality
    ).order_by(
        func.count(Player.id).desc()
    ).limit(limit).all()
    
    return jsonify([
        {"nationality": nat, "count": count}
        for nat, count in nationalities
    ])

@app.route("/api/stats/clubs")
def get_clubs():
    """Top clubs par nombre de joueurs"""
    limit = min(request.args.get("limit", 20, type=int), 50)
    
    clubs = db.session.query(
        Player.club,
        func.count(Player.id).label('count')
    ).filter(
        Player.club.isnot(None)
    ).group_by(
        Player.club
    ).order_by(
        func.count(Player.id).desc()
    ).limit(limit).all()
    
    return jsonify([
        {"club": club, "count": count}
        for club, count in clubs
    ])

@app.route("/api/stats/positions")
def get_positions():
    """Distribution des joueurs par position"""
    positions = db.session.query(
        Player.position,
        func.count(Player.id).label('count')
    ).filter(
        Player.position.isnot(None)
    ).group_by(
        Player.position
    ).all()
    
    return jsonify([
        {"position": pos, "count": count}
        for pos, count in positions
    ])

# ====================
# 🔧 FILTRES - LISTES
# ====================
@app.route("/api/filters/nationalities")
def list_nationalities():
    """Liste toutes les nationalités disponibles"""
    nationalities = db.session.query(
        Player.nationality
    ).distinct().filter(
        Player.nationality.isnot(None)
    ).order_by(Player.nationality).all()
    
    return jsonify([nat[0] for nat in nationalities])

@app.route("/api/filters/clubs")
def list_clubs():
    """Liste tous les clubs disponibles"""
    clubs = db.session.query(
        Player.club
    ).distinct().filter(
        Player.club.isnot(None)
    ).order_by(Player.club).all()
    
    return jsonify([club[0] for club in clubs])

@app.route("/api/filters/positions")
def list_positions():
    """Liste toutes les positions disponibles"""
    positions = db.session.query(
        Player.position
    ).distinct().filter(
        Player.position.isnot(None)
    ).order_by(Player.position).all()
    
    return jsonify([pos[0] for pos in positions])

# ====================
# 📥 EXPORT CSV 
# ====================
@app.route("/api/export/csv", methods=["POST"])
def export_csv():
    """Exporte les joueurs filtrés en CSV/Excel"""
    data = request.get_json() or {}
    
    filters = data.get("filters", {})
    columns = data.get("columns", ["name", "age", "club", "position", "nationality"])
    export_format = data.get("format", "csv")
    
    query = Player.query
    
    if filters.get("position"):
        query = query.filter(Player.position == filters["position"])
    if filters.get("nationality"):
        query = query.filter(Player.nationality == filters["nationality"])
    if filters.get("club"):
        query = query.filter(Player.club.ilike(f"%{filters['club']}%"))
    if filters.get("min_age"):
        query = query.filter(Player.age >= filters["min_age"])
    if filters.get("max_age"):
        query = query.filter(Player.age <= filters["max_age"])
    
    limit = min(filters.get("limit", 10000), 50000)
    players = query.limit(limit).all()
    
    # Création du DataFrame
    data_rows = []
    for p in players:
        row = {}
        # On utilise le dictionnaire du joueur pour récupérer les bonnes valeurs mappées
        p_dict = p.to_dict(include_all_stats=True)
        
        for col in columns:
            # On essaie de récupérer depuis le dict, sinon direct attribut, sinon vide
            if col in p_dict:
                row[col] = p_dict[col]
            elif hasattr(p, col):
                row[col] = getattr(p, col)
            else:
                row[col] = ""
        data_rows.append(row)
    
    df = pd.DataFrame(data_rows)
    output = BytesIO()
    
    if export_format == "excel":
        df.to_excel(output, index=False, engine='openpyxl')
        mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = 'sokrstat_export.xlsx'
    else:
        df.to_csv(output, index=False, encoding='utf-8-sig')
        mimetype = 'text/csv'
        filename = 'sokrstat_export.csv'
    
    output.seek(0)
    return send_file(
        output,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )

# ====================
# ❌ GESTION ERREURS
# ====================
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Ressource introuvable"}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Erreur interne du serveur"}), 500

# ====================
# 🚀 DÉMARRAGE SERVEUR
# ====================
if __name__ == "__main__":
    with app.app_context():
        # On n'appelle plus create_all() car la table est gérée par le script d'import
        # db.create_all()
        pass
        
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))