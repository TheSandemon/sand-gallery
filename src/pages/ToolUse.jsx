import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Code, Image, MessageSquare, Search, Terminal, Sparkles, Calculator, FileText, Mail, Globe, Database, Bot, Video, Mic, Palette, Cpu } from 'lucide-react'

// Extended tool configurations with more variety
const toolConfigs = {
  // Code tools
  'code-assistant': {
    name: 'Code Assistant',
    icon: Code,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'AI-powered code review and optimization',
    inputPlaceholder: 'Paste your code here for review...',
    process: (input) => {
      const lines = input.split('\n').length
      const chars = input.length
      const hasFunction = input.includes('function') || input.includes('const ') || input.includes('let ')
      return {
        output: `## Code Analysis\n\n**Stats:** ${lines} lines, ${chars} characters\n\n**Suggestions:**\n- ${hasFunction ? 'Good use of functions detected!' : 'Consider extracting code into functions for better organization'}\n- Check for any hardcoded credentials\n- Ensure proper error handling is in place\n- Consider adding JSDoc comments\n\n**Security Check:** ${input.includes('password') || input.includes('apiKey') ? '⚠️ Potential sensitive data detected!' : '✅ No obvious security issues found'}\n\n**Optimization:** Your code looks ${lines > 50 ? 'substantial' : 'concise'}! Consider using const/let instead of var.`
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
      const hasMethod = input.match(/(GET|POST|PUT|DELETE|PATCH)/i)
      const hasAuth = input.includes('Authorization') || input.includes('Bearer') || input.includes('token')
      return {
        output: `## API Analysis\n\n${hasUrl ? '✅ **Endpoint detected:** Analyzing...' : '📝 **Input analyzed**'}\n\n### Request Details\n\n- **HTTP Method:** ${hasMethod ? hasMethod[0] : 'Not detected - specify GET/POST/PUT/DELETE'}\n- **Authentication:** ${hasAuth ? '✅ Auth headers found' : '⚠️ No auth detected - may need API key'}\n- **URL Pattern:** ${hasUrl ? 'Valid URL structure' : 'Invalid - include https://'}\n\n### Suggestions\n\n1. **Headers** - Include \`Content-Type: application/json\`\n2. **Authentication** - Use Bearer token: \`Authorization: Bearer YOUR_TOKEN\`\n3. **Error handling** - Add try/catch blocks\n4. **Timeout** - Set reasonable timeout (30s)\n\n### Example Request\n\`\`\`bash\ncurl -X ${hasMethod ? hasMethod[0] : 'GET'} "${hasUrl ? input.match(/https?:\/\/[^\s]+/)?.[0] || 'https://api.example.com' : 'https://api.example.com/endpoint'}" \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Content-Type: application/json"\n\`\`\``
      }
    }
  },
  'sql-builder': {
    name: 'SQL Builder',
    icon: Database,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'Build and optimize SQL queries',
    inputPlaceholder: 'Describe what data you need (e.g., "get all users who signed up last month")...',
    process: (input) => {
      const lower = input.toLowerCase()
      let query = 'SELECT * FROM '
      let table = 'table_name'
      
      if (lower.includes('user')) table = 'users'
      else if (lower.includes('order')) table = 'orders'
      else if (lower.includes('product')) table = 'products'
      
      query += table
      
      if (lower.includes('where') || lower.includes('filter') || lower.includes('who')) {
        query += '\nWHERE '
        if (lower.includes('last month')) query += "created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)"
        else if (lower.includes('active')) query += 'status = \'active\''
        else if (lower.includes('recent')) query += 'created_at >= NOW() - INTERVAL 7 DAY'
        else query += '1=1 -- add your conditions'
      }
      
      if (lower.includes('order') || lower.includes('sort')) {
        query += '\nORDER BY created_at DESC'
      }
      
      if (lower.includes('limit')) {
        query += '\nLIMIT 100'
      }
      
      return {
        output: `## SQL Query Builder\n\n**Generated Query:**\n\n\`\`\`sql\n${query}\n\`\`\`\n\n### Query Explanation\n\n- **SELECT** - Retrieves data from ${table}\n- **WHERE** - Filters results based on conditions\n- **ORDER BY** - Sorts results (DESC = newest first)\n- **LIMIT** - Restricts number of results\n\n### Pro Tips\n\n1. Always specify columns instead of * for better performance\n2. Add indexes on frequently filtered columns\n3. Use parameterized queries to prevent SQL injection\n4. Consider pagination for large datasets`
      }
    }
  },
  
  // Image tools
  'image-generator': {
    name: 'Image Generator',
    icon: Image,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Create images from text prompts',
    inputPlaceholder: 'Describe the image you want to generate...',
    process: (input) => {
      const seed = encodeURIComponent(input.slice(0, 20))
      const styles = ['photorealistic', 'oil painting', 'digital art', 'anime', 'watercolor']
      const style = styles[Math.floor(Math.random() * styles.length)]
      return {
        output: `## Generated Image\n\n![AI Generated Image](https://picsum.photos/seed/${seed}/800/600)\n\n*Image generated from prompt: "${input}"*\n\n**Style:** ${style}\n**Resolution:** 800x600\n\n### Prompt Optimization Tips\n\n- Add specific adjectives: "beautiful, detailed, vibrant"\n- Specify lighting: "golden hour, soft lighting, neon"\n- Include art references: "in the style of [artist]"\n- Mention mood: "mysterious, peaceful, chaotic"\n\n**Note:** This is a demo. In production, connect to DALL-E, Midjourney, or Stable Diffusion API.`
      }
    }
  },
  'image-editor': {
    name: 'Image Editor',
    icon: Palette,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    description: 'Edit and enhance images with AI',
    inputPlaceholder: 'Describe the edit you want (e.g., "remove background", "add sunset")...',
    process: (input) => {
      const seed = encodeURIComponent(input.slice(0, 15))
      return {
        output: `## Image Editor\n\n![Edited Image](https://picsum.photos/seed/${seed}edit/800/600)\n\n**Edit Request:** "${input}"\n\n### Available Operations\n\n1. **Background Removal** - Extract subject from background\n2. **Style Transfer** - Apply artistic styles\n3. **Color Grading** - Adjust tones and moods\n4. **Object Removal** - Remove unwanted elements\n5. **Upscaling** - Increase resolution without quality loss\n\n**Status:** Demo mode - Connect to backend API for full functionality.`
      }
    }
  },
  
  // Text tools
  'content-writer': {
    name: 'Content Writer',
    icon: MessageSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'AI writing assistant for any content',
    inputPlaceholder: 'What would you like to write about?',
    process: (input) => {
      const types = ['blog post', 'social media', 'email', 'product description']
      const selectedType = types[Math.floor(Math.random() * types.length)]
      return {
        output: `## AI Writing for: "${input}"\n\n### ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Outline\n\n**Introduction** (2-3 sentences)\nHook the reader with a surprising fact or question related to "${input}"\n\n**Main Body** (3-4 paragraphs)\n1. Explain the core concept with examples\n2. Provide actionable insights\n3. Address common misconceptions\n4. Include relevant statistics or studies\n\n**Conclusion** (1-2 sentences)\nSummarize key takeaways and include a call to action\n\n### Suggested Title\n"${input}: The Complete Guide for Beginners"\n\n### Hashtags\n#${input.replace(/\s+/g, '')} #${selectedType.replace(/\s+/g, '')} #AI #Innovation\n\n*Note: This is a demo. Connect to GPT API for full content generation.*`
      }
    }
  },
  'email-generator': {
    name: 'Email Writer',
    icon: Mail,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    description: 'Draft professional emails instantly',
    inputPlaceholder: 'What type of email do you need? (e.g., "follow up with client", "request meeting")',
    process: (input) => {
      const lower = input.toLowerCase()
      let tone = 'professional'
      if (lower.includes('friend') || lower.includes('casual')) tone = 'friendly'
      if (lower.includes('angry') || lower.includes('complaint')) tone = 'assertive'
      
      return {
        output: `## Email Draft\n\n**Type:** ${input}\n**Tone:** ${tone}\n\n### Subject Line\nRe: ${input.charAt(0).toUpperCase() + input.slice(1)}\n\n### Email Body\n\nDear [Name],\n\n${tone === 'professional' ? 'I hope this email finds you well.' : 'Hope you\'re doing great!'}\n\n[Write your main message here about ${input}]\n\n${tone === 'professional' ? 'Please let me know if you have any questions.' : 'Would love to hear your thoughts!'}\n\nBest regards,\n[Your Name]\n\n### Tips\n- Replace [Name] and [Your Name] with actual names\n- Adjust the body to match your specific needs\n- Proofread before sending`
      }
    }
  },
  'summarizer': {
    name: 'Text Summarizer',
    icon: FileText,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    description: 'Condense long text into key points',
    inputPlaceholder: 'Paste text to summarize...',
    process: (input) => {
      const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const wordCount = input.split(/\s+/).length
      const summaryLength = Math.min(3, Math.ceil(sentences.length / 3))
      
      return {
        output: `## Text Summary\n\n**Original:** ${wordCount} words → **Summary:** ~${summaryLength * 20} words\n\n### Key Points\n\n${sentences.slice(0, summaryLength).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}\n\n### Statistics\n\n- **Total Sentences:** ${sentences.length}\n- **Word Count:** ${wordCount}\n- **Compression Ratio:** ${Math.round((summaryLength * 20 / wordCount) * 100)}%\n\n### Reading Time\n${Math.ceil(wordCount / 200)} minutes → ${Math.ceil((summaryLength * 20) / 200)} minutes`
      }
    }
  },
  
  // Search tools
  'research-search': {
    name: 'Research Search',
    icon: Search,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'Deep web search with citations',
    inputPlaceholder: 'What would you like to research?',
    process: (input) => {
      return {
        output: `## Search Results for: "${input}"\n\n### Top Sources\n\n1. **Wikipedia** - General overview and history\n2. **Academic Papers** - Peer-reviewed research (Google Scholar)\n3. **Industry Reports** - Market analysis and trends\n4. **News Articles** - Recent developments\n\n### Quick Summary\n\nThis topic covers several key areas:\n- Historical context and evolution\n- Current state and trends\n- Future predictions and implications\n- Related concepts and terminology\n\n### Recommended Search Terms\n\n- "${input} history"\n- "${input} latest news"  \n- "${input} research paper"\n- "${input} statistics 2024"\n\n*Note: This is a demo. Connect to web search API for live results.*`
      }
    }
  },
  'fact-checker': {
    name: 'Fact Checker',
    icon: Check,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'Verify claims and facts',
    inputPlaceholder: 'Enter a claim to verify (e.g., "The Earth is flat")',
    process: (input) => {
      const isTrue = !input.toLowerCase().includes('flat') && !input.toLowerCase().includes('fake')
      return {
        output: `## Fact Check: "${input}"\n\n### Verdict: ${isTrue ? '✅ LIKELY TRUE' : '❌ FALSE'}\n\n### Analysis\n\n${isTrue 
  ? 'This claim appears to be supported by evidence. However, always verify with multiple sources.'
  : 'This claim contradicts established facts. See sources below.'
}\n\n### Sources to Verify\n\n1. **Primary Sources** - Original research or data\n2. **Peer-Reviewed** - Academic journals\n3. **Government Data** - Official statistics\n4. **News Outlets** - Reputable journalism\n\n### Tips\n\n- Check the date (older info may be outdated)\n- Look for author credibility\n- Cross-reference multiple sources\n- Be wary of confirmation bias`
      }
    }
  },
  
  // Developer tools
  'data-analyzer': {
    name: 'Data Analyzer',
    icon: Calculator,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'Get AI insights from your data',
    inputPlaceholder: 'Paste your data or describe your dataset...',
    process: (input) => {
      const words = input.split(/\s+/).filter(w => w.length > 0)
      const numbers = input.match(/\d+/g) || []
      return {
        output: `## Data Analysis\n\n### Dataset Overview\n\n- **Total entries:** ${words.length} words/tokens\n- **Numbers detected:** ${numbers.length}\n- **Format:** Text data detected\n\n### AI Insights\n\n1. **Data Quality:** Text-based content detected. For better analysis, consider structured formats (CSV, JSON).\n2. **Numeric Data:** ${numbers.length > 0 ? `Found ${numbers.length} numbers. Range: ${Math.min(...numbers.map(Number))} - ${Math.max(...numbers.map(Number))}` : 'No numeric data found'}\n3. **Patterns:** ${words.length > 100 ? 'Substantial text - may contain patterns' : 'Short text - limited pattern detection'}\n\n### Recommendations\n\n- Add column headers for tabular data\n- Include timestamps for time-series analysis\n- Consider adding categories for classification\n- Export to CSV for structured analysis\n\n*Note: This is a demo. Connect to Python/analysis backend for full functionality.*`
      }
    }
  },
  'regex-builder': {
    name: 'Regex Builder',
    icon: Code,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    description: 'Build regular expressions easily',
    inputPlaceholder: 'Describe the pattern you need (e.g., "email address", "phone number")',
    process: (input) => {
      const lower = input.toLowerCase()
      let pattern = '.*'
      let explanation = ''
      
      if (lower.includes('email')) {
        pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
        explanation = 'Matches standard email format: user@domain.com'
      } else if (lower.includes('phone') || lower.includes('number')) {
        pattern = '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}'
        explanation = 'Matches US phone numbers in various formats'
      } else if (lower.includes('url') || lower.includes('link')) {
        pattern = 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+'
        explanation = 'Matches HTTP/HTTPS URLs'
      } else if (lower.includes('date')) {
        pattern = '\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4}'
        explanation = 'Matches dates in YYYY-MM-DD or MM/DD/YYYY format'
      } else {
        pattern = 'your-pattern-here'
        explanation = 'Custom pattern needed'
      }
      
      return {
        output: `## Regex Pattern for: "${input}"\n\n### Pattern\n\n\`\`\`regex\n${pattern}\n\`\`\`\n\n### Explanation\n\n${explanation}\n\n### Quick Reference\n\n| Token | Meaning |\n|-------|---------|\n| \\d | Any digit (0-9) |\n| \\w | Word character |\n| . | Any character |\n| * | Zero or more |\n| + | One or more |\n| ? | Optional |\n| [] | Character class |\n| () | Group |\n| | | Alternation |\n\n### Test String\n\n\`\`\`\ntest@example.com\n(555) 123-4567\nhttps://example.com/page\n2024-01-15\n\`\`\``
      }
    }
  },
  'json-formatter': {
    name: 'JSON Formatter',
    icon: Braces,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    description: 'Format, validate and minify JSON',
    inputPlaceholder: 'Paste your JSON here...',
    process: (input) => {
      try {
        const parsed = JSON.parse(input)
        const formatted = JSON.stringify(parsed, null, 2)
        const minified = JSON.stringify(parsed)
        const keys = Object.keys(parsed)
        
        return {
          output: `## JSON Analysis\n\n### ✅ Valid JSON\n\n**Formatted:**\n\`\`\`json\n${formatted.slice(0, 500)}${formatted.length > 500 ? '\n// ... (truncated)' : ''}\n\`\`\`\n\n**Minified:** ${minified.length} characters\n\n**Top-level keys:** ${keys.join(', ')}\n\n### Statistics\n\n- **Keys:** ${keys.length}\n- **Size:** ${minified.length} bytes\n- **Depth:** ${formatted.split('\n').length} lines`
        }
      } catch (e) {
        return {
          output: `## JSON Error\n\n### ❌ Invalid JSON\n\n**Error:** ${e.message}\n\n### Common Issues\n\n1. **Missing quotes** - Keys must be in double quotes\n2. **Trailing commas** - Not allowed in JSON\n3. **Single quotes** - Use double quotes only\n4. **Comments** - JSON doesn't support comments\n\n### Quick Fix\n\nTry wrapping your content in \`{}\` if it's a single object, or \`[]\` for an array.`
        }
      }
    }
  },
  
  // AI tools
  'chatbot': {
    name: 'AI Chatbot',
    icon: Bot,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    description: 'Chat with AI about anything',
    inputPlaceholder: 'Ask me anything...',
    process: (input) => {
      const responses = [
        `That's an interesting question about "${input}". Let me think...\n\nBased on my knowledge, this topic involves several key aspects. Would you like me to elaborate on any specific part?`,
        `Great question! Here's what I know about "${input}":\n\nThis is a broad topic with many facets. What specific angle would you like to explore?`,
        `I'd be happy to help with "${input}". Here's a quick overview:\n\n[AI would provide context-specific information here]\n\nWould you like more details on any particular aspect?`
      ]
      return {
        output: responses[Math.floor(Math.random() * responses.length)]
      }
    }
  },
  
  // Video/Audio tools
  'video-ideas': {
    name: 'Video Ideas',
    icon: Video,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    description: 'Generate video content ideas',
    inputPlaceholder: 'What topic do you want to make a video about?',
    process: (input) => {
      return {
        output: `## Video Ideas for: "${input}"\n\n### Content Concepts\n\n1. **"The Ultimate Guide to ${input}"**\n   - Format: Tutorial/How-to\n   - Length: 15-20 minutes\n   - Hook: "Everything you need to know about ${input}"\n\n2. **"${input} Mistakes You're Probably Making"**\n   - Format: List/Clickbait\n   - Length: 8-12 minutes\n   - Hook: Common pitfalls and how to avoid them\n\n3. **"${input} vs The Competition"**\n   - Format: Comparison\n   - Length: 10-15 minutes\n   - Hook: Which is better?\n\n### Thumbnail Ideas\n\n- Close-up of key element with bold text\n- Before/after comparison\n- Emotional reaction shot\n- Number overlay (e.g., "5 Ways...")\n\n### SEO Tags\n\n#${input.replace(/\s+/g, '')} #Tutorial #Education #${new Date().getFullYear()}`
      }
    }
  },
  'script-writer': {
    name: 'Video Script Writer',
    icon: FileText,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    description: 'Write video scripts with AI',
    inputPlaceholder: 'What is your video about?',
    process: (input) => {
      return {
        output: `## Video Script: "${input}"\n\n### Hook (0:00-0:15)\n\n[Opening visual: Eye-catching B-roll]\n\n"Hey everyone! Today we're diving into ${input}. By the end of this video, you'll know everything you need to get started. Let's go!"\n\n### Intro (0:15-0:30)\n\n"My name is [Name], and I help people with ${input}. If that's what you're looking for, make sure to subscribe and hit that bell!"\n\n### Main Content (0:30-[X:00])\n\n**Point 1:** [Key concept]\n- Explanation\n- Example\n- Visual demonstration\n\n**Point 2:** [Next key concept]\n- Explanation  \n- Example\n- Visual demonstration\n\n**Point 3:** [Final key concept]\n- Explanation\n- Example\n\n### Conclusion ([X:00]-[X:30])\n\n"So that's everything you need to know about ${input}. If you found this helpful, give it a thumbs up and subscribe for more!\n\nWhat topics should I cover next? Let me know in the comments!"\n\n### CTA\n\n- Subscribe button\n- Like button\n- Comment prompt\n- Related video link`
      }
    }
  }
}

// Add Braces icon import fix
const Braces = Code

// Default fallback tool
const defaultTool = {
  name: 'AI Tool',
  icon: Sparkles,
  color: 'text-amber-400',
  bgColor: 'bg-amber-500/20',
  description: 'AI-powered tool',
  inputPlaceholder: 'Enter your input...',
  process: (input) => ({ 
    output: `## Result\n\nProcessed: "${input}"\n\nThis tool is under development. Check back soon for full functionality!` 
  })
}

// Tool name to ID mapping (for fuzzy matching)
const toolNameToId = {
  'code assistant': 'code-assistant',
  'image generator': 'image-generator',
  'content writer': 'content-writer',
  'research search': 'research-search',
  'api debugger': 'api-debugger',
  'data analyzer': 'data-analyzer',
  'sql builder': 'sql-builder',
  'email generator': 'email-generator',
  'summarizer': 'summarizer',
  'regex builder': 'regex-builder',
  'json formatter': 'json-formatter',
  'chatbot': 'chatbot',
  'video ideas': 'video-ideas',
  'script writer': 'script-writer',
  'image editor': 'image-editor',
  'fact checker': 'fact-checker'
}

export default function ToolUse() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Resolve tool from URL or name
  const getTool = () => {
    if (!toolId) return { ...defaultTool, name: 'Select a Tool' }
    
    // Direct match
    if (toolConfigs[toolId]) {
      return { ...toolConfigs[toolId], id: toolId }
    }
    
    // Fuzzy match
    const normalized = toolId.toLowerCase().replace(/[^a-z0-9]/g, '-')
    if (toolConfigs[normalized]) {
      return { ...toolConfigs[normalized], id: normalized }
    }
    
    // Name match
    for (const [key, value] of Object.entries(toolNameToId)) {
      if (toolId.toLowerCase().includes(key)) {
        return { ...toolConfigs[value], id: value }
      }
    }
    
    // Default
    return { 
      ...defaultTool, 
      name: toolId?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Tool',
      id: toolId
    }
  }
  
  const tool = getTool()
  const Icon = tool.icon

  const handleProcess = () => {
    if (!input.trim()) return
    setLoading(true)
    
    // Simulate processing delay
    setTimeout(() => {
      const result = tool.process(input)
      setOutput(result.output)
      setLoading(false)
    }, 800)
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
