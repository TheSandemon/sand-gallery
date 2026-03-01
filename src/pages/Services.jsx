import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, Film, Code, Palette, Bot, Zap, 
  Cloud, Megaphone, Layout, ChevronRight,
  Check, Clock, Star
} from 'lucide-react'

const services = [
  {
    icon: Film,
    title: 'AI Film Production',
    description: 'End-to-end cinematic production with AI augmentation. From concept to final cut, we leverage cutting-edge AI tools to create stunning visual narratives.',
    features: [
      'Script analysis & AI storyboarding',
      'Generative pre-visualization',
      'AI-assisted editing & color grading',
      'Synthetic voice & sound design',
      'Neural texture generation',
    ],
    starting: 'From $5,000',
    timeline: '4-12 weeks',
  },
  {
    icon: Code,
    title: 'Creative Development',
    description: 'Web apps, interactive experiences, and custom tools built with AI integration. Perfect for prototypes to production.',
    features: [
      'AI-powered web applications',
      'Real-time generative experiences',
      'Autonomous agent systems',
      'API integration & automation',
      'Custom LLM fine-tuning',
    ],
    starting: 'From $2,500',
    timeline: '2-8 weeks',
  },
  {
    icon: Palette,
    title: 'Visual Design',
    description: 'Brand identity, motion graphics, and visual systems that push the envelope. AI-enhanced creative direction.',
    features: [
      'AI-generated concept art',
      'Motion graphics & animation',
      'Brand identity systems',
      'Generative design systems',
      'AR/VR visual design',
    ],
    starting: 'From $1,500',
    timeline: '1-4 weeks',
  },
  {
    icon: Bot,
    title: 'AI Integration',
    description: 'Deploy autonomous agents and intelligent automation for your business. From chatbots to complex agent swarms.',
    features: [
      'Custom AI agent development',
      'Workflow automation',
      'Knowledge base integration',
      'Multi-model orchestration',
      'Analytics & monitoring',
    ],
    starting: 'From $3,000',
    timeline: '3-6 weeks',
  },
  {
    icon: Cloud,
    title: 'Infrastructure & DevOps',
    description: 'Scalable cloud architecture for AI-powered applications. We build the foundations for intelligent systems.',
    features: [
      'Cloud architecture design',
      'ML pipeline setup',
      'GPU instance management',
      'Security & compliance',
      '24/7 monitoring',
    ],
    starting: 'From $2,000',
    timeline: '1-3 weeks',
  },
  {
    icon: Megaphone,
    title: 'AI Consulting',
    description: 'Strategic guidance on integrating AI into your creative process or business. Expert advice from a practitioner.',
    features: [
      'AI readiness assessment',
      'Tool & platform selection',
      'Team training & workshops',
      'Process optimization',
      'ROI analysis',
    ],
    starting: '$500/day',
    timeline: 'Flexible',
  },
]

const process = [
  {
    step: '01',
    title: 'Discovery',
    description: 'We talk about your vision, goals, and constraints. No jargon, just creative problem-solving.',
  },
  {
    step: '02',
    title: 'Proposal',
    description: 'Detailed scope, timeline, and pricing. Transparent, no hidden surprises.',
  },
  {
    step: '03',
    title: 'Creation',
    description: 'Iterative development with regular checkpoints. You\'re involved every step.',
  },
  {
    step: '04',
    title: 'Delivery',
    description: 'Final output with full documentation. Plus ongoing support when you need it.',
  },
]

export default function Services() {
  return (
    <div class="pt-20 min-h-screen">
      {/* Header */}
      <div class="px-4 py-16">
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
            Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            class="text-xl text-zinc-400 max-w-2xl"
          >
            From concept to creation — custom solutions for the age of AI. 
            Whatever you need, we can build it.
          </motion.p>
        </div>
      </div>

      {/* Services Grid */}
      <div class="px-4 pb-24">
        <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              class="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/30 transition-all"
            >
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-4">
                <service.icon class="text-amber-400" size={28} />
              </div>
              
              <h3 class="text-2xl font-display font-semibold mb-3">{service.title}</h3>
              <p class="text-zinc-400 mb-6 leading-relaxed">{service.description}</p>

              <div class="space-y-2 mb-6">
                {service.features.slice(0, 3).map(feature => (
                  <div key={feature} class="flex items-center gap-2 text-sm text-zinc-300">
                    <Check size={14} class="text-amber-500 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
                {service.features.length > 3 && (
                  <p class="text-xs text-zinc-500">+{service.features.length - 3} more</p>
                )}
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div class="flex items-center gap-2 text-sm text-zinc-500">
                  <Clock size={14} />
                  {service.timeline}
                </div>
                <div class="text-amber-400 font-medium">
                  {service.starting}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div class="px-4 py-20 bg-zinc-900/30">
        <div class="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            class="text-center mb-12"
          >
            <h2 class="text-3xl font-display font-bold mb-4">How It Works</h2>
            <p class="text-zinc-400">Simple, transparent, collaborative.</p>
          </motion.div>

          <div class="grid md:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                class="relative"
              >
                <div class="text-6xl font-display font-bold text-amber-500/20 mb-4">
                  {step.step}
                </div>
                <h3 class="text-xl font-semibold mb-2">{step.title}</h3>
                <p class="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                {index < process.length - 1 && (
                  <ChevronRight class="hidden md:block absolute -right-3 top-8 text-zinc-700" size={20} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="px-4 py-24">
        <div class="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 class="text-3xl font-display font-bold mb-4">
              Ready to Create?
            </h2>
            <p class="text-zinc-400 mb-8">
              Tell me about your project and let's make something amazing.
            </p>
            <Link
              to="/profile"
              class="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-full text-lg font-semibold transition-all hover:scale-105"
            >
              Let's Talk
              <ChevronRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
