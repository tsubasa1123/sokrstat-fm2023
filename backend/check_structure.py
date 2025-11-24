# backend/check_structure.py
import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv('.env.production')

# URL Database
DATABASE_URL = os.environ.get('DATABASE_URL') or "postgresql://sokrstat_user:efVi0xz79sDFoTzxEs7lS7U7ff7DATa6@dpg-d4d58h24d50c73dichq0-a.frankfurt-postgres.render.com/sokrstat"

def check_db():
    print("Inspection de la base de données...")
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        columns = inspector.get_columns('players')
        print(f"\n Table 'players' trouvée avec {len(columns)} colonnes.")
        print("\n LISTE DES COLONNES :")
        print("-" * 30)
        
        pk = inspector.get_pk_constraint('players')
        print(f"Clé primaire : {pk['constrained_columns']}")
        print("-" * 30)

        for col in columns:
            print(f"- {col['name']} ({col['type']})")
            
    except Exception as e:
        print(f"❌ Erreur : {e}")

if __name__ == "__main__":
    check_db()