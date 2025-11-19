# backend/import_production.py
"""Import des données FM2023 vers PostgreSQL en production"""
import os
import pandas as pd
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('.env.production')

# URL de la base PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL') or "postgresql://sokrstat_user:efVi0xz79sDFoTzxEs7lS7U7ff7DATa6@dpg-d4d58h24d50c73dichq0-a.frankfurt-postgres.render.com/sokrstat"

# Chemin vers le CSV
CSV_PATH = "data/fm2023/merged_players (1).csv"

def import_data():
    """Import des joueurs dans PostgreSQL"""
    print("Connexion à PostgreSQL...")
    engine = create_engine(DATABASE_URL)
    
    #  RÉCUPÉRER LES COLONNES EXISTANTES DANS LA TABLE 
    print(" Récupération de la structure de la table 'players'...")
    inspector = inspect(engine)
    db_columns = [col['name'] for col in inspector.get_columns('players')]
    print(f" {len(db_columns)} colonnes trouvées dans la table PostgreSQL")
    
    print(f" Lecture du fichier CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, encoding='utf-8')
    
    print(f" {len(df)} joueurs trouvés dans le CSV")
    print(f" {len(df.columns)} colonnes dans le CSV")
    
    #  NETTOYER LES COLONNES 
    # Supprimer les colonnes index automatiques
    cols_to_drop = [col for col in df.columns if 'unnamed' in col.lower()]
    if cols_to_drop:
        print(f"🧹 Suppression de colonnes index: {cols_to_drop}")
        df = df.drop(columns=cols_to_drop)
    
    # Nettoyer les noms de colonnes
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
    
    #  GARDER UNIQUEMENT LES COLONNES QUI EXISTENT DANS LA TABLE 
    csv_columns = set(df.columns)
    valid_columns = [col for col in df.columns if col in db_columns]
    invalid_columns = csv_columns - set(db_columns)
    
    print(f"\n Analyse des colonnes:")
    print(f"   ✅ Colonnes valides (présentes dans la DB): {len(valid_columns)}")
    print(f"   ❌ Colonnes ignorées (absentes de la DB): {len(invalid_columns)}")
    
    if invalid_columns and len(invalid_columns) < 20:
        print(f"   Colonnes ignorées: {', '.join(sorted(invalid_columns)[:10])}...")
    
    # Ne garder que les colonnes valides
    df = df[valid_columns]
    
    print(f"\n{len(df.columns)} colonnes seront importées")
    print("Import dans PostgreSQL...")
    
    # Import par batch de 1000
    batch_size = 1000
    total = len(df)
    
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        batch.to_sql('players', engine, if_exists='append', index=False, method='multi')
        progress = min(i + batch_size, total)
        print(f"{progress}/{total} joueurs importés ({progress*100//total}%)")
    
    print("\n🎉 Import terminé avec succès!")
    
    # Vérification
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM players"))
        count = result.scalar()
        print(f"Total dans la base: {count} joueurs")

if __name__ == "__main__":
    try:
        import_data()
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()