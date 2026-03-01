import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Wand2, Zap, Palette, Layers } from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'AI Generation',
    description: 'Create stunning visuals with cutting-edge AI models',
  },
  {
    icon: Palette,
    title: 'Visual Editor',
    description: 'Drag-drop page building - no code required',
  },
  {
    icon: Layers,
    title: 'Collections',
    description: 'Organize, curate, and showcase your work',
  },
]

export default function Home() {
  return (
    <div class="pt-16">
      {/* Hero Section */}
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div class="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-orange-950/20" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.1),transparent_50%)]" />
        
        {/* Animated Grid */}
        <div 
          class="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          class="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          class="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-orange-500/5 blur-3xl"
        />

        <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              class="text-amber-400/80 text-sm tracking-[0.3em] uppercase mb-4 font-medium"
            >
              Where creativity meets intelligence
            </motion.p>

            <h1 class="text-6xl md:text-8xl font-display font-bold mb-8 leading-tight">
              <span class="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 bg-clip-text text-transparent">
                Sand
              </span>
              <br />
              <span class="text-4xl md:text-5xl font-light text-zinc-400">
                Gallery
              </span>
            </h1>
            
            <p class="text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
              A powerful visual platform with AI generation, 
              built-in page editor, and seamless payments.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/gallery"
                class="group flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-full text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-amber-600/20"
              >
                <Sparkles size={20} class="group-hover:rotate-12 transition-transform" />
                Enter Gallery
                <ArrowRight class="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <Link
                to="/editor"
                class="flex items-center gap-3 px-8 py-4 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 rounded-full text-lg font-medium transition-all"
              >
                <Wand2 size={18} />
                Open Editor
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          class="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            class="w-6 h-10 rounded-full border border-zinc-700 flex items-start justify-center p-2"
          >
            <motion.div class="w-1 h-2 bg-zinc-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section class="py-28 px-4">
        <div class="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="text-center mb-16"
          >
            <h2 class="text-3xl md:text-4xl font-display font-bold mb-4">
              <span class="text-amber-500">◆</span> Built Different
            </h2>
          </motion.div>

          <div class="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                class="group p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/30 transition-all hover:bg-zinc-900/60"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon class="text-amber-400" size={24} />
                </div>
                <h3 class="text-xl font-semibold mb-2 group-hover:text-amber-200 transition-colors">{feature.title}</h3>
                <p class="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-20 px-4">
        <div class="max-w-2xl mx-auto text-center">
          <p class="text-zinc-500 mb-6">Ready to create?</p>
          <Link
            to="/editor"
            class="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Start Building <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
