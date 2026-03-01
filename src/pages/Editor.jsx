import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, Trash2, Move, Image, Type, Square, Video, 
  MousePointer, Layout, Save, Eye, Undo, Redo, Layers
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const COMPONENT_TYPES = [
  { type: 'HeroSection', icon: Layout, label: 'Hero Section' },
  { type: 'GalleryGrid', icon: Image, label: 'Gallery Grid' },
  { type: 'TextBlock', icon: Type, label: 'Text Block' },
  { type: 'ImageBlock', icon: Square, label: 'Image' },
  { type: 'VideoBlock', icon: Video, label: 'Video' },
  { type: 'CTAButton', icon: MousePointer, label: 'Button' },
]

// Default props for each component type
const DEFAULT_PROPS = {
  HeroSection: {
    title: 'New Hero Section',
    subtitle: 'Add your subtitle here',
    ctaText: 'Get Started',
    ctaLink: '/gallery',
    backgroundImage: '',
  },
  GalleryGrid: {
    title: 'Gallery',
    columns: 3,
    showFilters: true,
  },
  TextBlock: {
    content: 'Add your text here...',
    align: 'left',
  },
  ImageBlock: {
    src: 'https://picsum.photos/800/400',
    alt: 'Image',
    caption: '',
  },
  VideoBlock: {
    url: '',
    autoplay: false,
  },
  CTAButton: {
    text: 'Click Here',
    link: '/',
    variant: 'primary',
  },
}

export default function Editor() {
  const { user, isEditor } = useAuth()
  const [components, setComponents] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  if (!user || !isEditor) {
    return (
      <div class="pt-24 min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
          <p class="text-zinc-400">You need to sign in with editor permissions to access the site editor.</p>
        </div>
      </div>
    )
  }

  const addComponent = (type) => {
    const newComponent = {
      id: `comp-${Date.now()}`,
      type,
      props: { ...DEFAULT_PROPS[type] },
    }
    const newComponents = [...components, newComponent]
    setComponents(newComponents)
    saveToHistory(newComponents)
    setSelectedId(newComponent.id)
  }

  const updateComponent = (id, updates) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, props: { ...c.props, ...updates } } : c
    ))
  }

  const deleteComponent = (id) => {
    const newComponents = components.filter(c => c.id !== id)
    setComponents(newComponents)
    saveToHistory(newComponents)
    if (selectedId === id) setSelectedId(null)
  }

  const moveComponent = (index, direction) => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === components.length - 1) return
    
    const newComponents = [...components]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]]
    setComponents(newComponents)
    saveToHistory(newComponents)
  }

  const saveToHistory = (newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newComponents)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setComponents(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setComponents(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  const saveToFirestore = async () => {
    // Save to Firestore - implement with actual Firebase code
    alert('Saved! (Demo)')
  }

  const selected = components.find(c => c.id === selectedId)

  if (previewMode) {
    return (
      <div class="min-h-screen bg-zinc-950">
        <div class="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setPreviewMode(false)}
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
          >
            Exit Preview
          </button>
        </div>
        {components.map(c => (
          <ComponentRenderer key={c.id} component={c} />
        ))}
      </div>
    )
  }

  return (
    <div class="pt-16 min-h-screen flex">
      {/* Left Sidebar - Components */}
      <div class="w-64 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col">
        <h2 class="font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} />
          Components
        </h2>
        <div class="grid grid-cols-2 gap-2">
          {COMPONENT_TYPES.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => addComponent(type)}
              class="flex flex-col items-center gap-1 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <Icon size={20} class="text-indigo-400" />
              <span class="text-xs text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas */}
      <div class="flex-1 flex flex-col">
        {/* Toolbar */}
        <div class="h-14 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between px-4">
          <div class="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              class="p-2 text-zinc-400 hover:text-white disabled:opacity-50"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              class="p-2 text-zinc-400 hover:text-white disabled:opacity-50"
              title="Redo"
            >
              <Redo size={18} />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              class="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={saveToFirestore}
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div class="flex-1 overflow-auto p-8 bg-zinc-900">
          <div class="max-w-4xl mx-auto min-h-[600px] bg-zinc-950 rounded-xl border-2 border-dashed border-zinc-800 p-4">
            {components.length === 0 ? (
              <div class="h-full flex items-center justify-center text-zinc-500">
                <div class="text-center">
                  <Plus size={48} class="mx-auto mb-4 opacity-50" />
                  <p>Click a component to add it to your page</p>
                </div>
              </div>
            ) : (
              <div class="space-y-4">
                {components.map((component, index) => (
                  <div
                    key={component.id}
                    class={`relative group rounded-lg border-2 transition-all ${
                      selectedId === component.id 
                        ? 'border-indigo-500' 
                        : 'border-transparent hover:border-zinc-700'
                    }`}
                    onClick={() => setSelectedId(component.id)}
                  >
                    <div class="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'up') }}
                        class="p-1 text-zinc-500 hover:text-white"
                      >
                        <Move size={14} class="rotate-180" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveComponent(index, 'down') }}
                        class="p-1 text-zinc-500 hover:text-white"
                      >
                        <Move size={14} />
                      </button>
                    </div>
                    <ComponentRenderer component={component} isEditing />
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteComponent(component.id) }}
                      class="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div class="w-72 border-l border-zinc-800 bg-zinc-950 p-4">
        <h2 class="font-semibold mb-4">Properties</h2>
        {selected ? (
          <div class="space-y-4">
            <p class="text-xs text-zinc-500 uppercase tracking-wide">{selected.type}</p>
            {Object.entries(selected.props).map(([key, value]) => (
              <div key={key}>
                <label class="block text-sm text-zinc-400 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {typeof value === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateComponent(selected.id, { [key]: e.target.checked })}
                    class="w-4 h-4 rounded bg-zinc-800 border-zinc-700"
                  />
                ) : typeof value === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateComponent(selected.id, { [key]: Number(e.target.value) })}
                    class="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateComponent(selected.id, { [key]: e.target.value })}
                    class="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p class="text-zinc-500 text-sm">Select a component to edit its properties</p>
        )}
      </div>
    </div>
  )
}

// Component Renderer
function ComponentRenderer({ component, isEditing }) {
  const { type, props } = component

  switch (type) {
    case 'HeroSection':
      return (
        <div class="relative py-20 px-8 text-center bg-gradient-to-br from-indigo-950/50 to-rose-950/50 rounded-xl">
          <h1 class="text-4xl font-display font-bold mb-4">{props.title}</h1>
          <p class="text-xl text-zinc-400 mb-6">{props.subtitle}</p>
          <button class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium">
            {props.ctaText}
          </button>
        </div>
      )
    case 'GalleryGrid':
      return (
        <div class="py-8">
          <h2 class="text-2xl font-bold mb-6">{props.title}</h2>
          <div class="grid gap-4" style={{ gridTemplateColumns: `repeat(${props.columns}, 1fr)` }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} class="aspect-square bg-zinc-800 rounded-lg" />
            ))}
          </div>
        </div>
      )
    case 'TextBlock':
      return (
        <div class={`py-4 ${props.align === 'center' ? 'text-center' : props.align === 'right' ? 'text-right' : 'text-left'}`}>
          <p>{props.content}</p>
        </div>
      )
    case 'ImageBlock':
      return (
        <figure class="py-4">
          <img src={props.src} alt={props.alt} class="w-full rounded-lg" />
          {props.caption && <figcaption class="mt-2 text-sm text-zinc-500 text-center">{props.caption}</figcaption>}
        </figure>
      )
    case 'CTAButton':
      return (
        <div class="py-4 text-center">
          <a href={props.link} class={`inline-block px-6 py-3 rounded-lg font-medium ${
            props.variant === 'primary' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}>
            {props.text}
          </a>
        </div>
      )
    default:
      return <div class="p-4 bg-zinc-800 rounded-lg">Unknown component: {type}</div>
  }
}
