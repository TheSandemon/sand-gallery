import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wrench, Sparkles, Play, Star, Clock, Zap, Brain, Code, Image, MessageSquare, Search, Terminal, Loader2, ExternalLink } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

// Fallback categories
const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Wrench },
  { id: 'code', name: 'Code', icon: Code },
  { id: 'image', name: 'Image', icon: Image },
  { id: 'text', name: 'Text', icon: MessageSquare },
  { id: 'search', name: 'Search', icon: Search },
  { id: 'dev', name: 'Developer', icon: Terminal },
]

// Fallback tools when Firestore is empty
const FALLBACK_TOOLS = [
  {
    id: 'code-assistant',
    title: 'Code Assistant',
    description: 'AI-powered code review, optimization, and bug detection. Get suggestions in real-time.',
    category: 'code',
    icon: 'https://picsum.photos/seed/codeasst/100/100',
    status: 'ready',
    uses: 1247,
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Create stunning images from text prompts. Choose from multiple art styles.',
    category: 'image',
    icon: 'https://picsum.photos/seed/imggen/100/100',
    status: 'ready',
    uses: 892,
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    description: 'AI writing assistant for blogs, emails, social posts, and creative writing.',
    category: 'text',
    icon: 'https://picsum.photos/seed/contentw/100/100',
    status: 'ready',
    uses: 2103,
  },
  {
    id: 'research-search',
    title: 'Research Search',
    description: 'Deep web search with source citation and fact-checking. Stay informed.',
    category: 'search',
    icon: 'https://picsum.photos/seed/research/100/100',
    status: 'ready',
    uses: 756,
  },
  {
    id: 'api-debugger',
    title: 'API Debugger',
    description: 'Test, debug, and optimize APIs with AI-powered suggestions and error analysis.',
    category: 'dev',
    icon: 'https://picsum.photos/seed/apidebug/100/100',
    status: 'ready',
    uses: 534,
  },
  {
    id: 'sql-builder',
    title: 'SQL Builder',
    description: 'Build and optimize SQL queries with natural language. No SQL knowledge required.',
    category: 'dev',
    icon: 'https://picsum.photos/seed/sqlbuild/100/100',
    status: 'ready',
    uses: 421,
  },
  {
    id: 'regex-builder',
    title: 'Regex Builder',
    description: 'Build regular expressions easily. Describe what you need and get instant patterns.',
    category: 'dev',
    icon: 'https://picsum.photos/seed/regexbuild/100/100',
    status: 'ready',
    uses: 312,
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Format, validate and minify JSON data. Instant error detection and fixes.',
    category: 'dev',
    icon: 'https://picsum.photos/seed/jsonfmt/100/100',
    status: 'ready',
    uses: 289,
  },
  {
    id: 'email-generator',
    title: 'Email Writer',
    description: 'Draft professional emails instantly. Follow up, request meetings, or send updates.',
    category: 'text',
    icon: 'https://picsum.photos/seed/emailw/100/100',
    status: 'ready',
    uses: 678,
  },
  {
    id: 'summarizer',
    title: 'Text Summarizer',
    description: 'Condense long text into key points. Perfect for articles, documents, and research.',
    category: 'text',
    icon: 'https://picsum.photos/seed/summariz/100/100',
    status: 'ready',
    uses: 445,
  },
  {
    id: 'video-ideas',
    title: 'Video Ideas',
    description: 'Generate video content ideas and thumbnails. Never run out of content ideas.',
    category: 'text',
    icon: 'https://picsum.photos/seed/videoideas/100/100',
    status: 'ready',
    uses: 534,
  },
  {
    id: 'script-writer',
    title: 'Script Writer',
    description: 'Write complete video scripts with hooks, CTAs, and timestamps. Professional quality.',
    category: 'text',
    icon: 'https://picsum.photos/seed/scriptw/100/100',
    status: 'ready',
    uses: 367,
  },
]

export default function Tools() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Subscribe to Firestore tools collection
    const unsubscribe = onSnapshot(doc(db, 'content', 'tools'), (doc) => {
      if (doc.exists() && doc.data()?.items) {
        setTools(doc.data().items)
      } else {
        // Use fallback if Firestore is empty
        setTools(FALLBACK_TOOLS)
      }
      setLoading(false)
    }, (err) => {
      console.error('Firestore error:', err)
      setTools(FALLBACK_TOOLS)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(t => t.category === selectedCategory)

  const getCategoryIcon = (categoryId) => {
    const cat = TOOL_CATEGORIES.find(c => c.id === categoryId)
    return cat?.icon || Wrench
  }

  const handleUseTool = (tool) => {
    if (tool.status === 'ready') {
      const toolId = tool.title.toLowerCase().replace(/\s+/g, '-')
      navigate(`/tools/${toolId}`)
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
            <Wrench class="text-amber-500" size={32} />
            <h1 class="text-3xl font-display font-bold">Tools</h1>
            <span class="text-sm text-zinc-500 ml-2">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available
            </span>
          </motion.div>
          <p class="text-zinc-400 max-w-2xl">
            AI-powered tools created automatically. Code, images, text, and more — updated every 10 minutes.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div class="border-b border-zinc-800 bg-zinc-900/30">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center gap-2 overflow-x-auto">
            {TOOL_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = cat.id === 'all' 
                ? tools.length 
                : tools.filter(t => t.category === cat.id).length
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
          <span class="ml-3 text-zinc-400">Loading tools...</span>
        </div>
      )}

      {/* Tools Grid */}
      {!loading && (
        <div class="max-w-7xl mx-auto px-4 py-8">
          {filteredTools.length > 0 ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => {
                const CategoryIcon = getCategoryIcon(tool.category)
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    class="group bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer"
                    onClick={() => handleUseTool(tool)}
                  >
                    <div class="p-6">
                      <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                          <img
                            src={tool.icon}
                            alt={tool.title}
                            class="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://picsum.photos/seed/defaulttool/100/100'
                            }}
                          />
                        </div>
                        <div class="flex items-center gap-2">
                          {tool.status === 'coming-soon' && (
                            <span class="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                              <Sparkles size={12} />
                              Coming Soon
                            </span>
                          )}
                          {tool.status === 'ready' && (
                            <span class="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                              <Zap size={12} />
                              Ready
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h3 class="font-semibold text-lg mb-2 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        {tool.title}
                        <ExternalLink size={14} class="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p class="text-sm text-zinc-500 mb-4">{tool.description}</p>

                      <div class="pt-4 border-t border-zinc-800 flex items-center justify-between">
                        <span class="text-xs text-zinc-500 flex items-center gap-1">
                          <CategoryIcon size={12} />
                          {TOOL_CATEGORIES.find(c => c.id === tool.category)?.name || tool.category}
                        </span>
                        {tool.uses > 0 && (
                          <span class="text-xs text-zinc-500 flex items-center gap-1">
                            <Play size={12} />
                            {tool.uses.toLocaleString()} uses
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div class="text-center py-16">
              <Wrench size={48} class="mx-auto text-zinc-600 mb-4" />
              <h3 class="text-xl font-semibold mb-2">No tools in this category</h3>
              <p class="text-zinc-500">Check back soon for new AI-powered tools.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
