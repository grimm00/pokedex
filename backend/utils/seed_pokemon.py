#!/usr/bin/env python3
"""
Pokemon Seeding Management Script
Command-line tool for seeding Pokemon data from PokeAPI
"""

import sys
import argparse
import logging
from app import app
from database import db
from utils.pokemon_seeder import pokemon_seeder
from services.pokeapi_client import pokeapi_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def seed_pokemon_range(start_id: int, end_id: int, batch_size: int = 10):
    """Seed Pokemon data for a range of IDs"""
    with app.app_context():
        try:
            logger.info(f"Starting Pokemon seeding from ID {start_id} to {end_id}")
            stats = pokemon_seeder.seed_pokemon(start_id, end_id, batch_size)
            
            print(f"\n🎉 Seeding completed!")
            print(f"📊 Statistics:")
            print(f"   Total processed: {stats['total_processed']}")
            print(f"   Successful: {stats['successful']}")
            print(f"   Failed: {stats['failed']}")
            print(f"   Skipped: {stats['skipped']}")
            
            if stats['start_time'] and stats['end_time']:
                duration = (stats['end_time'] - stats['start_time']).total_seconds()
                print(f"   Duration: {duration:.2f} seconds")
            
            return True
            
        except Exception as e:
            logger.error(f"Seeding failed: {e}")
            print(f"❌ Seeding failed: {e}")
            return False

def seed_pokemon_generation(generation: int):
    """Seed all Pokemon from a specific generation"""
    with app.app_context():
        try:
            logger.info(f"Starting Pokemon generation {generation} seeding")
            stats = pokemon_seeder.seed_pokemon_generation(generation)
            
            print(f"\n🎉 Generation {generation} seeding completed!")
            print(f"📊 Statistics:")
            print(f"   Total processed: {stats['total_processed']}")
            print(f"   Successful: {stats['successful']}")
            print(f"   Failed: {stats['failed']}")
            print(f"   Skipped: {stats['skipped']}")
            
            if stats['start_time'] and stats['end_time']:
                duration = (stats['end_time'] - stats['start_time']).total_seconds()
                print(f"   Duration: {duration:.2f} seconds")
            
            return True
            
        except Exception as e:
            logger.error(f"Generation {generation} seeding failed: {e}")
            print(f"❌ Generation {generation} seeding failed: {e}")
            return False

def update_pokemon(pokemon_id: int):
    """Update a specific Pokemon"""
    with app.app_context():
        try:
            logger.info(f"Updating Pokemon {pokemon_id}")
            success = pokemon_seeder.update_pokemon(pokemon_id)
            
            if success:
                print(f"✅ Successfully updated Pokemon {pokemon_id}")
            else:
                print(f"❌ Failed to update Pokemon {pokemon_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Update failed: {e}")
            print(f"❌ Update failed: {e}")
            return False

def clear_pokemon_data():
    """Clear all Pokemon data"""
    with app.app_context():
        try:
            logger.info("Clearing all Pokemon data")
            count = pokemon_seeder.clear_pokemon_data()
            print(f"✅ Cleared {count} Pokemon records")
            return True
            
        except Exception as e:
            logger.error(f"Clear failed: {e}")
            print(f"❌ Clear failed: {e}")
            return False

def test_pokeapi_connection():
    """Test PokeAPI connection"""
    with app.app_context():
        try:
            logger.info("Testing PokeAPI connection")
            
            # Test with Pikachu (ID 25)
            pokemon_data = pokeapi_client.get_pokemon(25)
            
            print(f"✅ PokeAPI connection successful!")
            print(f"   Test Pokemon: {pokemon_data['name']}")
            print(f"   Types: {[t['type']['name'] for t in pokemon_data['types']]}")
            
            # Show metrics
            metrics = pokeapi_client.get_metrics()
            print(f"\n📊 API Metrics:")
            print(f"   Requests: {metrics['requests_count']}")
            print(f"   Success rate: {metrics['success_rate']:.1f}%")
            print(f"   Avg response time: {metrics['average_response_time']:.3f}s")
            
            return True
            
        except Exception as e:
            logger.error(f"PokeAPI test failed: {e}")
            print(f"❌ PokeAPI test failed: {e}")
            return False

def show_database_stats():
    """Show current database statistics"""
    with app.app_context():
        try:
            from models.pokemon import Pokemon
            from models.user import User
            from models.audit_log import AuditLog
            
            pokemon_count = Pokemon.query.count()
            user_count = User.query.count()
            audit_count = AuditLog.query.count()
            
            print(f"📊 Database Statistics:")
            print(f"   Pokemon: {pokemon_count}")
            print(f"   Users: {user_count}")
            print(f"   Audit logs: {audit_count}")
            
            if pokemon_count > 0:
                # Show some sample Pokemon
                sample_pokemon = Pokemon.query.limit(5).all()
                print(f"\n🎮 Sample Pokemon:")
                for pokemon in sample_pokemon:
                    print(f"   {pokemon.pokemon_id}: {pokemon.name} ({', '.join(pokemon.types)})")
            
            return True
            
        except Exception as e:
            logger.error(f"Database stats failed: {e}")
            print(f"❌ Database stats failed: {e}")
            return False

def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(description='Pokemon Data Seeding Tool')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Seed range command
    seed_range_parser = subparsers.add_parser('seed-range', help='Seed Pokemon by ID range')
    seed_range_parser.add_argument('start_id', type=int, help='Starting Pokemon ID')
    seed_range_parser.add_argument('end_id', type=int, help='Ending Pokemon ID')
    seed_range_parser.add_argument('--batch-size', type=int, default=10, help='Batch size for processing')
    
    # Seed generation command
    seed_gen_parser = subparsers.add_parser('seed-generation', help='Seed Pokemon by generation')
    seed_gen_parser.add_argument('generation', type=int, help='Generation number (1-9)')
    
    # Update command
    update_parser = subparsers.add_parser('update', help='Update specific Pokemon')
    update_parser.add_argument('pokemon_id', type=int, help='Pokemon ID to update')
    
    # Clear command
    clear_parser = subparsers.add_parser('clear', help='Clear all Pokemon data')
    
    # Test command
    test_parser = subparsers.add_parser('test', help='Test PokeAPI connection')
    
    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show database statistics')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    try:
        if args.command == 'seed-range':
            return 0 if seed_pokemon_range(args.start_id, args.end_id, args.batch_size) else 1
        elif args.command == 'seed-generation':
            return 0 if seed_pokemon_generation(args.generation) else 1
        elif args.command == 'update':
            return 0 if update_pokemon(args.pokemon_id) else 1
        elif args.command == 'clear':
            return 0 if clear_pokemon_data() else 1
        elif args.command == 'test':
            return 0 if test_pokeapi_connection() else 1
        elif args.command == 'stats':
            return 0 if show_database_stats() else 1
        else:
            parser.print_help()
            return 1
            
    except KeyboardInterrupt:
        print("\n⏹️  Operation cancelled by user")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"❌ Unexpected error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())

