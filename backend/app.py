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

# CORS
CORS(app, resources={
    r"/api/*": {
        "origins": app.config.get('CORS_ORIGINS', '*')
    }
})

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
        "message": " API SokrStat Football Manager 2023",
        "version": "2.0",
        "environment": env,
        "debug": app.debug,
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
# INITIALISATION DB
# ====================
@app.route("/init-db")
def init_db_route():
    """Route temporaire pour initialiser la base de données"""
    try:
        # Créer toutes les tables
        db.create_all()
        
        # Vérifier que ça a marché
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        # Compter les joueurs
        total_players = Player.query.count()
        
        return jsonify({
            "message": "Base de données initialisée avec succès!",
            "success": True,
            "tables_created": tables,
            "total_players": total_players
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

# ====================
# JOUEURS - LISTE AVEC FILTRES
# ====================
@app.route("/api/players")
def get_players():
    """Récupère les joueurs avec filtres avancés"""
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
    
    sort_column = getattr(Player, sort_by, Player.name)
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

# ====================
# JOUEUR DÉTAILLÉ
# ====================
@app.route("/api/players/<int:player_id>")
def get_player(player_id):
    """Récupère un joueur avec toutes ses statistiques"""
    player = Player.query.get_or_404(player_id)
    return jsonify(player.to_dict(include_all_stats=True))

# ====================
# 🔍 RECHERCHE AVANCÉE
# ====================
@app.route("/api/search")
def search_players():
    """Recherche de joueurs par nom, club, ou nationalité"""
    query = request.args.get("q", "").strip()
    limit = min(request.args.get("limit", 20, type=int), 50)
    
    if not query:
        return jsonify([])
    
    players = Player.query.filter(
        or_(
            Player.name.ilike(f"%{query}%"),
            Player.club.ilike(f"%{query}%"),
            Player.nationality.ilike(f"%{query}%")
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
    total_players = Player.query.count()
    
    nationalities_count = db.session.query(
        func.count(func.distinct(Player.nationality))
    ).scalar()
    
    clubs_count = db.session.query(
        func.count(func.distinct(Player.club))
    ).filter(Player.club.isnot(None)).scalar()
    
    avg_age = db.session.query(func.avg(Player.age)).filter(
        Player.age.isnot(None)
    ).scalar()
    
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
        "average_age": round(avg_age, 1) if avg_age else 0,
        "positions": {pos: count for pos, count in positions}
    })


@app.route("/api/stats/top-players")
def get_top_players():
    """Top joueurs par attribut spécifique"""
    attribute = request.args.get("attribute", "finishing")
    position = request.args.get("position")
    limit = min(request.args.get("limit", 10, type=int), 50)
    
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
    
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "club": p.club,
        "position": p.position,
        "nationality": p.nationality,
        "value": getattr(p, attribute)
    } for p in top_players])


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
    """
    Exporte les joueurs filtrés en CSV/Excel
    Body JSON: {
        "filters": {...},
        "columns": ["name", "age", "club", ...],
        "format": "csv" ou "excel"
    }
    """
    data = request.get_json() or {}
    
    filters = data.get("filters", {})
    columns = data.get("columns", ["name", "age", "club", "position", "nationality"])
    export_format = data.get("format", "csv")
    
    # Construction de la requête
    query = Player.query
    
    # Application des filtres
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
    
    # Limite pour éviter exports trop lourds
    limit = min(filters.get("limit", 10000), 50000)
    players = query.limit(limit).all()
    
    # Création du DataFrame
    data_rows = []
    for p in players:
        row = {}
        for col in columns:
            if hasattr(p, col):
                row[col] = getattr(p, col)
        data_rows.append(row)
    
    df = pd.DataFrame(data_rows)
    
    # Export
    output = BytesIO()
    
    if export_format == "excel":
        df.to_excel(output, index=False, engine='openpyxl')
        mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = 'sokrstat_export.xlsx'
    else:  # CSV par défaut
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
        db.create_all()
    
    port = int(os.environ.get('PORT', 5000))
    
    print("="*70)
    print("⚽ API SokrStat Football Manager 2023")
    print("="*70)
    print(f"Environnement: {env}")
    print(f"Base de données: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
    print(f"Serveur: http://0.0.0.0:{port}")
    print("="*70)
    
    app.run(host='0.0.0.0', port=port, debug=app.debug)