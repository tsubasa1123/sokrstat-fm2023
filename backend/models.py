# models.py - Football Manager 2023
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_

db = SQLAlchemy()

class Player(db.Model):
    """Joueurs Football Manager 2023 - Adapté à la structure CSV importée"""
    __tablename__ = "players"
    __table_args__ = {'extend_existing': True}
    
    # === CLÉ PRIMAIRE (MAPPING CRUCIAL) ===
    # Python voit "id", la DB voit "uid"
    id = db.Column("uid", db.BigInteger, primary_key=True)
    
    # === INFORMATIONS DE BASE ===
    name = db.Column("name", db.Text, index=True)
    date_of_birth = db.Column("dob", db.Text)         # Mappé sur 'dob'
    age = db.Column("age", db.BigInteger, index=True)
    nationality = db.Column("nat", db.Text, index=True) # Mappé sur 'nat'
    
    # Club et équipe
    club = db.Column("club", db.Text, index=True)
    based = db.Column("based", db.Text)
    team = db.Column("team", db.Text)
    
    # Position
    position = db.Column("position", db.Text, index=True)
    
    # Physique (Texte dans la DB car importé du CSV avec unités parfois)
    height = db.Column("height", db.Text) 
    weight = db.Column("weight", db.Text)
    
    # Valeur et médias
    transfer_value = db.Column("transfer_value", db.Text)
    media_description = db.Column("media_description", db.Text)
    media_handling = db.Column("media_handling", db.Text)
    
    # Pied préféré
    preferred_foot = db.Column("preferred_foot", db.Text)
    left_foot = db.Column("left_foot", db.Text)
    right_foot = db.Column("right_foot", db.Text)
    
    # Blessures
    # injury_proneness = db.Column("inj_pr", db.BigInteger) # Souvent absent ou mal nommé
    recent_injury = db.Column("rc_injury", db.Text)
    
    # Reconnaissance et informations
    recommendation = db.Column("rec", db.Text) # Mappé sur 'rec'
    information = db.Column("inf", db.Text)    # Mappé sur 'inf'
    
    # === STATISTIQUES DE CARRIÈRE ===
    caps = db.Column("caps", db.BigInteger, default=0)
    career_apps = db.Column("at_apps", db.Text)       # at_apps
    career_goals = db.Column("at_gls", db.Text)       # at_gls
    league_apps = db.Column("at_lge_apps", db.Text)   # at_lge_apps
    league_goals = db.Column("at_lge_gls", db.Text)   # at_lge_gls
    youth_apps = db.Column("yth_apps", db.Text)
    youth_goals = db.Column("yth_gls", db.Text)
    
    # === ATTRIBUTS TECHNIQUES (MAPPING NOMS COURTS) ===
    corners = db.Column("cor", db.BigInteger)
    crossing = db.Column("cro", db.BigInteger)
    dribbling = db.Column("dri", db.BigInteger)
    finishing = db.Column("fin", db.BigInteger)
    first_touch = db.Column("fir", db.BigInteger)
    free_kicks = db.Column("fre", db.BigInteger)
    heading = db.Column("hea", db.BigInteger)
    long_shots = db.Column("lon", db.BigInteger)
    long_throws = db.Column("l_th", db.BigInteger)
    marking = db.Column("mar", db.BigInteger)
    passing = db.Column("pas", db.BigInteger)
    penalty_taking = db.Column("pen", db.BigInteger)
    tackling = db.Column("tck", db.BigInteger)
    technique = db.Column("tec", db.BigInteger)
    
    # === ATTRIBUTS MENTAUX ===
    aggression = db.Column("agg", db.BigInteger)
    anticipation = db.Column("ant", db.BigInteger)
    bravery = db.Column("bra", db.BigInteger)
    composure = db.Column("cmp", db.BigInteger) # cmp
    concentration = db.Column("cnt", db.BigInteger) # cnt
    decisions = db.Column("dec", db.BigInteger)
    determination = db.Column("det", db.BigInteger)
    flair = db.Column("fla", db.BigInteger)
    leadership = db.Column("ldr", db.BigInteger)
    off_the_ball = db.Column("otb", db.BigInteger)
    positioning = db.Column("pos", db.BigInteger) # Attention: 'pos' (attribut) vs 'position' (rôle)
    teamwork = db.Column("tea", db.BigInteger)
    vision = db.Column("vis", db.BigInteger)
    work_rate = db.Column("wor", db.BigInteger)
    
    # === ATTRIBUTS PHYSIQUES ===
    acceleration = db.Column("acc", db.BigInteger)
    agility = db.Column("agi", db.BigInteger)
    balance = db.Column("bal", db.BigInteger)
    jumping = db.Column("jum", db.BigInteger)
    natural_fitness = db.Column("nat_1", db.BigInteger) # nat_1 car nat est pris par nationalité
    pace = db.Column("pac", db.BigInteger)
    stamina = db.Column("sta", db.BigInteger)
    strength = db.Column("str", db.BigInteger)
    
    # === ATTRIBUTS GARDIENS ===
    aerial_reach = db.Column("aer", db.BigInteger)
    command_of_area = db.Column("cmd", db.BigInteger)
    communication = db.Column("com", db.BigInteger)
    eccentricity = db.Column("ecc", db.BigInteger)
    handling = db.Column("han", db.BigInteger)
    kicking = db.Column("kic", db.BigInteger)
    one_on_ones = db.Column("1v1", db.BigInteger) # Attention au nommage chiffre
    reflexes = db.Column("ref", db.BigInteger)
    rushing_out = db.Column("tro", db.BigInteger) # tro (Tendency to Rush Out)
    tendency_to_punch = db.Column("pun", db.BigInteger)
    throwing = db.Column("thr", db.BigInteger)
    
    # === ATTRIBUTS CACHÉS / PERSONNALITÉ ===
    adaptability = db.Column("ada", db.BigInteger)
    ambition = db.Column("amb", db.BigInteger)
    consistency = db.Column("cons", db.BigInteger)
    controversy = db.Column("cont", db.BigInteger) # Attention si conflit nom
    dirtiness = db.Column("dirt", db.BigInteger)
    important_matches = db.Column("imp_m", db.BigInteger)
    loyalty = db.Column("loy", db.BigInteger)
    pressure = db.Column("pres", db.BigInteger)
    professionalism = db.Column("prof", db.BigInteger)
    sportsmanship = db.Column("spor", db.BigInteger)
    temperament = db.Column("temp", db.BigInteger)
    versatility = db.Column("vers", db.BigInteger)

    def calculate_averages(self):
        """Calcule les moyennes d'attributs par catégorie"""
        def get_val(val):
            # Sécurité pour convertir BigInteger/Text en int
            try:
                return int(val) if val is not None else 0
            except:
                return 0

        technical = [
            self.corners, self.crossing, self.dribbling, self.finishing,
            self.first_touch, self.free_kicks, self.heading, self.long_shots,
            self.marking, self.passing, self.penalty_taking, self.tackling, self.technique
        ]
        
        mental = [
            self.aggression, self.anticipation, self.bravery, self.composure,
            self.concentration, self.decisions, self.determination, self.flair,
            self.leadership, self.off_the_ball, self.positioning, self.teamwork,
            self.vision, self.work_rate
        ]
        
        physical = [
            self.acceleration, self.agility, self.balance, self.jumping,
            self.pace, self.stamina, self.strength
        ]
        
        goalkeeper = [
            self.aerial_reach, self.command_of_area, self.communication,
            self.handling, self.kicking, self.one_on_ones, self.reflexes,
            self.rushing_out, self.throwing
        ]
        
        def avg(attrs):
            valid = [get_val(a) for a in attrs if a is not None]
            return round(sum(valid) / len(valid), 1) if valid else 0
        
        return {
            "technical": avg(technical),
            "mental": avg(mental),
            "physical": avg(physical),
            "goalkeeper": avg(goalkeeper)
        }

    def to_dict(self, include_all_stats=False):
        """Conversion en dictionnaire pour l'API"""
        basic_data = {
            "id": self.id,
            "uid": self.id, # On renvoie l'ID comme UID aussi
            "name": self.name,
            "age": self.age,
            "nationality": self.nationality,
            "club": self.club,
            "position": self.position,
            "height": self.height,
            "weight": self.weight,
            "transfer_value": self.transfer_value,
            "preferred_foot": self.preferred_foot,
            "career_apps": self.career_apps,
            "career_goals": self.career_goals
        }
        
        if include_all_stats:
            averages = self.calculate_averages()
            
            basic_data.update({
                # Carrière
                "caps": self.caps,
                "league_apps": self.league_apps,
                "league_goals": self.league_goals,
                
                # Moyennes
                "avg_technical": averages["technical"],
                "avg_mental": averages["mental"],
                "avg_physical": averages["physical"],
                "avg_goalkeeper": averages["goalkeeper"],
                
                # Technique
                "technical": {
                    "corners": self.corners,
                    "crossing": self.crossing,
                    "dribbling": self.dribbling,
                    "finishing": self.finishing,
                    "first_touch": self.first_touch,
                    "free_kicks": self.free_kicks,
                    "heading": self.heading,
                    "long_shots": self.long_shots,
                    "marking": self.marking,
                    "passing": self.passing,
                    "penalty_taking": self.penalty_taking,
                    "tackling": self.tackling,
                    "technique": self.technique
                },
                
                # Mental
                "mental": {
                    "aggression": self.aggression,
                    "anticipation": self.anticipation,
                    "bravery": self.bravery,
                    "composure": self.composure,
                    "concentration": self.concentration,
                    "decisions": self.decisions,
                    "determination": self.determination,
                    "flair": self.flair,
                    "leadership": self.leadership,
                    "off_the_ball": self.off_the_ball,
                    "positioning": self.positioning,
                    "teamwork": self.teamwork,
                    "vision": self.vision,
                    "work_rate": self.work_rate
                },
                
                # Physique
                "physical": {
                    "acceleration": self.acceleration,
                    "agility": self.agility,
                    "balance": self.balance,
                    "jumping": self.jumping,
                    "pace": self.pace,
                    "stamina": self.stamina,
                    "strength": self.strength
                },
                
                # Gardien
                "goalkeeper": {
                    "aerial_reach": self.aerial_reach,
                    "command_of_area": self.command_of_area,
                    "communication": self.communication,
                    "eccentricity": self.eccentricity,
                    "handling": self.handling,
                    "kicking": self.kicking,
                    "one_on_ones": self.one_on_ones,
                    "reflexes": self.reflexes,
                    "rushing_out": self.rushing_out,
                    "tendency_to_punch": self.tendency_to_punch,
                    "throwing": self.throwing
                },
                
                # Pieds
                "feet": {
                    "preferred": self.preferred_foot,
                    "left": self.left_foot,
                    "right": self.right_foot
                }
            })
        
        return basic_data

    def __repr__(self):
        return f"<Player {self.name} ({self.position})>"