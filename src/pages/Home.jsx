import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Generate and edit images with cutting-edge AI',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed and performance',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Your data protected with enterprise-grade security',
  },
]

export default function Home() {
  return (
    <div class="pt-16">
      {/* Hero Section */}
      <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-zinc-950 to-rose-950/30" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        
        {/* Grid Pattern */}
        <div 
          class="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div class="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 class="text-5xl md:text-7xl font-display font-bold mb-6">
              <span class="gradient-text">Sand Gallery</span>
            </h1>
            <p class="text-xl md:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              A powerful visual platform with AI generation, 
              <br class="hidden md:block" />
              built-in editor, and seamless payments.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/gallery"
                class="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full text-lg font-semibold transition-all hover:scale-105"
              >
                Explore Gallery
                <ArrowRight class="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/editor"
                class="flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-zinc-600 rounded-full text-lg font-medium transition-colors"
              >
                Open Editor
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          class="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            class="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2"
          >
            <motion.div class="w-1 h-2 bg-zinc-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section class="py-24 px-4">
        <div class="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="text-center mb-16"
          >
            <h2 class="text-3xl md:text-4xl font-display font-bold mb-4">
              Built Different
            </h2>
            <p class="text-zinc-400 text-lg">
              Everything you need to create and manage your visual content
            </p>
          </motion.div>

          <div class="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                class="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center mb-4">
                  <feature.icon class="text-indigo-400" size={24} />
                </div>
                <h3 class="text-xl font-semibold mb-2">{feature.title}</h3>
                <p class="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
