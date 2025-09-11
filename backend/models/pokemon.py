from backend.database import db
from datetime import datetime, timezone

class Pokemon(db.Model):
    __tablename__ = 'pokemon'
    
    id = db.Column(db.Integer, primary_key=True)
    pokemon_id = db.Column(db.Integer, unique=True, nullable=False)  # PokeAPI ID
    name = db.Column(db.String(100), nullable=False)
    height = db.Column(db.Integer)  # in decimeters
    weight = db.Column(db.Integer)  # in hectograms
    base_experience = db.Column(db.Integer)
    types = db.Column(db.JSON)  # Store as JSON array
    abilities = db.Column(db.JSON)  # Store as JSON array
    stats = db.Column(db.JSON)  # Store as JSON object
    sprites = db.Column(db.JSON)  # Store as JSON object
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'pokemon_id': self.pokemon_id,
            'name': self.name,
            'height': self.height,
            'weight': self.weight,
            'base_experience': self.base_experience,
            'types': self.types,
            'abilities': self.abilities,
            'stats': self.stats,
            'sprites': self.sprites,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Pokemon: {self.name} (ID: {self.pokemon_id})>'
