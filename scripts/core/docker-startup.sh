#!/bin/bash
set -e

echo "🚀 Starting Pokehub application..."

# Start Redis in the background
echo "📡 Starting Redis server..."
redis-server --daemonize yes

# Initialize database tables
echo "🗄️ Initializing database..."
cd /app && python -c "
from backend.app import app
from backend.database import db
with app.app_context():
    db.create_all()
    print('✅ Database tables created successfully')
"

# Seed Pokemon data (with timeout and error handling)
echo "🌱 Seeding Pokemon data..."
cd /app && timeout 120s python -c "
from backend.app import app
from backend.utils.pokemon_seeder import pokemon_seeder
with app.app_context():
    try:
        result = pokemon_seeder.seed_all_generations()
        print(f'✅ Seeded {result[\"successful\"]} Pokemon from Generations 1-5')
    except Exception as e:
        print(f'⚠️ Pokemon seeding failed: {e}')
        print('🔄 Application will continue without seeded data')
" || {
    echo "⚠️ Pokemon seeding timed out after 120 seconds"
    echo "🔄 Application will continue without seeded data"
}

# Start Flask app in the background
echo "🐍 Starting Flask backend..."
cd /app && python -m backend.app &

# Start nginx in the foreground
echo "🌐 Starting nginx frontend..."
nginx -g 'daemon off;'
