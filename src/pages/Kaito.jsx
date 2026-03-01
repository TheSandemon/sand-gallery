import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Sparkles, Send, Bot, User, ArrowLeft, 
  Loader2, Copy, Check, Zap, Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Kaito's system prompt
const KAITO_SYSTEM = `You are Kaito, an AI concierge for Kyle Touchet's creative portfolio. 

Kyle Touchet is an AI Film Maker, Creative Technologist, and Post Labor Futurist based in New Orleans. He builds:
- AI-enhanced films and documentaries
- Creative tools and web applications
- Autonomous agent systems
- Interactive installations

You have access to tools to help users:
- Generate images (via AI services)
- Search the web
- Answer questions about Kyle's work
- Recommend services based on user needs

Keep responses concise, friendly, and helpful. You can be a bit witty. Always stay on brand as Kyle's digital ambassador.

Current capabilities:
- General conversation about Kyle and his work
- Service recommendations
- Portfolio exploration guidance

Note: You're still learning and have limited credits. Be honest about limitations.`

export default function Kaito() {
  const { user, profile, useCredits } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm Kaito, Kyle's AI concierge. I can tell you about his work, help you find what you're looking for, or just chat. What would you like to know?`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const messagesEndRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/profile')
    }
  }, [user, loading, navigate])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Check credits
      if (profile && profile.credits < 5) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Looks like you're running low on credits (${profile.credits} left). Want to top up? Head to your profile to add more!` 
        }])
        setLoading(false)
        return
      }

      // Simulate AI response (in production, this would call the x402 endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate response based on input
      let response = generateResponse(userMessage)
      
      // Deduct credits (mock)
      // await useCredits(5)
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Oops! Something went wrong. Can you try again?` 
      }])
    } finally {
      setLoading(false)
    }
  }

  // Simple response generator
  const generateResponse = (query) => {
    const q = query.toLowerCase()
    
    if (q.includes('film') || q.includes('work') || q.includes('portfolio')) {
      return `Kyle's film work is incredible! Highlights include:

• **Neural Dreams** (2026) - An AI-generated exploration of machine creativity
• **Post Labor Chronicles** (2025) - Documentary about AI and the future of work
• **Synthetic Horizons** (2025) - Interactive generative art experience

Want me to show you more details?`
    }
    
    if (q.includes('service') || q.includes('price') || q.includes('cost') || q.includes('hire')) {
      return `Kyle offers several services:

• **AI Film Production** - From $5,000
• **Creative Development** - From $2,500  
• **Visual Design** - From $1,500
• **AI Integration** - From $3,000

Which one interests you? I can connect you directly!`
    }
    
    if (q.includes('who are you') || q.includes('about you') || q.includes('what are you')) {
      return `I'm Kaito! Kyle's digital concierge. Think of me as your guide to everything Kyle's built. I'm here to:

• Tell you about his work
• Help you find what you need
• Recommend services
• Chat about creative tech

I'm still learning, so bear with me! 😊`
    }
    
    if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
      return `Great question! You can reach Kyle at:

• **Email**: hello@kyle.ai
• **Twitter**: @kyletouchet
• **GitHub**: github.com/thesandemon

Or just tell me what you're looking for and I can help connect you!`
    }
    
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hey! 👋 Great to meet you. What would you like to know about Kyle and his work?`
    }
    
    // Default response
    return `That's a great question! Here's what I know:

Kyle is an **AI Film Maker** and **Creative Technologist** building the future of creative intelligence. He makes films, tools, apps, and autonomous agents.

Want to know more about his work, services, or just chat? I'm here for it!`
  }

  if (!user) {
    return (
      <div class="pt-24 min-h-screen flex items-center justify-center">
        <div class="text-center">
          <Loader2 class="animate-spin mx-auto mb-4 text-amber-500" size={32} />
          <p class="text-zinc-400">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <div class="pt-16 h-screen flex flex-col">
      {/* Header */}
      <div class="px-4 py-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div class="max-w-3xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Link 
              to="/" 
              class="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Bot size={20} class="text-white" />
              </div>
              <div>
                <h1 class="font-semibold">Kaito</h1>
                <p class="text-xs text-zinc-500">AI Concierge</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">
              {profile?.credits || 0} credits
            </div>
            <button class="p-2 text-zinc-400 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div class="flex-1 overflow-auto px-4 py-6">
        <div class="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                class={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div class={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'assistant' 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                    : 'bg-zinc-800'
                }`}>
                  {msg.role === 'assistant' ? (
                    <Bot size={16} class="text-white" />
                  ) : (
                    <User size={16} class="text-zinc-400" />
                  )}
                </div>
                
                <div class={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div class={`inline-block p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-zinc-900 text-zinc-100'
                  }`}>
                    <p class="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div class="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleCopy(msg.content, index)}
                        class="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        title="Copy"
                      >
                        {copied === index ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              class="flex gap-3"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Bot size={16} class="text-white" />
              </div>
              <div class="bg-zinc-900 p-4 rounded-2xl">
                <div class="flex gap-1">
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    class="w-2 h-2 rounded-full bg-zinc-500"
                  />
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    class="w-2 h-2 rounded-full bg-zinc-500"
                  />
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    class="w-2 h-2 rounded-full bg-zinc-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div class="px-4 py-4 border-t border-zinc-800 bg-zinc-950/50">
        <div class="max-w-3xl mx-auto">
          <div class="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything..."
              disabled={loading}
              class="w-full px-4 py-3 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg transition-colors"
            >
              {loading ? (
                <Loader2 size={18} class="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          
          <p class="text-xs text-zinc-600 text-center mt-2">
            <Zap size={12} class="inline mr-1" />
            AI responses use credits. You have {profile?.credits || 0} remaining.
          </p>
        </div>
      </div>
    </div>
  )
}
