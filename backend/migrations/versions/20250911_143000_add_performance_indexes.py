"""Add performance indexes

Revision ID: add_performance_indexes
Revises: c4db613a7a88
Create Date: 2025-09-11 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = 'c4db613a7a88'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for Pokemon table
    op.create_index('idx_pokemon_name', 'pokemon', ['name'])
    op.create_index('idx_pokemon_pokemon_id', 'pokemon', ['pokemon_id'])
    
    # Add indexes for Users table
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_email', 'users', ['email'])
    
    # Add indexes for UserPokemon table
    op.create_index('idx_user_pokemon_user_id', 'user_pokemon', ['user_id'])
    op.create_index('idx_user_pokemon_pokemon_id', 'user_pokemon', ['pokemon_id'])


def downgrade():
    # Remove indexes
    op.drop_index('idx_user_pokemon_pokemon_id', table_name='user_pokemon')
    op.drop_index('idx_user_pokemon_user_id', table_name='user_pokemon')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_users_username', table_name='users')
    op.drop_index('idx_pokemon_pokemon_id', table_name='pokemon')
    op.drop_index('idx_pokemon_name', table_name='pokemon')

