import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, Sparkles, Play, Star, Clock, Zap, Brain, Puzzle, Music, Palette, Loader2, RefreshCw } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'

// Fallback categories if Firestore unavailable
const GAME_CATEGORIES = [
  { id: 'all', name: 'All Games', icon: Gamepad2 },
  { id: 'puzzle', name: 'Puzzle', icon: Puzzle },
  { id: 'strategy', name: 'Strategy', icon: Brain },
  { id: 'arcade', name: 'Arcade', icon: Zap },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'art', name: 'Art & Creative', icon: Palette },
]

// Fallback games when Firestore is empty
const FALLBACK_GAMES = [
  {
    id: 'neural-maze',
    title: 'Neural Maze',
    description: 'AI-generated maze game with adaptive difficulty. Navigate through procedurally generated neural networks.',
    category: 'puzzle',
    thumbnail: 'https://picsum.photos/seed/neuralmaze/400/300',
    status: 'ready',
  },
  {
    id: 'crypto-runner',
    title: 'Crypto Runner',
    description: 'Endless runner with crypto-themed obstacles. Dodge the bears and catch the bulls!',
    category: 'arcade',
    thumbnail: 'https://picsum.photos/seed/cryptorun/400/300',
    status: 'ready',
  },
  {
    id: 'quantum-chess',
    title: 'Quantum Chess',
    description: 'Chess variant where pieces can exist in superposition. Checkmate in ways never before possible.',
    category: 'strategy',
    thumbnail: 'https://picsum.photos/seed/quantchess/400/300',
    status: 'ready',
  },
  {
    id: 'beat-synth',
    title: 'Beat Synth',
    description: 'Create beats with AI. Mix, match, and discover new sounds powered by neural synthesis.',
    category: 'music',
    thumbnail: 'https://picsum.photos/seed/beatsynth/400/300',
    status: 'ready',
  },
  {
    id: 'word-ai',
    title: 'Word AI',
    description: 'AI-powered word puzzles that adapt to your skill level. New challenges daily.',
    category: 'puzzle',
    thumbnail: 'https://picsum.photos/seed/wordai/400/300',
    status: 'ready',
  },
]

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Subscribe to Firestore games collection
    const unsubscribe = onSnapshot(doc(db, 'content', 'games'), (doc) => {
      if (doc.exists() && doc.data()?.items) {
        setGames(doc.data().items)
      } else {
        // Use fallback if Firestore is empty
        setGames(FALLBACK_GAMES)
      }
      setLoading(false)
    }, (err) => {
      console.error('Firestore error:', err)
      setGames(FALLBACK_GAMES)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(g => g.category === selectedCategory)

  const getCategoryIcon = (categoryId) => {
    const cat = GAME_CATEGORIES.find(c => c.id === categoryId)
    return cat?.icon || Gamepad2
  }

  const handlePlayGame = (game) => {
    // Navigate to the game page
    if (game.status === 'ready') {
      const gameId = game.id.toLowerCase().replace(/\s+/g, '-')
      navigate(`/games/${gameId}`)
    }
  }

  return (
    <div class="pt-16 min-h-screen">
      {/* Header */}
      <div class="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            class="flex items-center gap-3 mb-2"
          >
            <Gamepad2 class="text-amber-500" size={32} />
            <h1 class="text-3xl font-display font-bold">Games</h1>
            <span class="text-sm text-zinc-500 ml-2">
              {games.length} {games.length === 1 ? 'game' : 'games'} available
            </span>
          </motion.div>
          <p class="text-zinc-400 max-w-2xl">
            AI-generated games powered by Kaito. New games created automatically every 10 minutes.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div class="border-b border-zinc-800 bg-zinc-900/30">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center gap-2 overflow-x-auto">
            {GAME_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = cat.id === 'all' 
                ? games.length 
                : games.filter(g => g.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  class={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{cat.name}</span>
                  <span class="ml-1 text-xs opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div class="flex items-center justify-center py-20">
          <Loader2 class="animate-spin text-amber-500" size={32} />
          <span class="ml-3 text-zinc-400">Loading games...</span>
        </div>
      )}

      {/* Games Grid */}
      {!loading && (
        <div class="max-w-7xl mx-auto px-4 py-8">
          {filteredGames.length > 0 ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => {
                const CategoryIcon = getCategoryIcon(game.category)
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    class="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 transition-all"
                  >
                    {/* Thumbnail */}
                    <div class="relative aspect-video overflow-hidden">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/seed/default/400/300'
                        }}
                      />
                      {game.status === 'coming-soon' && (
                        <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div class="flex items-center gap-2 text-amber-400">
                            <Sparkles size={20} />
                            <span class="font-medium">Coming Soon</span>
                          </div>
                        </div>
                      )}
                      {game.status === 'ready' && (
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePlayGame(game)}
                            class="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center hover:bg-amber-500 transition-colors"
                          >
                            <Play size={24} class="ml-1 text-white" fill="white" />
                          </button>
                        </div>
                      )}
                      
                      {/* Play count badge */}
                      {game.plays > 0 && (
                        <div class="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-xs text-zinc-300 flex items-center gap-1">
                          <Play size={12} />
                          {game.plays}
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div class="p-4">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 flex items-center gap-1">
                          <CategoryIcon size={12} />
                          {GAME_CATEGORIES.find(c => c.id === game.category)?.name || game.category}
                        </span>
                        {game.status === 'ready' && (
                          <span class="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                            <Zap size={12} />
                            Ready
                          </span>
                        )}
                      </div>
                      <h3 class="font-semibold text-lg mb-1 group-hover:text-amber-400 transition-colors">
                        {game.title}
                      </h3>
                      <p class="text-sm text-zinc-500 line-clamp-2">{game.description}</p>
                      
                      {/* Rating */}
                      {game.rating > 0 && (
                        <div class="mt-3 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              class={i < Math.round(game.rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'} 
                            />
                          ))}
                          <span class="text-xs text-zinc-500 ml-1">({game.rating})</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div class="text-center py-16">
              <Gamepad2 size={48} class="mx-auto text-zinc-600 mb-4" />
              <h3 class="text-xl font-semibold mb-2">No games in this category</h3>
              <p class="text-zinc-500">Check back soon for new AI-generated games.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
