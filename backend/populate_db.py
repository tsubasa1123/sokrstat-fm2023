# Backend/populate_db.py
import os
import sqlite3
import pandas as pd
import sys

# 🔧 Forcer l'encodage UTF-8 (Windows)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# === Paramètres ===
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "sokrstat.db")
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Dossier cache Kaggle
CACHE_DIR = os.path.expanduser(
    "~/.cache/kagglehub/datasets/piterfm/football-soccer-uefa-euro-1960-2024/versions/13"
)
LINEUPS_CSV = os.path.join(CACHE_DIR, "euro_lineups.csv")
SUMMARY_CSV = os.path.join(CACHE_DIR, "euro_summary.csv")
COACHES_CSV = os.path.join(CACHE_DIR, "euro_coaches.csv")

# === Suppression ancienne base ===
if os.path.exists(DB_PATH):
    print(f"[!] Suppression de l'ancienne base {DB_PATH}...")
    os.remove(DB_PATH)

# === Création des tables ===
print("Création des tables...")
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.executescript("""
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country_code TEXT UNIQUE
);

CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team_id INTEGER,
    position TEXT,
    position_detailed TEXT,
    jersey_number INTEGER,
    birth_date TEXT,
    country_birth TEXT,
    height REAL,
    weight REAL,
    id_player INTEGER,
    FOREIGN KEY (team_id) REFERENCES teams (id)
);

CREATE TABLE player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    match_id INTEGER,
    tournament_year INTEGER,
    start_position INTEGER,
    position_x REAL,
    position_y REAL,
    FOREIGN KEY (player_id) REFERENCES players (id)
);
""")
conn.commit()

# === Lecture CSV ===
print("Lecture des fichiers CSV...")
lineups_df = pd.read_csv(LINEUPS_CSV)
summary_df = pd.read_csv(SUMMARY_CSV)
coaches_df = pd.read_csv(COACHES_CSV)

lineups_df.columns = lineups_df.columns.str.strip()
lineups_df = lineups_df.fillna("")

print(f" - {len(lineups_df)} lignes dans euro_lineups.csv")
print(f" - {len(summary_df)} lignes dans euro_summary.csv")
print(f" - {len(coaches_df)} lignes dans euro_coaches.csv")

# === Mapping pays
COUNTRY_NAMES = {
    'ALB': 'Albania', 'AND': 'Andorra', 'ARM': 'Armenia', 'AUT': 'Austria',
    'AZE': 'Azerbaijan', 'BEL': 'Belgium', 'BIH': 'Bosnia and Herzegovina',
    'BUL': 'Bulgaria', 'BLR': 'Belarus', 'CRO': 'Croatia', 'CYP': 'Cyprus',
    'CZE': 'Czech Republic', 'DEN': 'Denmark', 'ENG': 'England', 'ESP': 'Spain',
    'EST': 'Estonia', 'FIN': 'Finland', 'FRA': 'France', 'FRG': 'West Germany',
    'GDR': 'East Germany', 'GEO': 'Georgia', 'GER': 'Germany', 'GRE': 'Greece',
    'HUN': 'Hungary', 'IRL': 'Republic of Ireland', 'ISL': 'Iceland',
    'ISR': 'Israel', 'ITA': 'Italy', 'KAZ': 'Kazakhstan', 'LIE': 'Liechtenstein',
    'LTU': 'Lithuania', 'LUX': 'Luxembourg', 'LVA': 'Latvia', 'MDA': 'Moldova',
    'MKD': 'North Macedonia', 'MLT': 'Malta', 'MNE': 'Montenegro', 'NED': 'Netherlands',
    'NIR': 'Northern Ireland', 'NOR': 'Norway', 'POL': 'Poland', 'POR': 'Portugal',
    'ROU': 'Romania', 'RUS': 'Russia', 'SCO': 'Scotland', 'SMR': 'San Marino',
    'SRB': 'Serbia', 'SVK': 'Slovakia', 'SVN': 'Slovenia', 'SUI': 'Switzerland',
    'SWE': 'Sweden', 'TCH': 'Czechoslovakia', 'TUR': 'Turkey', 'UKR': 'Ukraine',
    'URS': 'Soviet Union', 'WAL': 'Wales', 'YUG': 'Yugoslavia'
}

# === Insertion Teams ===
print("Insertion des équipes...")
teams_inserted = {}
for code in lineups_df['country_code'].dropna().unique():
    if code:
        team_name = COUNTRY_NAMES.get(code, code)
        cur.execute("INSERT INTO teams (name, country_code) VALUES (?, ?)", (team_name, code))
        teams_inserted[code] = cur.lastrowid
print(f" -> {len(teams_inserted)} équipes insérées")
conn.commit()

# === Insertion Players ===
print("Insertion des joueurs...")
players_inserted = {}
player_count = 0

for _, row in lineups_df.iterrows():
    code = row.get('country_code', '')
    id_player = row.get('id_player', '')
    key = (id_player, code)

    if key not in players_inserted and code in teams_inserted:
        team_id = teams_inserted[code]
        jersey = row.get('jersey_namber', '')
        try:
            jersey = int(jersey) if str(jersey).strip() else None
        except ValueError:
            jersey = None

        cur.execute("""
            INSERT INTO players (
                name, team_id, position, position_detailed,
                jersey_number, birth_date, country_birth,
                height, weight, id_player
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row.get('name', ''),
            team_id,
            row.get('position_field', ''),
            row.get('position_field_detailed', ''),
            jersey,
            row.get('birth_date', ''),
            row.get('country_birth', ''),
            row.get('height') or None,
            row.get('weight') or None,
            id_player
        ))
        players_inserted[key] = cur.lastrowid
        player_count += 1

print(f" -> {player_count} joueurs insérés")
conn.commit()

# === Insertion Player Stats ===
print("Insertion des statistiques...")
stats_count = 0
for _, row in lineups_df.iterrows():
    key = (row.get('id_player', ''), row.get('country_code', ''))
    if key in players_inserted:
        cur.execute("""
            INSERT INTO player_stats (
                player_id, match_id, tournament_year, start_position, position_x, position_y
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            players_inserted[key],
            row.get('id_match', 0),
            row.get('year', 0),
            row.get('start', 0),
            row.get('start_position_x') or None,
            row.get('start_position_y') or None
        ))
        stats_count += 1
print(f" -> {stats_count} statistiques insérées")
conn.commit()

# === Vérification rapide ===
print("\n" + "="*60)
print("RÉSUMÉ DE LA BASE")
print("="*60)
for table in ["teams", "players", "player_stats"]:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    print(f"{table}: {cur.fetchone()[0]} lignes")

# Exemples
print("\nExemples d'équipes :")
cur.execute("SELECT name, country_code FROM teams LIMIT 5")
for t in cur.fetchall():
    print(f"  • {t[0]} ({t[1]})")

print("\nExemples de joueurs :")
cur.execute("""
    SELECT p.name, p.position, t.country_code
    FROM players p
    JOIN teams t ON p.team_id = t.id
    LIMIT 5
""")
for p in cur.fetchall():
    print(f"  • {p[0]} - {p[1]} ({p[2]})")

conn.close()

# === Création .env ===
print("\n" + "="*60)
print("Création du fichier .env...")
with open(ENV_PATH, "w", encoding="utf-8") as f:
    f.write(f"DATABASE_URL=sqlite:///{os.path.abspath(DB_PATH)}\n")

print("[OK] Base de données créée et .env configuré ✓")
print(f"📄 Base SQLite : {os.path.abspath(DB_PATH)}")
print(f"🌱 Fichier .env : {os.path.abspath(ENV_PATH)}")
print("="*60)
