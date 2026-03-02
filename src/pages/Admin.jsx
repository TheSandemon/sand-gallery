import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { Users, Settings, BarChart3, Database, Shield, Crown, Lock, Key, Wallet, Code, Cloud, Trash2, Edit, Search, Plus, Minus, Activity, X, Check, RefreshCw } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

export default function Admin() {
  const { user, isAdmin, isOwner, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingCredits, setEditingCredits] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditAction, setCreditAction] = useState('add')
  const [creditHistory, setCreditHistory] = useState([])
  const [updatingUser, setUpdatingUser] = useState(null)
  const [ownerAction, setOwnerAction] = useState(null)

  // Fetch all users
  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
    setLoadingUsers(false)
  }

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    setUpdatingUser(userId)
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole })
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
    setUpdatingUser(null)
  }

  // Handle credit adjustment
  const handleCreditChange = async () => {
    if (!selectedUser || !creditAmount) return
    const amount = parseInt(creditAmount)
    if (isNaN(amount) || amount <= 0) return

    setUpdatingUser(selectedUser.id)
    try {
      const newCredits = creditAction === 'add'
        ? (selectedUser.credits || 0) + amount
        : Math.max(0, (selectedUser.credits || 0) - amount)

      await updateDoc(doc(db, 'users', selectedUser.id), {
        credits: newCredits,
        [`creditHistory.${Date.now()}`]: {
          action: creditAction,
          amount: amount,
          performedBy: profile?.email,
          timestamp: new Date().toISOString()
        }
      })

      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, credits: newCredits } : u
      ))
      setSelectedUser({ ...selectedUser, credits: newCredits })
      setEditingCredits(false)
      setCreditAmount('')
    } catch (error) {
      console.error('Error updating credits:', error)
    }
    setUpdatingUser(null)
  }

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setUpdatingUser(userId)
    try {
      await deleteDoc(doc(db, 'users', userId))
      setUsers(users.filter(u => u.id !== userId))
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
    setUpdatingUser(null)
  }

  // Filter users by search
  const filteredUsers = users.filter(u => {
    const searchLower = searchQuery.toLowerCase()
    return (
      u.email?.toLowerCase().includes(searchLower) ||
      u.displayName?.toLowerCase().includes(searchLower) ||
      u.uid?.toLowerCase().includes(searchLower)
    )
  })

  // Get role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'editor': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
    }
  }

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
      tab: 'users',
      color: 'indigo',
    },
    {
      icon: Settings,
      title: 'Site Settings',
      description: 'Configure site title, theme, and general settings',
      tab: 'settings',
      color: 'emerald',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View site traffic and user engagement',
      tab: 'analytics',
      color: 'rose',
    },
    {
      icon: Database,
      title: 'Content Management',
      description: 'Manage gallery items and media library',
      tab: 'content',
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
    { id: 'analytics', label: 'Analytics' },
    { id: 'owner', label: 'Owner Controls', requires: 'owner' },
    { id: 'users', label: 'Users' },
    { id: 'content', label: 'Content' },
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
              <button
                key={section.title}
                onClick={() => setActiveTab(section.tab)}
                class="group p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.02] text-left w-full"
              >
                <div class={`w-12 h-12 rounded-xl bg-${section.color}-500/20 flex items-center justify-center mb-4`}>
                  <section.icon class={`text-${section.color}-400`} size={24} />
                </div>
                <h3 class="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                  {section.title}
                </h3>
                <p class="text-zinc-400">{section.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard users={users} />
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <ContentManagement />
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
                        onClick={() => setOwnerAction(item.action)}
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

            <OwnerActionPanels ownerAction={ownerAction} setOwnerAction={setOwnerAction} profile={profile} />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div class="space-y-6">
            {/* Search and Stats */}
            <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div class="relative flex-1 max-w-md">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search users by email, name, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div class="flex items-center gap-3">
                <span class="text-zinc-400 text-sm">{filteredUsers.length} users</span>
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  class="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={18} class={loadingUsers ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-zinc-800/50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Credits</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Last Seen</th>
                      <th class="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-800">
                    {loadingUsers ? (
                      <tr>
                        <td colspan="6" class="px-4 py-8 text-center text-zinc-500">
                          <RefreshCw size={24} class="animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colspan="6" class="px-4 py-8 text-center text-zinc-500">
                          {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} class="hover:bg-zinc-800/30 transition-colors">
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-medium">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt="" class="w-8 h-8 rounded-full" />
                                ) : (
                                  (u.displayName || u.email || '?')[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <div class="font-medium text-white">{u.displayName || 'No name'}</div>
                                <div class="text-xs text-zinc-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <select
                              value={u.role || 'user'}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              disabled={u.id === user?.uid || updatingUser === u.id}
                              class={`px-2 py-1 text-xs rounded-lg border bg-zinc-800 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 ${getRoleBadge(u.role || 'user')}`}
                            >
                              <option value="user">User</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                              {isOwner && <option value="owner">Owner</option>}
                            </select>
                          </td>
                          <td class="px-4 py-3">
                            <button
                              onClick={() => { setSelectedUser(u); setEditingCredits(true); }}
                              class="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-amber-400 text-sm font-medium transition-colors"
                            >
                              {u.credits || 0} <Edit size={12} />
                            </button>
                          </td>
                          <td class="px-4 py-3 text-sm text-zinc-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td class="px-4 py-3 text-sm text-zinc-400">
                            {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : 'N/A'}
                          </td>
                          <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUser(u)}
                                class="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                              >
                                <Activity size={16} />
                              </button>
                              {isOwner && u.id !== user?.uid && (
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  disabled={updatingUser === u.id}
                                  class="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && !editingCredits && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                  <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 class="text-lg font-semibold">User Details</h3>
                    <button onClick={() => setSelectedUser(null)} class="text-zinc-500 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div class="p-4 space-y-4">
                    <div class="flex items-center gap-4">
                      <div class="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-medium text-white">
                        {selectedUser.photoURL ? (
                          <img src={selectedUser.photoURL} alt="" class="w-16 h-16 rounded-full" />
                        ) : (
                          (selectedUser.displayName || selectedUser.email || '?')[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 class="text-xl font-semibold">{selectedUser.displayName || 'No name'}</h4>
                        <p class="text-zinc-400">{selectedUser.email}</p>
                        <span class={`inline-block mt-1 px-2 py-0.5 text-xs rounded-lg border ${getRoleBadge(selectedUser.role || 'user')}`}>
                          {selectedUser.role || 'user'}
                        </span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-zinc-800/50 p-3 rounded-lg">
                        <div class="text-xs text-zinc-500 uppercase mb-1">Credits</div>
                        <div class="text-2xl font-bold text-amber-400">{selectedUser.credits || 0}</div>
                      </div>
                      <div class="bg-zinc-800/50 p-3 rounded-lg">
                        <div class="text-xs text-zinc-500 uppercase mb-1">User ID</div>
                        <div class="text-xs text-zinc-400 font-mono truncate" title={selectedUser.uid}>
                          {selectedUser.uid?.slice(0, 12)}...
                        </div>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-zinc-500">Joined:</span>
                        <span class="text-white">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-zinc-500">Last Seen:</span>
                        <span class="text-white">
                          {selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        onClick={() => { setEditingCredits(true); }}
                        class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Manage Credits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credit Adjustment Modal */}
            {editingCredits && selectedUser && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-zinc-900 rounded-xl border border-zinc-800 max-w-md w-full">
                  <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Adjust Credits</h3>
                    <button onClick={() => { setEditingCredits(false); setCreditAmount(''); }} class="text-zinc-500 hover:text-white">
                      <X size={20} />
                    </button>
                  </div>
                  <div class="p-4 space-y-4">
                    <div class="bg-zinc-800/50 p-3 rounded-lg">
                      <div class="text-xs text-zinc-500 uppercase mb-1">Current Credits</div>
                      <div class="text-3xl font-bold text-amber-400">{selectedUser.credits || 0}</div>
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm text-zinc-400">Action</label>
                      <div class="flex gap-2">
                        <button
                          onClick={() => setCreditAction('add')}
                          class={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            creditAction === 'add'
                              ? 'bg-green-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Plus size={18} /> Add
                        </button>
                        <button
                          onClick={() => setCreditAction('remove')}
                          class={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            creditAction === 'remove'
                              ? 'bg-red-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Minus size={18} /> Remove
                        </button>
                      </div>
                    </div>

                    <div>
                      <label class="text-sm text-zinc-400">Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        placeholder="Enter amount..."
                        class="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {creditAmount && (
                      <div class="bg-zinc-800/50 p-3 rounded-lg">
                        <div class="text-xs text-zinc-500 uppercase mb-1">New Balance</div>
                        <div class="text-2xl font-bold text-white">
                          {creditAction === 'add'
                            ? (selectedUser.credits || 0) + parseInt(creditAmount || 0)
                            : Math.max(0, (selectedUser.credits || 0) - parseInt(creditAmount || 0))
                          }
                        </div>
                      </div>
                    )}

                    <div class="flex gap-2 pt-2">
                      <button
                        onClick={() => { setEditingCredits(false); setCreditAmount(''); }}
                        class="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreditChange}
                        disabled={!creditAmount || parseInt(creditAmount) <= 0 || updatingUser}
                        class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingUser ? 'Processing...' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SiteSettings isOwner={isOwner} />
        )}
      </div>
    </div>
  )
}

// Site Settings Component
// Content Management Component
function ContentManagement() {
  const [activeSection, setActiveSection] = useState('projects')
  const [projects, setProjects] = useState([])
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const projectsSnap = await getDocs(collection(db, 'projects'))
        setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })))

        const mediaSnap = await getDocs(collection(db, 'media'))
        setMedia(mediaSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (error) {
        console.error('Error fetching content:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const contentSections = [
    { id: 'projects', label: 'Projects', count: projects.length, icon: Database },
    { id: 'media', label: 'Media Library', count: media.length, icon: Edit },
  ]

  return (
    <div class="space-y-6">
      {/* Section Tabs */}
      <div class="flex gap-2 border-b border-zinc-800 pb-4">
        {contentSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            class={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeSection === section.id
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <section.icon size={18} />
            {section.label}
            <span class="text-xs bg-black/20 px-2 py-0.5 rounded-full">{section.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div class="flex items-center justify-center p-12">
          <RefreshCw size={24} class="animate-spin text-zinc-500" />
        </div>
      ) : activeSection === 'projects' ? (
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 class="font-semibold">Projects ({projects.length})</h3>
            <button class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors">
              Add Project
            </button>
          </div>
          {projects.length === 0 ? (
            <div class="p-8 text-center text-zinc-500">No projects found</div>
          ) : (
            <div class="divide-y divide-zinc-800">
              {projects.map((project) => (
                <div key={project.id} class="p-4 flex items-center justify-between hover:bg-zinc-800/30">
                  <div class="flex items-center gap-3">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt="" class="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div class="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Database size={20} class="text-zinc-500" />
                      </div>
                    )}
                    <div>
                      <div class="font-medium">{project.title || 'Untitled'}</div>
                      <div class="text-xs text-zinc-500">{project.id}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-zinc-500">
                      {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString() : 'N/A'}
                    </span>
                    <button class="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div class="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 class="font-semibold">Media Library ({media.length})</h3>
            <button class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors">
              Upload Media
            </button>
          </div>
          {media.length === 0 ? (
            <div class="p-8 text-center text-zinc-500">No media found</div>
          ) : (
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
              {media.slice(0, 24).map((item) => (
                <div key={item.id} class="aspect-square rounded-lg bg-zinc-800 overflow-hidden relative group">
                  {item.url ? (
                    <img src={item.url} alt="" class="w-full h-full object-cover" />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center">
                      <Edit size={24} class="text-zinc-600" />
                    </div>
                  )}
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button class="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                      <Edit size={16} class="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Analytics Dashboard Component
function AnalyticsDashboard({ users }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCredits: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (users.length > 0) {
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      const totalCredits = users.reduce((sum, u) => sum + (u.credits || 0), 0)
      const activeUsers = users.filter(u => {
        if (!u.lastSeen) return false
        const lastSeen = new Date(u.lastSeen)
        const daysSince = (now - lastSeen) / (1000 * 60 * 60 * 24)
        return daysSince <= 30
      }).length
      const newUsersThisMonth = users.filter(u => {
        if (!u.createdAt) return false
        const created = new Date(u.createdAt)
        return created.getMonth() === thisMonth && created.getFullYear() === thisYear
      }).length

      setStats({
        totalUsers: users.length,
        totalCredits,
        activeUsers,
        newUsersThisMonth,
      })
    }
    setLoading(false)
  }, [users])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'indigo', icon: Users },
    { label: 'Total Credits in System', value: stats.totalCredits.toLocaleString(), color: 'amber', icon: Database },
    { label: 'Active Users (30d)', value: stats.activeUsers, color: 'green', icon: Activity },
    { label: 'New This Month', value: stats.newUsersThisMonth, color: 'blue', icon: Plus },
  ]

  if (loading) {
    return (
      <div class="flex items-center justify-center p-12">
        <RefreshCw size={24} class="animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div class="space-y-6">
      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} class="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-zinc-500 text-sm">{stat.label}</span>
              <stat.icon class={`text-${stat.color}-400`} size={20} />
            </div>
            <div class="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
        <div class="space-y-3">
          {users.slice(0, 5).map((u) => (
            <div key={u.id} class="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 text-sm">
                  {(u.displayName || u.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div class="font-medium">{u.displayName || 'No name'}</div>
                  <div class="text-xs text-zinc-500">{u.email}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-zinc-400">
                  {u.lastSeen ? `Seen ${new Date(u.lastSeen).toLocaleDateString()}` : 'Never'}
                </div>
                <div class="text-xs text-amber-400">{u.credits || 0} credits</div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div class="text-center text-zinc-500 py-8">No user activity yet</div>
          )}
        </div>
      </div>

      {/* Credits Distribution */}
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 class="text-lg font-semibold mb-4">Credit Distribution</h3>
        <div class="space-y-2">
          {['100+', '50-99', '10-49', '0-9'].map((range, idx) => {
            let count
            if (idx === 0) count = users.filter(u => (u.credits || 0) >= 100).length
            else if (idx === 1) count = users.filter(u => (u.credits || 0) >= 50 && (u.credits || 0) < 100).length
            else if (idx === 2) count = users.filter(u => (u.credits || 0) >= 10 && (u.credits || 0) < 50).length
            else count = users.filter(u => (u.credits || 0) < 10).length

            const percentage = users.length > 0 ? (count / users.length) * 100 : 0

            return (
              <div key={range} class="flex items-center gap-3">
                <div class="w-20 text-sm text-zinc-400">{range} credits</div>
                <div class="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div class="w-12 text-right text-sm text-zinc-500">{count}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Owner Action Panels Component
function OwnerActionPanels({ ownerAction, setOwnerAction, profile }) {
  if (!ownerAction) return null

  const panels = {
    ownership: {
      icon: Crown,
      title: 'Ownership Management',
      color: 'amber',
      content: (
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Current Owner</label>
            <div class="px-3 py-2 bg-zinc-800 rounded-lg text-white">{profile?.email}</div>
          </div>
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Transfer to (enter email)</label>
            <input type="email" placeholder="new-owner@example.com" class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500" />
          </div>
          <button class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium">Transfer Ownership</button>
        </div>
      )
    },
    wallet: {
      icon: Wallet,
      title: 'Wallet Management',
      color: 'amber',
      content: <div class="mt-4 p-4 bg-zinc-800/50 rounded-lg"><p class="text-zinc-500 text-sm">Wallet integration coming soon.</p></div>
    },
    cloud: {
      icon: Cloud,
      title: 'Cloud Functions',
      color: 'amber',
      content: (
        <div class="mt-4 space-y-2">
          {['toolsList', 'toolsCall', 'health'].map(fn => (
            <div key={fn} class="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{fn}</span>
              </div>
              <span class="text-xs text-green-400">Active</span>
            </div>
          ))}
        </div>
      )
    },
    secrets: {
      icon: Code,
      title: 'API Keys & Secrets',
      color: 'amber',
      content: <div class="mt-4 p-4 bg-zinc-800/50 rounded-lg"><p class="text-zinc-500 text-sm">API keys are managed via GitHub Secrets. See repository settings.</p></div>
    },
    'edit-db': {
      icon: Edit,
      title: 'Edit Database',
      color: 'amber',
      content: <div class="mt-4 p-4 bg-zinc-800/50 rounded-lg"><p class="text-zinc-500 text-sm">Direct database editing available in future update.</p></div>
    },
    'delete-db': {
      icon: Trash2,
      title: 'Delete Data',
      color: 'red',
      content: <div class="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"><p class="text-red-400 text-sm font-medium">Warning: This action cannot be undone.</p></div>
    }
  }

  const panel = panels[ownerAction]
  if (!panel) return null

  const IconComponent = panel.icon

  return (
    <div class="mt-6">
      <button onClick={() => setOwnerAction(null)} class="mb-4 text-zinc-400 hover:text-white flex items-center gap-1">
        <X size={16} /> Back to Owner Controls
      </button>
      <div class={`bg-zinc-900 rounded-xl border border-${panel.color}-800 p-6`}>
        <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <IconComponent class={`text-${panel.color}-400`} size={24} />
          {panel.title}
        </h3>
        {panel.content}
      </div>
    </div>
  )
}

function SiteSettings({ isOwner }) {
  const [settings, setSettings] = useState({
    siteName: 'Sand Gallery',
    siteDescription: 'Creative Technologist × AI',
    primaryColor: '#f59e0b',
    accentColor: '#10b981',
    maintenanceMode: false,
    betaFeatures: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from Firestore
    const loadSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'settings', 'site'), settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
    setSaving(false)
  }

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div class="flex items-center justify-center p-12">
        <RefreshCw size={24} class="animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div class="space-y-6">
      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 class="text-xl font-semibold mb-4">General Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Site Description</label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              class="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 class="text-xl font-semibold mb-4">Appearance</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Primary Color</label>
            <div class="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                class="w-12 h-10 rounded-lg bg-zinc-800 border border-zinc-700 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                class="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm text-zinc-400 mb-1">Accent Color</label>
            <div class="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                class="w-12 h-10 rounded-lg bg-zinc-800 border border-zinc-700 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                class="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <div class="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 class="text-xl font-semibold mb-4">Advanced Options</h3>
          <div class="space-y-4">
            <label class="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
              <div>
                <div class="font-medium">Maintenance Mode</div>
                <div class="text-sm text-zinc-500">Show a maintenance message to all visitors</div>
              </div>
              <div class="relative">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-amber-600 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>

            <label class="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
              <div>
                <div class="font-medium">Beta Features</div>
                <div class="text-sm text-zinc-500">Enable beta features (Studio, Pricing, etc.)</div>
              </div>
              <div class="relative">
                <input
                  type="checkbox"
                  checked={settings.betaFeatures}
                  onChange={(e) => handleChange('betaFeatures', e.target.checked)}
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-amber-600 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>
          </div>
        </div>
      )}

      <div class="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          class="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <span class="text-green-400 flex items-center gap-1">
            <Check size={18} /> Saved!
          </span>
        )}
      </div>
    </div>
  )
}
