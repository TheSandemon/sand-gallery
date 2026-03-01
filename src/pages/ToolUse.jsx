import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Code, Image, MessageSquare, Search, Terminal, Sparkles } from 'lucide-react'

const toolConfigs = {
  'code-assistant': {
    name: 'Code Assistant',
    icon: Code,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'AI-powered code review and optimization',
    inputPlaceholder: 'Paste your code here for review...',
    process: (input) => {
      // Simple code analysis simulation
      const lines = input.split('\n').length
      const chars = input.length
      return {
        output: `## Code Analysis\n\n**Stats:** ${lines} lines, ${chars} characters\n\n**Suggestions:**\n- Consider adding comments to improve readability\n- Check for any hardcoded credentials\n- Ensure proper error handling is in place\n- Consider extracting repetitive code into functions\n\n**Optimization:** Your code looks clean! Consider using const/let instead of var for better scoping.`
      }
    }
  },
  'image-generator': {
    name: 'Image Generator',
    icon: Image,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Create images from text prompts',
    inputPlaceholder: 'Describe the image you want to generate...',
    process: (input) => {
      // Return a placeholder image URL (in production, this would call an API)
      const seed = encodeURIComponent(input.slice(0, 20))
      return {
        output: `## Generated Image\n\n![AI Generated Image](https://picsum.photos/seed/${seed}/800/600)\n\n*Image generated from prompt: "${input}"*\n\n**Note:** This is a demo. In production, connect to DALL-E, Midjourney, or Stable Diffusion API.`
      }
    }
  },
  'content-writer': {
    name: 'Content Writer',
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'AI writing assistant for any content',
    inputPlaceholder: 'What would you like to write about?',
    process: (input) => {
      return {
        output: `## AI Writing Suggestion for: "${input}"\n\n### Blog Post Outline\n\n1. **Introduction** - Hook the reader with a surprising fact or question\n2. **Main Point 1** - Explain the core concept with examples\n3. **Main Point 2** - Provide actionable insights\n4. **Main Point 3** - Address common misconceptions\n5. **Conclusion** - Summarize key takeaways and call to action\n\n### Suggested Title\n"${input}: The Complete Guide for Beginners"\n\n*Note: This is a demo. Connect to GPT API for full content generation.*`
      }
    }
  },
  'research-search': {
    name: 'Research Search',
    icon: Search,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'Deep web search with citations',
    inputPlaceholder: 'What would you like to research?',
    process: (input) => {
      return {
        output: `## Search Results for: "${input}"\n\n### Top Sources\n\n1. **Wikipedia** - General overview and history\n2. **Academic Papers** - Peer-reviewed research\n3. **Industry Reports** - Market analysis and trends\n\n### Quick Summary\n\nThis topic covers several key areas. For accurate, up-to-date information, I recommend checking recent publications and verified sources.\n\n*Note: This is a demo. Connect to web search API for live results.*`
      }
    }
  },
  'api-debugger': {
    name: 'API Debugger',
    icon: Terminal,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    description: 'Test and debug APIs with AI help',
    inputPlaceholder: 'Enter API endpoint or paste request...',
    process: (input) => {
      const hasUrl = input.includes('http')
      return {
        output: `## API Analysis\n\n${hasUrl ? '**Endpoint detected:** Analyzing...' : '**Input analyzed**'}\n\n### Suggestions\n\n1. **Check HTTP method** - Ensure GET/POST/PUT/DELETE is correct\n2. **Headers** - Include Content-Type: application/json\n3. **Authentication** - Verify Bearer token or API key\n4. **Error handling** - Add try/catch blocks\n\n### Example Request\n\`\`\`bash\ncurl -X GET "https://api.example.com/endpoint" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json"\n\`\`\`\n\n*Note: This is a demo.*`
      }
    }
  },
  'data-analyzer': {
    name: 'Data Analyzer',
    icon: Search,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'Get AI insights from your data',
    inputPlaceholder: 'Paste your data or describe your dataset...',
    process: (input) => {
      const words = input.split(/\s+/).filter(w => w.length > 0).length
      return {
        output: `## Data Analysis\n\n### Dataset Overview\n\n- **Total entries:** ${words} words detected\n- **Format:** Text data detected\n\n### AI Insights\n\n1. **Data Quality:** Data appears to be text-based. Consider structured formats like CSV or JSON for better analysis.\n2. **Patterns:** No obvious patterns detected in initial scan\n3. **Recommendations:**\n   - Add column headers for tabular data\n   - Include timestamps for time-series analysis\n   - Consider adding categories for classification\n\n*Note: This is a demo. Connect to Python/analysis backend for full functionality.*`
      }
    }
  }
}

// Default fallback tool
const defaultTool = {
  name: 'AI Tool',
  icon: Sparkles,
  color: 'text-amber-400',
  bgColor: 'bg-amber-500/20',
  description: 'AI-powered tool',
  inputPlaceholder: 'Enter your input...',
  process: (input) => ({ output: `Processed: ${input}\n\nThis tool is under development.` })
}

export default function ToolUse() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const tool = toolConfigs[toolId] || { ...defaultTool, name: toolId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }
  const Icon = tool.icon

  const handleProcess = () => {
    if (!input.trim()) return
    setLoading(true)
    
    // Simulate processing delay
    setTimeout(() => {
      const result = tool.process(input)
      setOutput(result.output)
      setLoading(false)
    }, 1000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleProcess()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-20 px-4 pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button 
            onClick={() => navigate('/tools')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Tools</span>
          </button>
        </motion.div>

        {/* Tool Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-6"
        >
          <div className={`w-16 h-16 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
            <Icon className={tool.color} size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tool.name}</h1>
            <p className="text-zinc-500">{tool.description}</p>
          </div>
        </motion.div>

        {/* Input Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tool.inputPlaceholder}
            className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none font-mono text-sm"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-zinc-600">Ctrl+Enter to submit</span>
            <button 
              onClick={handleProcess}
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Output Area */}
        {output && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <span className="text-sm text-zinc-500">Output</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-4 text-zinc-300 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
              {output}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!output && !loading && (
          <div className="text-center py-12 text-zinc-600">
            <Icon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Enter some input and click Generate to see results</p>
          </div>
        )}
      </div>
    </div>
  )
}
