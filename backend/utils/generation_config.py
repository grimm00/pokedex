"""
Generation Configuration System
Defines Pokemon generations with metadata for scalable filtering
"""

from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass

@dataclass
class GenerationData:
    """Data class for generation metadata"""
    name: str
    region: str
    start_id: int
    end_id: int
    year: int
    games: List[str]
    color: str
    icon: str
    description: str

# Generation definitions - easily extensible for future generations
GENERATIONS: Dict[int, GenerationData] = {
    1: GenerationData(
        name="Kanto",
        region="Kanto",
        start_id=1,
        end_id=151,
        year=1996,
        games=["Red", "Blue", "Yellow"],
        color="#ff6b6b",
        icon="kanto-icon.png",
        description="The original Pokemon region where it all began"
    ),
    2: GenerationData(
        name="Johto",
        region="Johto", 
        start_id=152,
        end_id=251,
        year=1999,
        games=["Gold", "Silver", "Crystal"],
        color="#4ecdc4",
        icon="johto-icon.png",
        description="The second region, home to new Pokemon and Johto League"
    ),
    3: GenerationData(
        name="Hoenn",
        region="Hoenn",
        start_id=252,
        end_id=386,
        year=2002,
        games=["Ruby", "Sapphire", "Emerald"],
        color="#45b7d1",
        icon="hoenn-icon.png",
        description="A tropical region with diverse landscapes and weather"
    ),
    # Future generations can be easily added here:
    # 4: GenerationData(
    #     name="Sinnoh",
    #     region="Sinnoh",
    #     start_id=387,
    #     end_id=493,
    #     year=2006,
    #     games=["Diamond", "Pearl", "Platinum"],
    #     color="#9b59b6",
    #     icon="sinnoh-icon.png",
    #     description="A mountainous region with ancient legends"
    # ),
}

def get_generation_by_id(pokemon_id: int) -> Optional[int]:
    """
    Get generation number for a Pokemon ID
    
    Args:
        pokemon_id: The Pokemon's national dex ID
        
    Returns:
        Generation number (1, 2, 3, etc.) or None if not found
    """
    for gen_num, gen_data in GENERATIONS.items():
        if gen_data.start_id <= pokemon_id <= gen_data.end_id:
            return gen_num
    return None

def get_generation_data(generation: int) -> Optional[GenerationData]:
    """
    Get generation metadata for a specific generation
    
    Args:
        generation: Generation number (1, 2, 3, etc.)
        
    Returns:
        GenerationData object or None if not found
    """
    return GENERATIONS.get(generation)

def get_all_generations() -> Dict[int, GenerationData]:
    """
    Get all available generations
    
    Returns:
        Dictionary of all generation data
    """
    return GENERATIONS.copy()

def get_generation_range(generation: int) -> Optional[Tuple[int, int]]:
    """
    Get the Pokemon ID range for a generation
    
    Args:
        generation: Generation number
        
    Returns:
        Tuple of (start_id, end_id) or None if not found
    """
    gen_data = get_generation_data(generation)
    if gen_data:
        return (gen_data.start_id, gen_data.end_id)
    return None

def get_generation_count(generation: int) -> Optional[int]:
    """
    Get the number of Pokemon in a generation
    
    Args:
        generation: Generation number
        
    Returns:
        Number of Pokemon in the generation or None if not found
    """
    gen_data = get_generation_data(generation)
    if gen_data:
        return gen_data.end_id - gen_data.start_id + 1
    return None

def get_generation_by_name(name: str) -> Optional[int]:
    """
    Get generation number by name (case-insensitive)
    
    Args:
        name: Generation name (e.g., "Kanto", "Johto", "Hoenn")
        
    Returns:
        Generation number or None if not found
    """
    name_lower = name.lower()
    for gen_num, gen_data in GENERATIONS.items():
        if gen_data.name.lower() == name_lower:
            return gen_num
    return None

def get_generation_by_region(region: str) -> Optional[int]:
    """
    Get generation number by region name (case-insensitive)
    
    Args:
        region: Region name (e.g., "Kanto", "Johto", "Hoenn")
        
    Returns:
        Generation number or None if not found
    """
    region_lower = region.lower()
    for gen_num, gen_data in GENERATIONS.items():
        if gen_data.region.lower() == region_lower:
            return gen_num
    return None

def get_total_pokemon_count() -> int:
    """
    Get total number of Pokemon across all generations
    
    Returns:
        Total Pokemon count
    """
    total = 0
    for gen_data in GENERATIONS.values():
        total += gen_data.end_id - gen_data.start_id + 1
    return total

def get_generation_summary() -> Dict[str, any]:
    """
    Get summary of all generations
    
    Returns:
        Dictionary with generation summary data
    """
    generations = []
    total_pokemon = 0
    
    for gen_num, gen_data in GENERATIONS.items():
        pokemon_count = gen_data.end_id - gen_data.start_id + 1
        total_pokemon += pokemon_count
        
        generations.append({
            'generation': gen_num,
            'name': gen_data.name,
            'region': gen_data.region,
            'year': gen_data.year,
            'pokemon_count': pokemon_count,
            'start_id': gen_data.start_id,
            'end_id': gen_data.end_id,
            'color': gen_data.color,
            'games': gen_data.games,
            'description': gen_data.description
        })
    
    return {
        'generations': generations,
        'total_generations': len(generations),
        'total_pokemon': total_pokemon,
        'available_generations': list(GENERATIONS.keys())
    }

def validate_generation(generation: int) -> bool:
    """
    Validate if a generation number is valid
    
    Args:
        generation: Generation number to validate
        
    Returns:
        True if valid, False otherwise
    """
    return generation in GENERATIONS

def get_next_generation_id() -> int:
    """
    Get the next generation ID for future expansion
    
    Returns:
        Next available generation number
    """
    return max(GENERATIONS.keys()) + 1

def add_generation(generation: int, gen_data: GenerationData) -> bool:
    """
    Add a new generation (for future expansion)
    
    Args:
        generation: Generation number
        gen_data: Generation metadata
        
    Returns:
        True if added successfully, False if generation already exists
    """
    if generation in GENERATIONS:
        return False
    
    GENERATIONS[generation] = gen_data
    return True

# Convenience functions for common operations
def is_kanto_pokemon(pokemon_id: int) -> bool:
    """Check if Pokemon is from Kanto (Gen 1)"""
    return get_generation_by_id(pokemon_id) == 1

def is_johto_pokemon(pokemon_id: int) -> bool:
    """Check if Pokemon is from Johto (Gen 2)"""
    return get_generation_by_id(pokemon_id) == 2

def is_hoenn_pokemon(pokemon_id: int) -> bool:
    """Check if Pokemon is from Hoenn (Gen 3)"""
    return get_generation_by_id(pokemon_id) == 3

def get_generation_colors() -> Dict[int, str]:
    """Get color mapping for all generations"""
    return {gen_num: gen_data.color for gen_num, gen_data in GENERATIONS.items()}

def get_generation_names() -> Dict[int, str]:
    """Get name mapping for all generations"""
    return {gen_num: gen_data.name for gen_num, gen_data in GENERATIONS.items()}
