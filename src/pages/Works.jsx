import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, ArrowLeft, Calendar, Film, Sparkles, ExternalLink } from 'lucide-react'

const allWorks = [
  {
    id: '1',
    title: 'Neural Dreams',
    type: 'AI Film',
    year: '2026',
    duration: '8:24',
    image: 'https://picsum.photos/seed/neural/1200/675',
    thumbnail: 'https://picsum.photos/seed/neural/800/450',
    description: 'Exploring the intersection of human creativity and machine intelligence. A journey through synthetic landscapes and emotional landscapes.',
    tools: ['Runway', 'Midjourney', 'ComfyUI', 'DaVinci'],
    link: '#',
  },
  {
    id: '2',
    title: 'Post Labor Chronicles',
    type: 'Documentary',
    year: '2025',
    duration: '24:15',
    image: 'https://picsum.photos/seed/postlab/1200/675',
    thumbnail: 'https://picsum.photos/seed/postlab/800/450',
    description: 'A vision of work in the age of autonomous agents. Interviews with AI researchers, ethicists, and workers.',
    tools: ['ElevenLabs', 'Pika', 'Premiere'],
    link: '#',
  },
  {
    id: '3',
    title: 'Synthetic Horizons',
    type: 'Interactive',
    year: '2025',
    duration: '∞',
    image: 'https://picsum.photos/seed/synthetic/1200/675',
    thumbnail: 'https://picsum.photos/seed/synthetic/800/450',
    description: 'Generative art experience powered by real-time AI. Visitors shape the narrative through their presence.',
    tools: ['Three.js', 'TensorFlow.js', 'Custom LLMs'],
    link: '#',
  },
  {
    id: '4',
    title: 'Echoes of Tomorrow',
    type: 'Short Film',
    year: '2024',
    duration: '12:30',
    image: 'https://picsum.photos/seed/echoes/1200/675',
    thumbnail: 'https://picsum.photos/seed/echoes/800/450',
    description: 'A time-bending narrative about memory and prediction. Shot on location in Tokyo.',
    tools: ['Blender', 'After Effects', 'Topaz'],
    link: '#',
  },
  {
    id: '5',
    title: 'Data Garden',
    type: 'Installation',
    year: '2024',
    duration: 'Ongoing',
    image: 'https://picsum.photos/seed/datagarden/1200/675',
    thumbnail: 'https://picsum.photos/seed/datagarden/800/450',
    description: 'Physical installation where plants grow based on cryptocurrency patterns. Shown at Ars Electronica.',
    tools: ['Arduino', 'Python', 'Raspberry Pi'],
    link: '#',
  },
  {
    id: '6',
    title: 'Voice of the Void',
    type: 'Audio Visual',
    year: '2023',
    duration: '45:00',
    image: 'https://picsum.photos/seed/void/1200/675',
    thumbnail: 'https://picsum.photos/seed/void/800/450',
    description: 'Immersive audio experience generated from space data. Best experienced with headphones.',
    tools: ['TouchDesigner', 'WebAudio API', 'NASA APIs'],
    link: '#',
  },
]

const categories = ['All', 'AI Film', 'Documentary', 'Interactive', 'Short Film', 'Installation', 'Audio Visual']

export default function Works() {
  const [filter, setFilter] = useState('All')
  const [selectedWork, setSelectedWork] = useState(null)

  const filteredWorks = filter === 'All' 
    ? allWorks 
    : allWorks.filter(w => w.type === filter)

  return (
    <div class="pt-20 min-h-screen">
      {/* Header */}
      <div class="px-4 py-12">
        <div class="max-w-6xl mx-auto">
          <Link 
            to="/" 
            class="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </Link>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            class="text-4xl md:text-6xl font-display font-bold mb-4"
          >
            Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            class="text-xl text-zinc-400 max-w-2xl"
          >
            Films, installations, and experiments exploring the boundaries 
            of creative intelligence.
          </motion.p>
        </div>
      </div>

      {/* Filters */}
      <div class="px-4 mb-12">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                class={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === cat 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Works Grid */}
      <div class="px-4 pb-24">
        <div class="max-w-6xl mx-auto">
          <motion.div 
            layout
            class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredWorks.map((work, index) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                class="group cursor-pointer"
                onClick={() => setSelectedWork(work)}
              >
                <div class="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-4">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-amber-600/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={28} class="text-white ml-1" fill="white" />
                    </div>
                  </div>
                  {work.type === 'Interactive' && (
                    <div class="absolute top-3 right-3 px-2 py-1 bg-emerald-600/90 rounded text-xs font-medium">
                      Interactive
                    </div>
                  )}
                </div>
                <div class="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                  <span>{work.type}</span>
                  <span>•</span>
                  <span>{work.year}</span>
                  {work.duration !== '∞' && (
                    <>
                      <span>•</span>
                      <span>{work.duration}</span>
                    </>
                  )}
                </div>
                <h3 class="text-xl font-semibold group-hover:text-amber-400 transition-colors">
                  {work.title}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Work Detail Modal */}
      {selectedWork && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          class="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setSelectedWork(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            class="relative max-w-5xl w-full max-h-[90vh] overflow-auto bg-zinc-950 rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Video/Image */}
            <div class="relative aspect-video bg-zinc-900">
              <img
                src={selectedWork.image}
                alt={selectedWork.title}
                class="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedWork(null)}
                class="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div class="p-8">
              <div class="flex items-start justify-between gap-4 mb-4">
                <h2 class="text-3xl font-display font-bold">{selectedWork.title}</h2>
                <a 
                  href={selectedWork.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  View <ExternalLink size={14} />
                </a>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-6">
                <span class="flex items-center gap-1">
                  <Film size={14} /> {selectedWork.type}
                </span>
                <span class="flex items-center gap-1">
                  <Calendar size={14} /> {selectedWork.year}
                </span>
                <span>{selectedWork.duration}</span>
              </div>

              <p class="text-zinc-300 leading-relaxed mb-6">
                {selectedWork.description}
              </p>

              <div>
                <p class="text-sm text-zinc-500 mb-2">Tools Used:</p>
                <div class="flex flex-wrap gap-2">
                  {selectedWork.tools.map(tool => (
                    <span 
                      key={tool}
                      class="px-3 py-1 bg-zinc-900 rounded-full text-sm text-zinc-300"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
