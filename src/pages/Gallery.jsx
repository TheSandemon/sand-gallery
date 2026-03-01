import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, Heart, Eye, Loader2 } from 'lucide-react'
import { db } from '../lib/firebase'
import { collection, getDocs, updateDoc, doc, increment } from 'firebase/firestore'

// Mock gallery items for demo
const MOCK_ITEMS = [
  { id: '1', title: 'Cosmic Dreams', artist: 'AI Artist', image: 'https://picsum.photos/seed/1/800/600', views: 1250, likes: 89 },
  { id: '2', title: 'Neon City', artist: 'CyberArtist', image: 'https://picsum.photos/seed/2/800/600', views: 890, likes: 67 },
  { id: '3', title: 'Abstract Flow', artist: 'ModernArt', image: 'https://picsum.photos/seed/3/800/600', views: 2100, likes: 156 },
  { id: '4', title: 'Digital Sunset', artist: 'PixelMaster', image: 'https://picsum.photos/seed/4/800/600', views: 678, likes: 45 },
  { id: '5', title: 'Future Vision', artist: 'TechArt', image: 'https://picsum.photos/seed/5/800/600', views: 1567, likes: 112 },
  { id: '6', title: 'Neon Dreams', artist: 'LightArtist', image: 'https://picsum.photos/seed/6/800/600', views: 943, likes: 78 },
  { id: '7', title: 'Cyber World', artist: 'DigitalArt', image: 'https://picsum.photos/seed/7/800/600', views: 1823, likes: 134 },
  { id: '8', title: 'Abstract Mind', artist: 'SoulArt', image: 'https://picsum.photos/seed/8/800/600', views: 756, likes: 56 },
]

export default function Gallery() {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [wishlist, setWishlist] = useState([])

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleImageClick = async (item) => {
    setSelectedItem(item)
    // Increment view count in Firestore (would need real implementation)
  }

  return (
    <div class="pt-16 min-h-screen">
      {/* Header */}
      <div class="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-16 z-40">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 class="text-2xl font-display font-bold">Gallery</h1>
            
            <div class="flex items-center gap-4">
              {/* Search */}
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                />
              </div>

              {/* View Toggle */}
              <div class="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  class={`p-2 rounded ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  class={`p-2 rounded ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div class="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div class="flex items-center justify-center py-20">
            <Loader2 class="animate-spin text-indigo-500" size={32} />
          </div>
        ) : (
          <motion.div 
            layout
            class={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  class={`group relative ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                >
                  <div 
                    class={`${viewMode === 'grid' ? 'aspect-[4/3]' : 'w-48 h-32'} rounded-xl overflow-hidden bg-zinc-900 cursor-pointer`}
                    onClick={() => handleImageClick(item)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                      <h3 class="font-semibold">{item.title}</h3>
                      <p class="text-sm text-zinc-400">{item.artist}</p>
                    </div>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWishlist(item.id)
                    }}
                    class="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                  >
                    <Heart 
                      size={18} 
                      class={wishlist.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}
                    />
                  </button>

                  {/* Stats (List view) */}
                  {viewMode === 'list' && (
                    <div class="flex-1 flex items-center justify-between">
                      <div>
                        <h3 class="font-semibold text-lg">{item.title}</h3>
                        <p class="text-zinc-400">{item.artist}</p>
                      </div>
                      <div class="flex items-center gap-4 text-sm text-zinc-500">
                        <span class="flex items-center gap-1">
                          <Eye size={14} />
                          {item.views.toLocaleString()}
                        </span>
                        <span class="flex items-center gap-1">
                          <Heart size={14} />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div class="text-center py-20">
            <p class="text-zinc-500 text-lg">No artworks found</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            class="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              class="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                class="max-w-full max-h-[80vh] rounded-xl"
              />
              <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                <h3 class="text-xl font-semibold">{selectedItem.title}</h3>
                <p class="text-zinc-400">{selectedItem.artist}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                class="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
