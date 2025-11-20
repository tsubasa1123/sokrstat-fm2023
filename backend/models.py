# models.py - Football Manager 2023
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Player(db.Model):
    """Joueurs Football Manager 2023 - 91k+ joueurs"""
    __tablename__ = "players"
    
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String(20), unique=True, index=True)  # UID original
    
    # === INFORMATIONS DE BASE ===
    name = db.Column(db.String(100), nullable=False, index=True)
    date_of_birth = db.Column(db.String(20))  # DOB
    age = db.Column(db.Integer, index=True)
    nationality = db.Column(db.String(50), index=True)  # Nat
    
    # Club et équipe
    club = db.Column(db.String(100), index=True)
    based = db.Column(db.String(100))  # Ville/Pays du club
    team = db.Column(db.String(100))  # Équipe au sein du club
    
    # Position
    position = db.Column(db.String(50), index=True)  # GK, D, M, AM, ST
    
    # Physique
    height = db.Column(db.Integer)  # en cm
    weight = db.Column(db.Integer)  # en kg
    
    # Valeur et médias
    transfer_value = db.Column(db.String(20))  # Ex: "€5M"
    media_description = db.Column(db.Text)
    media_handling = db.Column(db.String(50))  # Media-friendly, etc.
    
    # Pied préféré
    preferred_foot = db.Column(db.String(10))  # Left, Right, Either
    left_foot = db.Column(db.Integer)  # 1-20
    right_foot = db.Column(db.Integer)  # 1-20
    
    # Blessures
    injury_proneness = db.Column(db.Integer)  # Inj Pr
    recent_injury = db.Column(db.String(20))  # Rc Injury
    
    # Reconnaissance et informations
    recommendation = db.Column(db.String(10))  # Rec
    information = db.Column(db.String(20))  # Inf
    
    # === STATISTIQUES DE CARRIÈRE ===
    caps = db.Column(db.Integer, default=0)  # Sélections nationales
    
    # Toutes compétitions
    career_apps = db.Column(db.Integer, default=0)  # AT Apps
    career_goals = db.Column(db.Integer, default=0)  # AT Gls
    
    # Championnat
    league_apps = db.Column(db.Integer, default=0)  # AT Lge Apps
    league_goals = db.Column(db.Integer, default=0)  # AT Lge Gls
    
    # Jeunes
    youth_apps = db.Column(db.Integer, default=0)  # Yth Apps
    youth_goals = db.Column(db.Integer, default=0)  # Yth Gls
    
    # === ATTRIBUTS TECHNIQUES (1-20) ===
    corners = db.Column(db.Integer)  # Cor
    crossing = db.Column(db.Integer)  # Cro
    dribbling = db.Column(db.Integer)  # Dri
    finishing = db.Column(db.Integer)  # Fin
    first_touch = db.Column(db.Integer)  # Fir
    free_kicks = db.Column(db.Integer)  # Fre
    heading = db.Column(db.Integer)  # Hea
    long_shots = db.Column(db.Integer)  # Lon
    long_throws = db.Column(db.Integer)  # L Th
    marking = db.Column(db.Integer)  # Mar
    passing = db.Column(db.Integer)  # Pas
    penalty_taking = db.Column(db.Integer)  # Pen
    tackling = db.Column(db.Integer)  # Tck
    technique = db.Column(db.Integer)  # Tec
    
    # === ATTRIBUTS MENTAUX (1-20) ===
    aggression = db.Column(db.Integer)  # Agg
    anticipation = db.Column(db.Integer)  # Ant
    bravery = db.Column(db.Integer)  # Bra
    composure = db.Column(db.Integer)  # Cmp
    concentration = db.Column(db.Integer)  # Cnt
    decisions = db.Column(db.Integer)  # Dec
    determination = db.Column(db.Integer)  # Det
    flair = db.Column(db.Integer)  # Fla
    leadership = db.Column(db.Integer)  # Ldr
    off_the_ball = db.Column(db.Integer)  # OtB
    positioning = db.Column(db.Integer)  # Pos
    teamwork = db.Column(db.Integer)  # Tea
    vision = db.Column(db.Integer)  # Vis
    work_rate = db.Column(db.Integer)  # Wor
    
    # === ATTRIBUTS PHYSIQUES (1-20) ===
    acceleration = db.Column(db.Integer)  # Acc
    agility = db.Column(db.Integer)  # Agi
    balance = db.Column(db.Integer)  # Bal
    jumping = db.Column(db.Integer)  # Jum
    natural_fitness = db.Column(db.Integer)  # Nat (confusion avec Nationalité)
    pace = db.Column(db.Integer)  # Pac
    stamina = db.Column(db.Integer)  # Sta
    strength = db.Column(db.Integer)  # Str
    
    # === ATTRIBUTS GARDIENS (1-20) ===
    aerial_reach = db.Column(db.Integer)  # Aer
    command_of_area = db.Column(db.Integer)  # Cmd
    communication = db.Column(db.Integer)  # Com
    eccentricity = db.Column(db.Integer)  # Ecc
    handling = db.Column(db.Integer)  # Han
    kicking = db.Column(db.Integer)  # Kic
    one_on_ones = db.Column(db.Integer)  # 1v1
    reflexes = db.Column(db.Integer)  # Ref
    rushing_out = db.Column(db.Integer)  # TRO
    tendency_to_punch = db.Column(db.Integer)  # Pun
    throwing = db.Column(db.Integer)  # Thr
    
    # === ATTRIBUTS CACHÉS / PERSONNALITÉ ===
    adaptability = db.Column(db.Integer)  # Ada
    ambition = db.Column(db.Integer)  # Amb
    consistency = db.Column(db.Integer)  # Cons
    controversy = db.Column(db.Integer)  # Cont
    dirtiness = db.Column(db.Integer)  # Dirt
    important_matches = db.Column(db.Integer)  # Imp M
    loyalty = db.Column(db.Integer)  # Loy
    pressure = db.Column(db.Integer)  # Pres
    professionalism = db.Column(db.Integer)  # Prof
    sportsmanship = db.Column(db.Integer)  # Spor
    temperament = db.Column(db.Integer)  # Temp
    versatility = db.Column(db.Integer)  # Vers
    
    # Métadonnées
    # created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def calculate_averages(self):
        """Calcule les moyennes d'attributs par catégorie"""
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
            valid = [a for a in attrs if a is not None]
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
            "uid": self.uid,
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
        return f"<Player {self.name} ({self.position}) - {self.club}>"