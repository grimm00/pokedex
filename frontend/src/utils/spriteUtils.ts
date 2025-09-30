/**
 * Sprite URL utilities for Pokemon sprites
 * Uses PokeAPI sprite repository endpoints
 */

export interface SpriteOptions {
  generation?: 'generation-i' | 'generation-ii' | 'generation-iii' | 'generation-iv' | 'generation-v' | 'generation-vi' | 'generation-vii' | 'generation-viii' | 'generation-ix'
  variant?: 'red-blue' | 'yellow' | 'gold' | 'silver' | 'crystal' | 'ruby-sapphire' | 'emerald' | 'firered-leafgreen' | 'diamond-pearl' | 'platinum' | 'heartgold-soulsilver' | 'black-white' | 'colosseum' | 'xd' | 'omega-ruby-alpha-sapphire' | 'sun-moon' | 'ultra-sun-ultra-moon' | 'lets-go-pikachu-lets-go-eevee' | 'sword-shield' | 'brilliant-diamond-shining-pearl' | 'legends-arceus' | 'scarlet-violet'
  animated?: boolean
  shiny?: boolean
}

/**
 * Generate sprite URL for Pokemon
 * @param pokemonId - Pokemon ID number
 * @param options - Sprite generation options
 * @returns Complete sprite URL
 */
export function getSpriteUrl(pokemonId: number, options: SpriteOptions = {}): string {
  const {
    generation = 'generation-v',
    variant = 'black-white',
    animated = false,
    shiny = false
  } = options

  const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
  
  if (animated) {
    const shinyPath = shiny ? '/shiny' : ''
    return `${baseUrl}/versions/${generation}/${variant}/animated${shinyPath}/${pokemonId}.gif`
  }
  
  // For static sprites, use the default PokeAPI format
  if (shiny) {
    return `${baseUrl}/shiny/${pokemonId}.png`
  }
  
  return `${baseUrl}/${pokemonId}.png`
}

/**
 * Get animated sprite URL for hover effects
 * @param pokemonId - Pokemon ID number
 * @param shiny - Whether to use shiny variant
 * @returns Animated sprite URL
 */
export function getAnimatedSpriteUrl(pokemonId: number, shiny: boolean = false): string {
  return getSpriteUrl(pokemonId, {
    generation: 'generation-v',
    variant: 'black-white',
    animated: true,
    shiny
  })
}

/**
 * Get static sprite URL for default display
 * @param pokemonId - Pokemon ID number
 * @param shiny - Whether to use shiny variant
 * @returns Static sprite URL
 */
export function getStaticSpriteUrl(pokemonId: number, shiny: boolean = false): string {
  return getSpriteUrl(pokemonId, {
    animated: false,
    shiny
  })
}

/**
 * Check if animated sprite exists for Pokemon
 * Note: This is a best-effort check since we can't verify all URLs
 * @param pokemonId - Pokemon ID number
 * @returns Whether animated sprite likely exists
 */
export function hasAnimatedSprite(pokemonId: number): boolean {
  // Most Pokemon from Gen 1-5 have animated sprites
  // This is a simplified check - in production you might want to maintain a list
  return pokemonId >= 1 && pokemonId <= 649
}

/**
 * Get fallback sprite URL if animated sprite fails to load
 * @param pokemonId - Pokemon ID number
 * @returns Fallback sprite URL
 */
export function getFallbackSpriteUrl(pokemonId: number): string {
  return getStaticSpriteUrl(pokemonId)
}

/**
 * Preload animated sprite for better performance
 * @param pokemonId - Pokemon ID number
 * @param shiny - Whether to use shiny variant
 */
export function preloadAnimatedSprite(pokemonId: number, shiny: boolean = false): void {
  const img = new Image()
  img.src = getAnimatedSpriteUrl(pokemonId, shiny)
}

/**
 * Get sprite URLs for different generations
 * @param pokemonId - Pokemon ID number
 * @returns Object with different generation sprite URLs
 */
export function getGenerationSprites(pokemonId: number) {
  return {
    gen1: getSpriteUrl(pokemonId, { generation: 'generation-i', variant: 'red-blue', animated: true }),
    gen2: getSpriteUrl(pokemonId, { generation: 'generation-ii', variant: 'gold', animated: true }),
    gen3: getSpriteUrl(pokemonId, { generation: 'generation-iii', variant: 'ruby-sapphire', animated: true }),
    gen4: getSpriteUrl(pokemonId, { generation: 'generation-iv', variant: 'diamond-pearl', animated: true }),
    gen5: getSpriteUrl(pokemonId, { generation: 'generation-v', variant: 'black-white', animated: true }),
    gen6: getSpriteUrl(pokemonId, { generation: 'generation-vi', variant: 'omega-ruby-alpha-sapphire', animated: true }),
    gen7: getSpriteUrl(pokemonId, { generation: 'generation-vii', variant: 'sun-moon', animated: true }),
    gen8: getSpriteUrl(pokemonId, { generation: 'generation-viii', variant: 'sword-shield', animated: true }),
    gen9: getSpriteUrl(pokemonId, { generation: 'generation-ix', variant: 'scarlet-violet', animated: true })
  }
}
