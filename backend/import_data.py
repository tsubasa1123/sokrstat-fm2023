# import_data.py - Import Football Manager 2023 Dataset
import os
import pandas as pd
from app import app, db
from models import Player

# === CONFIGURATION ===
CSV_PATH = "data/fm2023/merged_players (1).csv"

# Mapping des colonnes CSV vers les attributs du modèle
COLUMN_MAPPING = {
    'UID': 'uid',
    'Name': 'name',
    'DOB': 'date_of_birth',
    'Age': 'age',
    'Nat': 'nationality',
    'Club': 'club',
    'Based': 'based',
    'Team': 'team',
    'Position': 'position',
    'Height': 'height',
    'Weight': 'weight',
    'Transfer Value': 'transfer_value',
    'Media Description': 'media_description',
    'Media Handling': 'media_handling',
    'Preferred Foot': 'preferred_foot',
    'Left Foot': 'left_foot',
    'Right Foot': 'right_foot',
    'Inj Pr': 'injury_proneness',
    'Rc Injury': 'recent_injury',
    'Rec': 'recommendation',
    'Inf': 'information',
    
    # Carrière
    'Caps': 'caps',
    'AT Apps': 'career_apps',
    'AT Gls': 'career_goals',
    'AT Lge Apps': 'league_apps',
    'AT Lge Gls': 'league_goals',
    'Yth Apps': 'youth_apps',
    'Yth Gls': 'youth_goals',
    
    # Technique
    'Cor': 'corners',
    'Cro': 'crossing',
    'Dri': 'dribbling',
    'Fin': 'finishing',
    'Fir': 'first_touch',
    'Fre': 'free_kicks',
    'Hea': 'heading',
    'Lon': 'long_shots',
    'L Th': 'long_throws',
    'Mar': 'marking',
    'Pas': 'passing',
    'Pen': 'penalty_taking',
    'Tck': 'tackling',
    'Tec': 'technique',
    
    # Mental
    'Agg': 'aggression',
    'Ant': 'anticipation',
    'Bra': 'bravery',
    'Cmp': 'composure',
    'Cnt': 'concentration',
    'Dec': 'decisions',
    'Det': 'determination',
    'Fla': 'flair',
    'Ldr': 'leadership',
    'OtB': 'off_the_ball',
    'Pos': 'positioning',
    'Tea': 'teamwork',
    'Vis': 'vision',
    'Wor': 'work_rate',
    
    # Physique
    'Acc': 'acceleration',
    'Agi': 'agility',
    'Bal': 'balance',
    'Jum': 'jumping',
    'Pac': 'pace',
    'Sta': 'stamina',
    'Str': 'strength',
    
    # Gardien
    'Aer': 'aerial_reach',
    'Cmd': 'command_of_area',
    'Com': 'communication',
    'Ecc': 'eccentricity',
    'Han': 'handling',
    'Kic': 'kicking',
    '1v1': 'one_on_ones',
    'Ref': 'reflexes',
    'TRO': 'rushing_out',
    'Pun': 'tendency_to_punch',
    'Thr': 'throwing',
    
    # Personnalité
    'Ada': 'adaptability',
    'Amb': 'ambition',
    'Cons': 'consistency',
    'Cont': 'controversy',
    'Dirt': 'dirtiness',
    'Imp M': 'important_matches',
    'Loy': 'loyalty',
    'Pres': 'pressure',
    'Prof': 'professionalism',
    'Spor': 'sportsmanship',
    'Temp': 'temperament',
    'Vers': 'versatility'
}

def clean_value(value):
    """Nettoie les valeurs avant insertion"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        value = value.strip()
        return None if value == '' or value == 'nan' else value
    return value

def import_players():
    """Importe tous les joueurs depuis le CSV"""
    
    print("="*70)
    print("IMPORT FOOTBALL MANAGER 2023 DATASET")
    print("="*70)
    
    # Vérification du fichier
    if not os.path.exists(CSV_PATH):
        print(f"❌ ERREUR: Fichier non trouvé: {CSV_PATH}")
        return
    
    # Lecture du CSV
    print(f"\n📖 Lecture du fichier {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    print(f"✅ {len(df):,} joueurs trouvés dans le CSV")
    
    # Création de la base de données
    with app.app_context():
        print("\n🗄️ Création des tables...")
        db.drop_all()
        db.create_all()
        print("✅ Tables créées")
        
        # Import des joueurs
        print(f"\n⚙️ Import des joueurs en cours...")
        imported = 0
        errors = 0
        batch_size = 1000
        
        for index, row in df.iterrows():
            try:
                player_data = {}
                for csv_col, model_attr in COLUMN_MAPPING.items():
                    if csv_col in df.columns:
                        player_data[model_attr] = clean_value(row[csv_col])
                
                player = Player(**player_data)
                db.session.add(player)
                
                imported += 1
                
                if imported % batch_size == 0:
                    db.session.commit()
                    print(f"   ⏳ {imported:,} joueurs importés...")
                
            except Exception as e:
                errors += 1
                if errors < 10:
                    print(f"   ⚠️ Erreur ligne {index}: {str(e)[:100]}")
                db.session.rollback()
        
        # Commit final
        try:
            db.session.commit()
            print(f"\n✅ Import terminé!")
            print(f"   ✓ {imported:,} joueurs importés avec succès")
            if errors > 0:
                print(f"   ⚠️ {errors} erreurs rencontrées")
        except Exception as e:
            print(f"❌ Erreur finale: {e}")
            db.session.rollback()
        
        # Statistiques
        print("\n" + "="*70)
        print("STATISTIQUES DE LA BASE DE DONNÉES")
        print("="*70)
        
        total = Player.query.count()
        print(f"Total joueurs: {total:,}")
        
        # Par nationalité (top 10)
        print("\n🌍 Top 10 nationalités:")
        nationalities = db.session.query(
            Player.nationality, 
            db.func.count(Player.id)
        ).group_by(Player.nationality).order_by(
            db.func.count(Player.id).desc()
        ).limit(10).all()
        
        for nat, count in nationalities:
            print(f"   {nat}: {count:,} joueurs")
        
        # Par club (top 10)
        print("\n⚽ Top 10 clubs:")
        clubs = db.session.query(
            Player.club, 
            db.func.count(Player.id)
        ).filter(
            Player.club.isnot(None)
        ).group_by(Player.club).order_by(
            db.func.count(Player.id).desc()
        ).limit(10).all()
        
        for club, count in clubs:
            print(f"   {club}: {count} joueurs")
        
        # Joueur exemple
        print("\n" + "="*70)
        print("EXEMPLE DE JOUEUR")
        print("="*70)
        sample = Player.query.filter(Player.club.isnot(None)).first()
        if sample:
            print(f"\nNom: {sample.name}")
            print(f"Âge: {sample.age}")
            print(f"Club: {sample.club}")
            print(f"Position: {sample.position}")
            print(f"Nationalité: {sample.nationality}")
            averages = sample.calculate_averages()
            print(f"\nMoyennes:")
            print(f"  Technique: {averages['technical']}")
            print(f"  Mental: {averages['mental']}")
            print(f"  Physique: {averages['physical']}")
        
        print("\n" + "="*70)
        print("✅ IMPORT TERMINÉ AVEC SUCCÈS!")
        print("="*70)

if __name__ == "__main__":
    import_players()