"""
Pokemon Data Seeder
Handles data transformation and seeding from PokeAPI to our database
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from database import db
from models.pokemon import Pokemon
from models.audit_log import log_system_event, AuditAction
from services.pokeapi_client import PokeAPIClient, PokeAPIError

# Configure logging
logger = logging.getLogger(__name__)

class PokemonDataTransformer:
    """Transforms PokeAPI data to our database format"""
    
    @staticmethod
    def transform_pokemon_data(pokeapi_data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform PokeAPI Pokemon data to our database format"""
        try:
            # Extract types
            types = []
            for type_info in pokeapi_data.get('types', []):
                types.append(type_info['type']['name'])
            
            # Extract abilities
            abilities = []
            for ability_info in pokeapi_data.get('abilities', []):
                abilities.append(ability_info['ability']['name'])
            
            # Extract stats
            stats = {}
            for stat_info in pokeapi_data.get('stats', []):
                stat_name = stat_info['stat']['name']
                base_stat = stat_info['base_stat']
                stats[stat_name] = base_stat
            
            # Extract sprites
            sprites = {}
            sprites_data = pokeapi_data.get('sprites', {})
            sprite_fields = ['front_default', 'back_default', 'front_shiny', 'back_shiny']
            
            for field in sprite_fields:
                if sprites_data.get(field):
                    sprites[field] = sprites_data[field]
            
            # Transform to our format
            transformed_data = {
                'pokemon_id': pokeapi_data['id'],
                'name': pokeapi_data['name'],
                'types': types,
                'abilities': abilities,
                'stats': stats,
                'sprites': sprites,
                'height': pokeapi_data.get('height', 0),
                'weight': pokeapi_data.get('weight', 0),
                'base_experience': pokeapi_data.get('base_experience', 0)
            }
            
            return transformed_data
            
        except Exception as e:
            logger.error(f"Error transforming Pokemon data: {e}")
            raise ValueError(f"Failed to transform Pokemon data: {str(e)}")
    
    @staticmethod
    def validate_pokemon_data(data: Dict[str, Any]) -> bool:
        """Validate Pokemon data before saving"""
        required_fields = ['pokemon_id', 'name', 'types', 'abilities', 'stats']
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        # Validate types
        if not isinstance(data['types'], list) or len(data['types']) == 0:
            raise ValueError("Types must be a non-empty list")
        
        # Validate abilities
        if not isinstance(data['abilities'], list):
            raise ValueError("Abilities must be a list")
        
        # Validate stats
        if not isinstance(data['stats'], dict):
            raise ValueError("Stats must be a dictionary")
        
        # Validate pokemon_id
        if not isinstance(data['pokemon_id'], int) or data['pokemon_id'] <= 0:
            raise ValueError("Pokemon ID must be a positive integer")
        
        return True

class PokemonSeeder:
    """Handles seeding Pokemon data from PokeAPI"""
    
    def __init__(self, pokeapi_client: PokeAPIClient):
        self.client = pokeapi_client
        self.transformer = PokemonDataTransformer()
        self.stats = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'start_time': None,
            'end_time': None
        }
    
    def seed_pokemon(self, start_id: int = 1, end_id: int = 151, batch_size: int = 10) -> Dict[str, Any]:
        """Seed Pokemon data from PokeAPI"""
        self.stats['start_time'] = datetime.now(timezone.utc)
        self.stats['total_processed'] = 0
        self.stats['successful'] = 0
        self.stats['failed'] = 0
        self.stats['skipped'] = 0
        
        logger.info(f"Starting Pokemon seeding from ID {start_id} to {end_id}")
        
        # Log seeding start
        log_system_event(
            action=AuditAction.BULK_OPERATION,
            details={
                'operation': 'pokemon_seeding',
                'start_id': start_id,
                'end_id': end_id,
                'batch_size': batch_size
            }
        )
        
        try:
            # Process in batches
            for batch_start in range(start_id, end_id + 1, batch_size):
                batch_end = min(batch_start + batch_size - 1, end_id)
                self._process_batch(batch_start, batch_end)
                
                # Commit batch to database
                db.session.commit()
                logger.info(f"Processed batch {batch_start}-{batch_end}")
            
            self.stats['end_time'] = datetime.now(timezone.utc)
            duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
            
            logger.info(f"Pokemon seeding completed in {duration:.2f} seconds")
            logger.info(f"Stats: {self.stats['successful']} successful, {self.stats['failed']} failed, {self.stats['skipped']} skipped")
            
            # Log seeding completion
            log_system_event(
                action=AuditAction.BULK_OPERATION,
                details={
                    'operation': 'pokemon_seeding_completed',
                    'total_processed': self.stats['total_processed'],
                    'successful': self.stats['successful'],
                    'failed': self.stats['failed'],
                    'skipped': self.stats['skipped'],
                    'duration_seconds': duration
                }
            )
            
            return self.stats
            
        except Exception as e:
            logger.error(f"Pokemon seeding failed: {e}")
            db.session.rollback()
            
            # Log seeding failure
            log_system_event(
                action=AuditAction.SYSTEM_ERROR,
                details={
                    'operation': 'pokemon_seeding_failed',
                    'error': str(e),
                    'processed_so_far': self.stats['total_processed']
                }
            )
            
            raise
    
    def _process_batch(self, start_id: int, end_id: int):
        """Process a batch of Pokemon IDs"""
        for pokemon_id in range(start_id, end_id + 1):
            try:
                self.stats['total_processed'] += 1
                
                # Check if Pokemon already exists
                existing = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
                if existing:
                    logger.debug(f"Pokemon {pokemon_id} already exists, skipping")
                    self.stats['skipped'] += 1
                    continue
                
                # Fetch from PokeAPI
                pokeapi_data = self.client.get_pokemon(pokemon_id)
                
                # Transform data
                transformed_data = self.transformer.transform_pokemon_data(pokeapi_data)
                
                # Validate data
                self.transformer.validate_pokemon_data(transformed_data)
                
                # Create Pokemon record
                pokemon = Pokemon(**transformed_data)
                db.session.add(pokemon)
                
                self.stats['successful'] += 1
                logger.debug(f"Successfully processed Pokemon {pokemon_id}: {pokemon.name}")
                
            except PokeAPIError as e:
                logger.warning(f"PokeAPI error for Pokemon {pokemon_id}: {e}")
                self.stats['failed'] += 1
                continue
                
            except Exception as e:
                logger.error(f"Error processing Pokemon {pokemon_id}: {e}")
                self.stats['failed'] += 1
                continue
    
    def seed_pokemon_generation(self, generation: int = 1) -> Dict[str, Any]:
        """Seed all Pokemon from a specific generation"""
        self.stats['start_time'] = datetime.now(timezone.utc)
        self.stats['total_processed'] = 0
        self.stats['successful'] = 0
        self.stats['failed'] = 0
        self.stats['skipped'] = 0
        
        logger.info(f"Starting Pokemon generation {generation} seeding")
        
        try:
            # Get all Pokemon from generation
            pokemon_list = self.client.get_pokemon_generation(generation)
            
            logger.info(f"Found {len(pokemon_list)} Pokemon in generation {generation}")
            
            # Process each Pokemon
            for pokeapi_data in pokemon_list:
                try:
                    self.stats['total_processed'] += 1
                    pokemon_id = pokeapi_data['id']
                    
                    # Check if Pokemon already exists
                    existing = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
                    if existing:
                        logger.debug(f"Pokemon {pokemon_id} already exists, skipping")
                        self.stats['skipped'] += 1
                        continue
                    
                    # Transform data
                    transformed_data = self.transformer.transform_pokemon_data(pokeapi_data)
                    
                    # Validate data
                    self.transformer.validate_pokemon_data(transformed_data)
                    
                    # Create Pokemon record
                    pokemon = Pokemon(**transformed_data)
                    db.session.add(pokemon)
                    
                    self.stats['successful'] += 1
                    logger.debug(f"Successfully processed Pokemon {pokemon_id}: {pokemon.name}")
                    
                except Exception as e:
                    logger.error(f"Error processing Pokemon {pokemon_id}: {e}")
                    self.stats['failed'] += 1
                    continue
            
            # Commit all changes
            db.session.commit()
            
            self.stats['end_time'] = datetime.now(timezone.utc)
            duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
            
            logger.info(f"Generation {generation} seeding completed in {duration:.2f} seconds")
            logger.info(f"Stats: {self.stats['successful']} successful, {self.stats['failed']} failed, {self.stats['skipped']} skipped")
            
            return self.stats
            
        except Exception as e:
            logger.error(f"Generation {generation} seeding failed: {e}")
            db.session.rollback()
            raise
    
    def update_pokemon(self, pokemon_id: int) -> bool:
        """Update a specific Pokemon with latest data from PokeAPI"""
        try:
            # Fetch from PokeAPI
            pokeapi_data = self.client.get_pokemon(pokemon_id)
            
            # Transform data
            transformed_data = self.transformer.transform_pokemon_data(pokeapi_data)
            
            # Validate data
            self.transformer.validate_pokemon_data(transformed_data)
            
            # Find existing Pokemon
            pokemon = Pokemon.query.filter_by(pokemon_id=pokemon_id).first()
            if not pokemon:
                logger.warning(f"Pokemon {pokemon_id} not found for update")
                return False
            
            # Update fields
            pokemon.name = transformed_data['name']
            pokemon.types = transformed_data['types']
            pokemon.abilities = transformed_data['abilities']
            pokemon.stats = transformed_data['stats']
            pokemon.sprites = transformed_data['sprites']
            pokemon.height = transformed_data.get('height', 0)
            pokemon.weight = transformed_data.get('weight', 0)
            pokemon.base_experience = transformed_data.get('base_experience', 0)
            pokemon.updated_at = datetime.now(timezone.utc)
            
            db.session.commit()
            
            logger.info(f"Successfully updated Pokemon {pokemon_id}: {pokemon.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating Pokemon {pokemon_id}: {e}")
            db.session.rollback()
            return False
    
    def seed_johto_pokemon(self, batch_size: int = 10) -> Dict[str, Any]:
        """Seed all Johto Pokemon (Generation 2: IDs 152-251)"""
        logger.info("Starting Johto Pokemon seeding (Generation 2: IDs 152-251)")
        return self.seed_pokemon(start_id=152, end_id=251, batch_size=batch_size)
    
    def seed_hoenn_pokemon(self, batch_size: int = 10) -> Dict[str, Any]:
        """Seed all Hoenn Pokemon (Generation 3: IDs 252-386)"""
        logger.info("Starting Hoenn Pokemon seeding (Generation 3: IDs 252-386)")
        return self.seed_pokemon(start_id=252, end_id=386, batch_size=batch_size)
    
    def seed_sinnoh_pokemon(self, batch_size: int = 10) -> Dict[str, Any]:
        """Seed all Sinnoh Pokemon (Generation 4: IDs 387-493)"""
        logger.info("Starting Sinnoh Pokemon seeding (Generation 4: IDs 387-493)")
        return self.seed_pokemon(start_id=387, end_id=493, batch_size=batch_size)
    
    def seed_unova_pokemon(self, batch_size: int = 10) -> Dict[str, Any]:
        """Seed all Unova Pokemon (Generation 5: IDs 494-649)"""
        logger.info("Starting Unova Pokemon seeding (Generation 5: IDs 494-649)")
        return self.seed_pokemon(start_id=494, end_id=649, batch_size=batch_size)
    
    def seed_all_generations(self, batch_size: int = 10) -> Dict[str, Any]:
        """Seed all Pokemon from Generations 1-5 (IDs 1-649)"""
        logger.info("Starting complete Pokemon seeding (Generations 1-5: IDs 1-649)")
        return self.seed_pokemon(start_id=1, end_id=649, batch_size=batch_size)
    
    def seed_test_batch(self, start_id: int = 152, count: int = 5) -> Dict[str, Any]:
        """Seed a small test batch for verification"""
        end_id = start_id + count - 1
        logger.info(f"Starting test batch seeding (IDs {start_id}-{end_id})")
        return self.seed_pokemon(start_id=start_id, end_id=end_id, batch_size=5)
    
    def clear_pokemon_data(self) -> int:
        """Clear all Pokemon data from database"""
        try:
            count = Pokemon.query.count()
            Pokemon.query.delete()
            db.session.commit()
            
            logger.info(f"Cleared {count} Pokemon records from database")
            
            # Log data clearing
            log_system_event(
                action=AuditAction.BULK_OPERATION,
                details={
                    'operation': 'pokemon_data_cleared',
                    'records_deleted': count
                }
            )
            
            return count
            
        except Exception as e:
            logger.error(f"Error clearing Pokemon data: {e}")
            db.session.rollback()
            raise

# Global seeder instance
pokemon_seeder = PokemonSeeder(PokeAPIClient())

