# test_fm2023.py
import os
import pandas as pd

FM_DIR = r"C:\Users\Kennedy\Documents\ProjetsDSI\SokrStat\backend\data\fm2023"

# Lecture du fichier
df = pd.read_csv(os.path.join(FM_DIR, "merged_players (1).csv"))

print(f"📊 Dataset: {len(df):,} joueurs | {len(df.columns)} colonnes")
print("\n" + "="*70)
print("TOUTES LES COLONNES")
print("="*70)

for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

print("\n" + "="*70)
print("APERÇU DES DONNÉES (5 premières lignes)")
print("="*70)
print(df.head(5))

print("\n" + "="*70)
print("STATISTIQUES")
print("="*70)
print(f"Joueurs uniques: {len(df)}")
print(f"Clubs uniques: {df['Club'].nunique() if 'Club' in df.columns else 'N/A'}")
print(f"Nationalités uniques: {df['Nat'].nunique() if 'Nat' in df.columns else 'N/A'}")

print("\n" + "="*70)
print("EXEMPLES DE VALEURS")
print("="*70)
print("\n🔹 Colonnes techniques probables:")
tech_cols = [col for col in df.columns if col in ['Corners', 'Crossing', 'Dribbling', 'Finishing', 'Passing', 'Technique', 'First Touch']]
if tech_cols:
    print(df[tech_cols].head(3))
else:
    print("  Recherche automatique...")
    # Affiche colonnes avec valeurs numériques (probablement des stats)
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns[:15]
    print(f"  Premières colonnes numériques: {numeric_cols.tolist()}")

print("\n" + "="*70)
print("VALEURS MANQUANTES")
print("="*70)
missing = df.isnull().sum()
print(missing[missing > 0].head(10))