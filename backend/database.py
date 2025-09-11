"""
Database configuration for the Pokedex application.
This file contains the database instance to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy

# Create the database instance
db = SQLAlchemy()


