# backend/import_auto.py
"""Import automatique"""
import pandas as pd
from sqlalchemy import create_engine, text

# URL PostgreSQL
DATABASE_URL = "postgresql://sokrstat_user:efVi0xz79sDFoTzxEs7lS7U7ff7DATa6@dpg-d4d58h24d50c73dichq0-a.frankfurt-postgres.render.com/sokrstat"

# CSV
CSV_PATH = "data/fm2023/merged_players (1).csv"

def import_auto():
    print(" Connexion à PostgreSQL...")
    engine = create_engine(DATABASE_URL)
    
    #  SUPPRIMER L'ANCIENNE TABLE
    print("Suppression de l'ancienne table 'players'...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS players CASCADE"))
        conn.commit()
    print("Table supprimée")
    
    #  LECTURE DU CSV

    print(f"Lecture du CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, encoding='utf-8')
    print(f"{len(df)} joueurs, {len(df.columns)} colonnes")
    
    # NETTOYER LES NOMS DE COLONNES

    # Supprimer colonnes index
    cols_to_drop = [col for col in df.columns if 'unnamed' in col.lower()]
    if cols_to_drop:
        df = df.drop(columns=cols_to_drop)
    
    # Nettoyer les noms
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_').str.replace('.', '_')
    
    print(f" {len(df.columns)} colonnes après nettoyage")
    
    # IMPORT COMPLET (pandas crée la table automatiquement)

    print("Import dans PostgreSQL (création automatique de la table)...")
    print("Cela peut prendre 5-10 minutes...")
    
    # Import par batch
    batch_size = 1000
    total = len(df)
    
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        if i == 0:
            # Premier batch : créer la table
            batch.to_sql('players', engine, if_exists='replace', index=False, method='multi')
            print(f"Table créée avec {len(df.columns)} colonnes")
        else:
            # Batches suivants : append
            batch.to_sql('players', engine, if_exists='append', index=False, method='multi')
        
        progress = min(i + batch_size, total)
        print(f"{progress}/{total} joueurs importés ({progress*100//total}%)")
    
    print("\n🎉 Import terminé !")
    
    # Vérification
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM players"))
        count = result.scalar()
        print(f"Total dans la base: {count} joueurs")
        
        # Afficher quelques colonnes
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='players' LIMIT 10"))
        cols = [row[0] for row in result]
        print(f"Premières colonnes: {', '.join(cols)}...")

if __name__ == "__main__":
    try:
        import_auto()
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()