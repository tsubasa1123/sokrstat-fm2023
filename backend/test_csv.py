# test_csv.py
import os
import pandas as pd

CACHE_DIR = os.path.expanduser("~/.cache/kagglehub/datasets/piterfm/football-soccer-uefa-euro-1960-2024/versions/13")

lineups_df = pd.read_csv(os.path.join(CACHE_DIR, "euro_lineups.csv"))
summary_df = pd.read_csv(os.path.join(CACHE_DIR, "euro_summary.csv"))
coaches_df = pd.read_csv(os.path.join(CACHE_DIR, "euro_coaches.csv"))

print("=== LINEUPS ===")
print(lineups_df.columns.tolist())
print(lineups_df.head(3))

print("\n=== SUMMARY ===")
print(summary_df.columns.tolist())
print(summary_df.head(3))

print("\n=== COACHES ===")
print(coaches_df.columns.tolist())
print(coaches_df.head(3))