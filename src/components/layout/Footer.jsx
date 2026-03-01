import { Link } from 'react-router-dom'
import { Github, Twitter } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer class="border-t border-zinc-800 bg-zinc-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
              <span class="text-white text-xs font-bold">S</span>
            </div>
            <span class="text-sm text-zinc-500">
              © {currentYear} Sand Gallery. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div class="flex items-center gap-6">
            <Link to="/gallery" class="text-sm text-zinc-400 hover:text-white transition-colors">
              Gallery
            </Link>
            <a 
              href="https://github.com/TheSandemon" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-zinc-400 hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
