import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowRight, Sparkles, Play, Film, Code, 
  Palette, Bot, Zap, Layers, Users, ChevronDown,
  ExternalLink, Twitter, Github, Mail
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const works = [
  {
    id: '1',
    title: 'Neural Dreams',
    type: 'AI Film',
    year: '2026',
    image: 'https://picsum.photos/seed/neural/800/600',
    description: 'Exploring the intersection of human creativity and machine intelligence',
  },
  {
    id: '2',
    title: 'Post Labor Chronicles',
    type: 'Documentary',
    year: '2025',
    image: 'https://picsum.photos/seed/postlab/800/600',
    description: 'A vision of work in the age of autonomous agents',
  },
  {
    id: '3',
    title: 'Synthetic Horizons',
    type: 'Interactive',
    year: '2025',
    image: 'https://picsum.photos/seed/synthetic/800/600',
    description: 'Generative art experience powered by real-time AI',
  },
]

const services = [
  {
    icon: Film,
    title: 'AI Film Production',
    description: 'End-to-end cinematic production with AI augmentation',
  },
  {
    icon: Code,
    title: 'Creative Development',
    description: 'Web apps, tools, and interactive experiences',
  },
  {
    icon: Palette,
    title: 'Visual Design',
    description: 'Brand identity, motion graphics, and visual systems',
  },
  {
    icon: Bot,
    title: 'AI Integration',
    description: 'Autonomous agents and intelligent automation',
  },
]

export default function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div class="pt-16">
      {/* Hero */}
      <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div class="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-orange-950/20" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.08),transparent_60%)]" />
        
        {/* Film grain overlay */}
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />

        <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              class="text-amber-500/80 text-sm tracking-[0.4em] uppercase mb-6 font-medium"
            >
              Kyle Touchet
            </motion.p>

            <h1 class="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-[0.9]">
              <span class="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 bg-clip-text text-transparent">
                AI Film Maker
              </span>
              <br />
              <span class="text-zinc-500 text-3xl md:text-5xl font-light">
                Creative Technologist
              </span>
              <br />
              <span class="text-zinc-600 text-2xl md:text-4xl font-light">
                Post Labor Futurist
              </span>
            </h1>
            
            <p class="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Building the future of creative intelligence. 
              Films, tools, apps, and autonomous agents — 
              all spun up by AI, powered by vision.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/gallery"
                class="group flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
              >
                <Play size={20} class="group-hover:scale-110 transition-transform" />
                Watch Gallery
                <ArrowRight class="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <Link
                to="/services"
                class="flex items-center gap-3 px-8 py-4 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 rounded-full text-lg font-medium transition-all"
              >
                <Zap size={18} />
                Services
              </Link>
            </div>

            {/* Logged in state */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                class="inline-flex items-center gap-3 px-4 py-2 bg-zinc-900/80 rounded-full border border-zinc-800"
              >
                <img 
                  src={profile?.photoURL || user.photoURL || '/default-avatar.png'} 
                  alt="Avatar"
                  class="w-6 h-6 rounded-full"
                />
                <span class="text-sm text-zinc-400">
                  Welcome back, {profile?.displayName || 'Creator'}
                </span>
                {profile && (
                  <span class="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {profile.credits} credits
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          class="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            class="flex flex-col items-center gap-2 text-zinc-600"
          >
            <span class="text-xs tracking-widest">SCROLL</span>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* Gallery Preview */}
      <section class="py-32 px-4">
        <div class="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="flex items-end justify-between mb-12"
          >
            <div>
              <h2 class="text-3xl md:text-4xl font-display font-bold mb-2">
                Featured Work
              </h2>
              <p class="text-zinc-500">Films, experiments, and explorations</p>
            </div>
            <Link
              to="/gallery"
              class="hidden md:flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div class="grid md:grid-cols-3 gap-6">
            {works.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                class="group cursor-pointer"
              >
                <div class="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 mb-4">
                  <img
                    src={work.image}
                    alt={work.title}
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="w-14 h-14 rounded-full bg-amber-600/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={24} class="text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-xs text-zinc-500 mb-1">
                  <span>{work.type}</span>
                  <span>•</span>
                  <span>{work.year}</span>
                </div>
                <h3 class="text-xl font-semibold group-hover:text-amber-400 transition-colors">
                  {work.title}
                </h3>
                <p class="text-sm text-zinc-500 mt-1">{work.description}</p>
              </motion.div>
            ))}
          </div>

          <Link
            to="/gallery"
            class="md:hidden flex items-center justify-center gap-2 mt-8 text-amber-500"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Services */}
      <section class="py-32 px-4 bg-zinc-900/30">
        <div class="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="text-center mb-16"
          >
            <h2 class="text-3xl md:text-4xl font-display font-bold mb-4">
              <span class="text-amber-500">◆</span> What I Do
            </h2>
            <p class="text-zinc-400 max-w-xl mx-auto">
              From concept to creation — I build immersive experiences 
              that push the boundaries of what's possible.
            </p>
          </motion.div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                class="group p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/30 transition-all hover:bg-zinc-900/60"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon class="text-amber-400" size={24} />
                </div>
                <h3 class="text-lg font-semibold mb-2 group-hover:text-amber-200 transition-colors">
                  {service.title}
                </h3>
                <p class="text-zinc-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            class="text-center mt-12"
          >
            <Link
              to="/services"
              class="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Full Service List <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Kaito CTA */}
      <section class="py-32 px-4">
        <div class="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800"
          >
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Bot size={32} class="text-white" />
            </div>
            <h2 class="text-2xl font-display font-bold mb-3">
              Meet Kaito
            </h2>
            <p class="text-zinc-400 mb-6 max-w-md mx-auto">
              Your AI concierge. Ask me anything about Kyle's work, 
              get recommendations, or spin up new tools — 
              all powered by autonomous agents.
            </p>
            
            {user ? (
              <Link
                to="/kaito"
                class="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-full font-medium transition-colors"
              >
                <Sparkles size={18} />
                Chat with Kaito
              </Link>
            ) : (
              <button
                onClick={() => navigate('/profile')}
                class="inline-flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-full font-medium transition-colors"
              >
                Sign In to Chat
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer class="py-12 px-4 border-t border-zinc-800">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <span class="text-zinc-500">© 2026 Kyle Touchet</span>
          </div>
          
          <div class="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="text-zinc-500 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="text-zinc-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="mailto:hello@kyle.ai" class="text-zinc-500 hover:text-white transition-colors">
              <Mail size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
