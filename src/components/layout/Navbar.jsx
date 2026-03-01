import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import { Menu, X, User, LogOut, Bot, Gamepad2, Wrench, Settings } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/games', label: 'Games', icon: Gamepad2 },
  { path: '/tools', label: 'Tools', icon: Wrench },
]

const adminLink = { path: '/admin', label: 'Admin', icon: Settings }

export default function Navbar() {
  const { user, profile, logout, isOwner } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const allLinks = isOwner ? [...navLinks, adminLink] : navLinks

  return (
    <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" class="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center"
            >
              <span class="text-white font-bold text-lg">K</span>
            </motion.div>
            <span class="font-display font-semibold text-lg hidden sm:block">Kyle Touchet</span>
          </Link>

          {/* Desktop Nav */}
          <div class="hidden md:flex items-center gap-6">
            {allLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                class={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.icon && <link.icon size={14} />}
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            {user ? (
              <div class="flex items-center gap-3">
                <Link
                  to="/kaito"
                  class={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    location.pathname === '/kaito'
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Bot size={14} />
                  Kaito
                </Link>
                <Link
                  to="/profile"
                  class="flex items-center gap-2"
                >
                  <img
                    src={profile?.photoURL || user.photoURL || '/default-avatar.png'}
                    alt={profile?.displayName || user.displayName}
                    class="w-8 h-8 rounded-full border border-zinc-700"
                  />
                </Link>
              </div>
            ) : (
              <Link
                to="/profile"
                class="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-full text-sm font-medium transition-colors"
              >
                <User size={16} />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            class="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          class="md:hidden border-t border-zinc-800"
        >
          <div class="px-4 py-4 space-y-3">
            {allLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                class={`flex items-center gap-2 py-2 ${
                  location.pathname === link.path ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.icon && <link.icon size={16} />}
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/kaito"
                onClick={() => setMobileOpen(false)}
                class="flex items-center gap-2 py-2 text-amber-400"
              >
                <Bot size={16} /> Kaito
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              class="block py-2 text-zinc-400 hover:text-white"
            >
              {user ? 'Profile' : 'Sign In'}
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}
