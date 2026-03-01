import { useAuth } from '../contexts/AuthContext'
import { User, CreditCard, Settings, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, profile, signInWithGoogle, logout } = useAuth()

  if (!user) {
    return (
      <div class="pt-24 min-h-screen flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold mb-4">Sign In Required</h1>
          <p class="text-zinc-400 mb-6">Sign in to view your profile</p>
          <button
            onClick={signInWithGoogle}
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div class="pt-20 min-h-screen">
      <div class="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div class="flex items-center gap-6 mb-8">
          <img
            src={profile?.photoURL || user.photoURL || '/default-avatar.png'}
            alt={profile?.displayName || user.displayName}
            class="w-24 h-24 rounded-full border-4 border-zinc-800"
          />
          <div>
            <h1 class="text-2xl font-bold">{profile?.displayName || user.displayName}</h1>
            <p class="text-zinc-400">{profile?.email || user.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
              <CreditCard class="text-indigo-400" size={20} />
              <span class="text-zinc-400">Credits</span>
            </div>
            <p class="text-3xl font-bold">{profile?.credits || 0}</p>
          </div>
          <div class="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
              <User class="text-rose-400" size={20} />
              <span class="text-zinc-400">Role</span>
            </div>
            <p class="text-xl font-semibold capitalize">{profile?.role || 'user'}</p>
          </div>
          <div class="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <div class="flex items-center gap-3 mb-2">
              <Settings class="text-emerald-400" size={20} />
              <span class="text-zinc-400">Member Since</span>
            </div>
            <p class="text-xl font-semibold">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div class="space-y-4">
          <button
            onClick={logout}
            class="flex items-center gap-3 w-full p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors"
          >
            <LogOut size={20} class="text-zinc-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
