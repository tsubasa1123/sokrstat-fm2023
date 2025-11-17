# backend/init_db.py
"""Script d'initialisation de la base de données"""

from app import app, db

def init_database():
    """Créer toutes les tables"""
    with app.app_context():
        print(" Création des tables...")
        db.create_all()
        print("Tables créées avec succès!")
        
        # Vérifier que la table existe
        from models import Player
        count = Player.query.count()
        print(f"Nombre de joueurs : {count}")

if __name__ == "__main__":
    init_database()