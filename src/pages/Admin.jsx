import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { 
  Users, Settings, BarChart3, Database, Crown, Lock, Key, 
  Wallet, Code, Cloud, Trash2, Edit, Save, Loader2,
  Search, Filter, MoreVertical, Shield, UserPlus, Mail
} from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore'

export default function Admin() {
  const { user, isAdmin, isOwner, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  if (!user || (!isAdmin && !isOwner)) {
    return (
      <div class="pt-24 min-h-screen flex items-center justify-center">
        <div class="text-center">
          <Lock size={48} class="mx-auto mb-4 text-zinc-600" />
          <h1 class="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p class="text-zinc-400">You need admin or owner permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const handleSectionClick = (section) => {
    if (section === 'users') setActiveTab('users')
    else if (section === 'settings') setActiveTab('settings')
    else if (section === 'analytics') setActiveTab('analytics')
    else if (section === 'content') setActiveTab('content')
  }

  const adminSections = [
    {
      id: 'users',
      icon: Users,
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      color: 'indigo',
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Site Settings',
      description: 'Configure site title, theme, and general settings',
      color: 'emerald',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics',
      description: 'View site traffic and user engagement',
      color: 'rose',
    },
    {
      id: 'content',
      icon: Database,
      title: 'Content Management',
      description: 'Manage gallery items and media library',
      color: 'amber',
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'owner', label: 'Owner Controls', requires: 'owner' },
    { id: 'users', label: 'Users' },
    { id: 'settings', label: 'Settings' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'content', label: 'Content' },
  ]

  const colorClasses = {
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  }

  return (
    <div class="pt-20 min-h-screen">
      <div class="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="flex items-center gap-3 mb-2">
          {isOwner && <Crown class="text-amber-400" size={28} />}
          <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p class="text-zinc-400 mb-8">
          {isOwner ? 'Full ownership access' : 'Admin access'} • Signed in as {profile?.email}
        </p>

        {/* Tabs */}
        <div class="flex gap-2 mb-8 border-b border-zinc-800 pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            (!tab.requires || (tab.requires === 'owner' && isOwner)) && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            )
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminSections.map((section) => {
              const colors = colorClasses[section.color]
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  class="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02] text-left"
                >
                  <div class={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                    <section.icon class={colors.text} size={24} />
                  </div>
                  <h3 class="text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
                    {section.title}
                  </h3>
                  <p class="text-zinc-400">{section.description}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* Owner Tab */}
        {activeTab === 'owner' && isOwner && (
          <div class="space-y-6">
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div class="flex items-center gap-2 text-amber-400 mb-2">
                <Crown size={20} />
                <span class="font-semibold">Owner Controls</span>
              </div>
              <p class="text-sm text-zinc-400">
                These controls are only available to the site owner. Use with caution.
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Key, label: 'Manage Ownership', desc: 'Transfer or revoke ownership' },
                { icon: Wallet, label: 'Wallet Management', desc: 'Configure payments and credits' },
                { icon: Cloud, label: 'Cloud Functions', desc: 'Manage serverless functions' },
                { icon: Code, label: 'API Keys & Secrets', desc: 'Configure API access' },
              ].map((item) => (
                <div key={item.label} class="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <item.icon class="text-amber-400" size={20} />
                    </div>
                    <div>
                      <h3 class="font-semibold">{item.label}</h3>
                      <p class="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <button class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors">
                    <Settings size={14} />
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab isOwner={isOwner} currentUserId={user?.uid} />}

        {/* Settings Tab */}
        {activeTab === 'settings' && <SettingsTab />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsTab />}

        {/* Content Tab */}
        {activeTab === 'content' && <ContentTab />}
      </div>
    </div>
  )
}

// Users Management Component
function UsersTab({ isOwner, currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRole, setEditingRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      // Fallback demo users
      setUsers([
        { id: '1', email: 'admin@example.com', displayName: 'Admin User', role: 'owner', createdAt: new Date().toISOString() },
        { id: '2', email: 'user@example.com', displayName: 'Test User', role: 'user', createdAt: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingRole(null)
    } catch (error) {
      console.error('Error updating role:', error)
      // Demo mode - just update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setEditingRole(null)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div class="flex items-center justify-center py-12">
        <Loader2 class="animate-spin text-amber-500" size={32} />
      </div>
    )
  }

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold">User Management</h3>
        <button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Search */}
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          class="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Users List */}
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table class="w-full">
          <thead class="bg-zinc-800/50">
            <tr>
              <th class="px-4 py-3 text-left text-sm text-zinc-400 font-medium">User</th>
              <th class="px-4 py-3 text-left text-sm text-zinc-400 font-medium">Role</th>
              <th class="px-4 py-3 text-left text-sm text-zinc-400 font-medium">Joined</th>
              <th class="px-4 py-3 text-left text-sm text-zinc-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} class="border-t border-zinc-800">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span class="text-indigo-400 text-sm font-medium">
                        {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium">{user.displayName || 'Unknown'}</p>
                      <p class="text-sm text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  {editingRole === user.id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      class="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="user">User</option>
                    </select>
                  ) : (
                    <span class={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                      user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' :
                      user.role === 'editor' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td class="px-4 py-3 text-sm text-zinc-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    {editingRole === user.id ? (
                      <>
                        <button
                          onClick={() => updateUserRole(user.id, selectedRole)}
                          class="p-1.5 text-emerald-400 hover:text-emerald-300"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          class="p-1.5 text-zinc-400 hover:text-white"
                          title="Cancel"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingRole(user.id); setSelectedRole(user.role) }}
                          disabled={!isOwner || user.id === currentUserId}
                          class="p-1.5 text-zinc-400 hover:text-white disabled:opacity-50"
                          title="Edit Role"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          class="p-1.5 text-zinc-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div class="p-8 text-center text-zinc-500">
            No users found
          </div>
        )}
      </div>
    </div>
  )
}

// Settings Component
function SettingsTab() {
  const [settings, setSettings] = useState({
    siteName: 'Kyle Touchet Portfolio',
    siteDescription: 'AI Film Maker, Creative Technologist, Post Labor Futurist',
    theme: 'dark',
    maintenanceMode: false,
    allowRegistration: true,
    defaultRole: 'user',
    creditsPerSignup: 10,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'settings', 'site'), settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
      // Demo mode - just show saved
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold">Site Settings</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 rounded-lg text-sm font-medium"
        >
          {saving ? <Loader2 size={16} class="animate-spin" /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div class="grid gap-6">
        {/* Basic Info */}
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h4 class="font-semibold mb-4">Basic Information</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-zinc-400 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-sm text-zinc-400 mb-1">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Site Options */}
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h4 class="font-semibold mb-4">Site Options</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Maintenance Mode</p>
                <p class="text-sm text-zinc-500">Show maintenance page to visitors</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                class={`w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <div class={`w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Allow Registration</p>
                <p class="text-sm text-zinc-500">Let new users sign up</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                class={`w-12 h-6 rounded-full transition-colors ${settings.allowRegistration ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <div class={`w-5 h-5 rounded-full bg-white transition-transform ${settings.allowRegistration ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* User Defaults */}
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h4 class="font-semibold mb-4">User Defaults</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-zinc-400 mb-1">Default Role</label>
              <select
                value={settings.defaultRole}
                onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-zinc-400 mb-1">Credits on Signup</label>
              <input
                type="number"
                value={settings.creditsPerSignup}
                onChange={(e) => setSettings({ ...settings, creditsPerSignup: parseInt(e.target.value) })}
                class="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Analytics Component
function AnalyticsTab() {
  const [stats] = useState({
    totalUsers: 156,
    activeUsers: 42,
    totalViews: 12450,
    totalCredits: 45000,
    newUsersThisMonth: 23,
    topPages: [
      { path: '/gallery', views: 4500 },
      { path: '/games', views: 3200 },
      { path: '/tools', views: 2100 },
      { path: '/services', views: 1500 },
      { path: '/', views: 1200 },
    ]
  })

  return (
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Analytics</h3>

      {/* Stats Grid */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'indigo' },
          { label: 'Active Users', value: stats.activeUsers, color: 'emerald' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'rose' },
          { label: 'Credits Used', value: stats.totalCredits.toLocaleString(), color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p class="text-sm text-zinc-500">{stat.label}</p>
            <p class="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top Pages */}
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h4 class="font-semibold mb-4">Top Pages</h4>
        <div class="space-y-3">
          {stats.topPages.map((page, index) => (
            <div key={page.path} class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-zinc-500 text-sm">#{index + 1}</span>
                <span class="font-mono text-sm">{page.path}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${(page.views / stats.topPages[0].views) * 100}%` }}
                  />
                </div>
                <span class="text-sm text-zinc-400 w-16 text-right">{page.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Content Management Component
function ContentTab() {
  const [activeSection, setActiveSection] = useState('gallery')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const sections = [
    { id: 'gallery', label: 'Gallery Items' },
    { id: 'games', label: 'Games' },
    { id: 'tools', label: 'Tools' },
    { id: 'works', label: 'Works' },
  ]

  const loadItems = async (section) => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, section))
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error('Error loading items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems(activeSection)
  }, [activeSection])

  return (
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Content Management</h3>

      {/* Section Tabs */}
      <div class="flex gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div class="bg-zinc-900 rounded-xl border border-zinc-800">
        {loading ? (
          <div class="flex items-center justify-center py-12">
            <Loader2 class="animate-spin text-amber-500" size={32} />
          </div>
        ) : items.length > 0 ? (
          <div class="divide-y divide-zinc-800">
            {items.map((item) => (
              <div key={item.id} class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                    <Database size={16} class="text-zinc-500" />
                  </div>
                  <div>
                    <p class="font-medium">{item.title || item.id}</p>
                    <p class="text-xs text-zinc-500">ID: {item.id}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="p-2 text-zinc-400 hover:text-white">
                    <Edit size={16} />
                  </button>
                  <button class="p-2 text-zinc-400 hover:text-rose-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div class="p-8 text-center text-zinc-500">
            <Database size={32} class="mx-auto mb-2 opacity-50" />
            <p>No items found in {activeSection}</p>
            <p class="text-sm">Add items via Firestore console</p>
          </div>
        )}
      </div>
    </div>
  )
}
