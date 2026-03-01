import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { Users, Settings, BarChart3, Database, Shield, Crown, Lock, Key, Wallet, Code, Cloud, Trash2, Edit } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'

export default function Admin() {
  const { user, isAdmin, isOwner, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

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

  const ownerSections = [
    {
      icon: Crown,
      title: 'Owner Controls',
      description: 'Full site ownership controls',
      color: 'amber',
      items: [
        { icon: Key, label: 'Manage Ownership', action: 'ownership' },
        { icon: Wallet, label: 'Wallet Management', action: 'wallet' },
        { icon: Cloud, label: 'Cloud Functions', action: 'cloud' },
        { icon: Code, label: 'API Keys & Secrets', action: 'secrets' },
      ]
    },
    {
      icon: Database,
      title: 'Database',
      description: 'Direct database operations',
      color: 'rose',
      items: [
        { icon: Edit, label: 'Edit Any Document', action: 'edit-db' },
        { icon: Trash2, label: 'Delete Data', action: 'delete-db' },
      ]
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'owner', label: 'Owner Controls', requires: 'owner' },
    { id: 'users', label: 'Users' },
    { id: 'settings', label: 'Settings' },
  ]

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
        <div class="flex gap-2 mb-8 border-b border-zinc-800 pb-4">
          {tabs.map((tab) => (
            (!tab.requires || (tab.requires === 'owner' && isOwner)) && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
              {ownerSections.map((section) => (
                <div
                  key={section.title}
                  class="p-6 bg-zinc-900 rounded-xl border border-zinc-800"
                >
                  <div class="flex items-center gap-3 mb-4">
                    <div class={`w-10 h-10 rounded-lg bg-${section.color}-500/20 flex items-center justify-center`}>
                      <section.icon class={`text-${section.color}-400`} size={20} />
                    </div>
                    <div>
                      <h3 class="font-semibold">{section.title}</h3>
                      <p class="text-xs text-zinc-500">{section.description}</p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-left text-sm text-zinc-300 hover:text-white transition-colors"
                      >
                        <item.icon size={16} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 class="text-xl font-semibold mb-4">User Management</h3>
            <p class="text-zinc-400">View and manage users, roles, and permissions.</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 class="text-xl font-semibold mb-4">Site Settings</h3>
            <p class="text-zinc-400">Configure site title, theme, and general settings.</p>
          </div>
        )}
      </div>
    </div>
  )
}
