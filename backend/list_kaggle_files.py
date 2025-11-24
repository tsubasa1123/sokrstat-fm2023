# Backend/list_kaggle_files.py
import kagglehub

DATASET = "piterfm/football-soccer-uefa-euro-1960-2024"

print("Listing des fichiers disponibles sur Kaggle...")

# ✅ Nouvelle méthode pour lister les fichiers du dataset
info = kagglehub.dataset_load(DATASET)

print("\nFichiers disponibles :")
for f in info.get("files", []):
    print("-", f["name"])
