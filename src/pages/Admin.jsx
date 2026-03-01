import { useAuth } from '../contexts/AuthContext'
import { Users, Settings, BarChart3, Database, Shield } from 'lucide-react'

export default function Admin() {
  const { user, isAdmin } = useAuth()

  if (!user || !isAdmin) {
    return (
      <div class="pt-24 min-h-screen flex items-center justify-center">
        <div class="text-center">
          <Shield size={48} class="mx-auto mb-4 text-zinc-600" />
          <h1 class="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p class="text-zinc-400">You need admin permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const adminSections = [
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '#',
      color: 'indigo',
    },
    {
      icon: Settings,
      title: 'Site Settings',
      description: 'Configure site title, theme, and general settings',
      href: '#',
      color: 'emerald',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View site traffic and user engagement',
      href: '#',
      color: 'rose',
    },
    {
      icon: Database,
      title: 'Content Management',
      description: 'Manage gallery items and media library',
      href: '#',
      color: 'amber',
    },
  ]

  return (
    <div class="pt-20 min-h-screen">
      <div class="max-w-6xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p class="text-zinc-400 mb-8">Manage your site and users</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section) => (
            <a
              key={section.title}
              href={section.href}
              class="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02]"
            >
              <div class={`w-12 h-12 rounded-xl bg-${section.color}-500/20 flex items-center justify-center mb-4`}>
                <section.icon class={`text-${section.color}-400`} size={24} />
              </div>
              <h3 class="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                {section.title}
              </h3>
              <p class="text-zinc-400">{section.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
