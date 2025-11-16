#Let's create database for SokrStat

import sqlite3
import os

DB_PATH = "sokrstat.db"

# Supprimer l'ancien fichier afin de repartir de zéro
if os.path.exists(DB_PATH):
    print(f"Suppression de l'ancien fichier {DB_PATH}...")
    os.remove(DB_PATH)

# Connexion à la base SQLite
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Activation des clés étrangères dans SQLite
cur.execute("PRAGMA foreign_keys = ON;")

#  Création des tables
schema_sql = """
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  team_id INTEGER,
  FOREIGN KEY(team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  season INTEGER,
  home_team_id INTEGER,
  away_team_id INTEGER,
  home_goals INTEGER,
  away_goals INTEGER,
  FOREIGN KEY(home_team_id) REFERENCES teams(id),
  FOREIGN KEY(away_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS player_stats (
  id INTEGER PRIMARY KEY,
  player_id INTEGER,
  match_id INTEGER,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  minutes INTEGER,
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(match_id) REFERENCES matches(id)
);
"""

cur.executescript(schema_sql)
conn.commit()
print("Schéma de la base SokrStat créé avec succès.")

# Insertion de données d'exemple
cur.execute("INSERT INTO teams (name) VALUES (?)", ("Athletic Club A",))
team_a_id = cur.lastrowid

cur.execute("INSERT INTO teams (name) VALUES (?)", ("Football Club B",))
team_b_id = cur.lastrowid

cur.execute("INSERT INTO players (name, team_id) VALUES (?, ?)", ("Jean Dupont", team_a_id))
player1_id = cur.lastrowid

cur.execute("INSERT INTO players (name, team_id) VALUES (?, ?)", ("Lucas Martin", team_b_id))
player2_id = cur.lastrowid

cur.execute("""
INSERT INTO matches (season, home_team_id, away_team_id, home_goals, away_goals)
VALUES (?, ?, ?, ?, ?)
""", (2024, team_a_id, team_b_id, 2, 1))
match_id = cur.lastrowid

cur.execute("""
INSERT INTO player_stats (player_id, match_id, goals, assists, minutes)
VALUES (?, ?, ?, ?, ?)
""", (player1_id, match_id, 2, 0, 90))

cur.execute("""
INSERT INTO player_stats (player_id, match_id, goals, assists, minutes)
VALUES (?, ?, ?, ?, ?)
""", (player2_id, match_id, 1, 0, 90))

conn.commit()
print("Données d'exemple insérées avec succès.")

# Vérification simple : affichage des équipes
print("\n=== Équipes enregistrées ===")
for row in cur.execute("SELECT * FROM teams"):
    print(row)

conn.close()
print(f"\nBase créée : {DB_PATH}")