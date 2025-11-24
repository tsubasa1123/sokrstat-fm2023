# create_db.py
import os
from dotenv import load_dotenv
from flask import Flask
from models import db

load_dotenv()
DB_URL = os.getenv("DATABASE_URL", "sqlite:///sokrstat.db")

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.drop_all()   # optionnel : pour repartir de zéro
    db.create_all()
    print("[OK] Base de données initialisée :", DB_URL)
