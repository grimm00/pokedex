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
SEEDING_TIMEOUT=${POKEMON_SEEDING_TIMEOUT:-120}

# Get generation range dynamically from config
GEN_RANGE=$(cd /app && python -c "from backend.utils.generation_config import get_generation_range_string; print(get_generation_range_string())" 2>/dev/null || echo "unknown")

cd /app && timeout ${SEEDING_TIMEOUT}s python -c "
from backend.app import app
from backend.utils.pokemon_seeder import pokemon_seeder
from backend.utils.generation_config import get_generation_range_string
with app.app_context():
    try:
        result = pokemon_seeder.seed_all_generations()
        gen_range = get_generation_range_string()
        print(f'✅ Seeded {result[\"successful\"]} Pokemon from Generations {gen_range}')
    except Exception as e:
        print(f'⚠️ Pokemon seeding failed: {e}')
        print('🔄 Application will continue without seeded data')
" || {
    echo "⚠️ Pokemon seeding timed out after ${SEEDING_TIMEOUT} seconds (Generations ${GEN_RANGE})"
    echo "🔄 Application will continue without seeded data"
}

# Start Flask app in the background
echo "🐍 Starting Flask backend..."
cd /app && python -m backend.app &

# Start nginx in the foreground
echo "🌐 Starting nginx frontend..."
nginx -g 'daemon off;'
