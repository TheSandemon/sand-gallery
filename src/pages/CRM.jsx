import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, limit } from "firebase/firestore";
import { Search, Edit, Save, X, Shield, ShieldAlert, Award, ChevronDown, ChevronUp, User, Database, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCRM = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userAnalyses, setUserAnalyses] = useState({}); // Cache for analyses
    const [editingUser, setEditingUser] = useState(null); // { id, credits, role }

    useEffect(() => {
        if (user?.role === 'owner' || user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "users"));
            const snapshot = await getDocs(q);
            const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalyses = async (userId) => {
        if (userAnalyses[userId]) return; // Already fetched

        try {
            const q = query(
                collection(db, "users", userId, "video_analyses"),
                orderBy("timestamp", "desc"),
                limit(5)
            );
            const snapshot = await getDocs(q);
            const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserAnalyses(prev => ({ ...prev, [userId]: analyses }));
        } catch (error) {
            console.error("Error fetching analyses:", error);
        }
    };

    const handleExpandUser = (userId) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
            setEditingUser(null);
        } else {
            setExpandedUserId(userId);
            setEditingUser(null);
            fetchAnalyses(userId);
        }
    };

    const handleEditStart = (u) => {
        setEditingUser({ id: u.id, credits: u.credits || 0, role: u.role || 'user' });
    };

    const handleEditSave = async () => {
        if (!editingUser) return;
        try {
            const userRef = doc(db, "users", editingUser.id);
            await updateDoc(userRef, {
                credits: Number(editingUser.credits),
                role: editingUser.role
            });

            // Update local state
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, credits: Number(editingUser.credits), role: editingUser.role } : u));
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    // Filter users
    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm)
    );

    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
        return (
            <div className="min-h-screen pt-[120px] bg-[var(--bg-dark)] flex items-center justify-center text-white">
                <div className="text-center p-8 bg-white/5 border border-red-500/30 rounded-2xl backdrop-blur-md">
                    <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-gray-400">You do not have permission to view the CRM Dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] pt-[100px] pb-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                            <Database className="text-[var(--neon-gold)]" />
                            ADMIN <span className="text-[var(--neon-green)]">CRM</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Manage users, credits, and review generative history.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search users (email, name, ID)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--neon-green)] transition-colors"
                        />
                    </div>
                </div>

                <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <div className="col-span-4 md:col-span-3">User</div>
                        <div className="col-span-3 md:col-span-3">Role</div>
                        <div className="col-span-3 md:col-span-3">Credits</div>
                        <div className="col-span-2 md:col-span-3 text-right">Actions</div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading Users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No users found.</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="group">
                                    {/* User Row */}
                                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors">
                                        {/* User Info */}
                                        <div className="col-span-4 md:col-span-3 flex items-center gap-3 overflow-hidden">
                                            {u.photoURL ? (
                                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <User size={14} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm truncate">{u.displayName || 'Unknown User'}</div>
                                                <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                                <div className="text-[10px] text-gray-600 font-mono truncate">{u.id}</div>
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div className="col-span-3 md:col-span-3">
                                            {editingUser?.id === u.id ? (
                                                <select
                                                    value={editingUser.role}
                                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                                    className="bg-black border border-white/20 rounded px-2 py-1 text-xs"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="owner">Owner</option>
                                                </select>
                                            ) : (
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${u.role === 'owner' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                        u.role === 'admin' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'}
                                                `}>
                                                    {u.role === 'owner' && <ShieldAlert size={10} />}
                                                    {u.role === 'admin' && <Shield size={10} />}
                                                    {u.role || 'USER'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Credits */}
                                        <div className="col-span-3 md:col-span-3 flex items-center gap-2 font-mono text-sm">
                                            <Coins size={14} className="text-[var(--neon-gold)]" />
                                            {editingUser?.id === u.id ? (
                                                <input
                                                    type="number"
                                                    value={editingUser.credits}
                                                    onChange={e => setEditingUser({ ...editingUser, credits: e.target.value })}
                                                    className="w-20 bg-black border border-white/20 rounded px-2 py-1 text-xs"
                                                />
                                            ) : (
                                                <span className="text-[var(--neon-gold)]">{u.credits || 0}</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 md:col-span-3 text-right flex items-center justify-end gap-2">
                                            {editingUser?.id === u.id ? (
                                                <>
                                                    <button onClick={handleEditSave} className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">
                                                        <Save size={14} />
                                                    </button>
                                                    <button onClick={() => setEditingUser(null)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleEditStart(u)} className="p-1.5 rounded bg-white/5 text-gray-400 hover:text-white hover:bg-white/10">
                                                    <Edit size={14} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleExpandUser(u.id)}
                                                className={`p-1.5 rounded transition-colors ${expandedUserId === u.id ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                            >
                                                {expandedUserId === u.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedUserId === u.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-black/40 border-t border-white/5"
                                            >
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                                        <div>
                                                            <h3 className="text-sm font-bold text-[var(--neon-green)] flex items-center gap-2 mb-1">
                                                                <Award size={16} /> RECENT ANALYSES
                                                            </h3>
                                                            <p className="text-xs text-gray-500">History of AI critiques.</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex gap-2 mb-2 justify-end">
                                                                <a
                                                                    href={`https://console.firebase.google.com/u/0/project/sand-gallery/firestore/data/users/${u.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Database size={10} /> Firestore
                                                                </a>
                                                                <a
                                                                    href={`https://console.firebase.google.com/u/0/project/sand-gallery/storage/bucket/sand-gallery.appspot.com/files/~2Fuser_uploads~2F${u.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded hover:bg-orange-500/20 transition-colors flex items-center gap-1"
                                                                >
                                                                    <Search size={10} /> Storage
                                                                </a>
                                                            </div>
                                                            <div className="text-[10px] text-gray-600 font-mono">
                                                                <div>Created: {u.metadata?.creationTime ? new Date(u.metadata.creationTime).toLocaleDateString() : 'N/A'}</div>
                                                                <div>Last Login: {u.metadata?.lastSignInTime ? new Date(u.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!userAnalyses[u.id] ? (
                                                        <div className="text-sm text-gray-500 animate-pulse">Loading history...</div>
                                                    ) : userAnalyses[u.id].length === 0 ? (
                                                        <div className="text-sm text-gray-500">No video analyses found for this user.</div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {userAnalyses[u.id].map(analysis => (
                                                                <div key={analysis.id} className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="text-xs font-mono text-gray-500">{new Date(analysis.timestamp?.seconds * 1000).toLocaleDateString()}</div>
                                                                        <div className="text-xs font-bold text-[var(--neon-gold)]">{analysis.model}</div>
                                                                    </div>

                                                                    <div className="grid grid-cols-5 gap-1 mb-3">
                                                                        {Object.entries(analysis.scores || {}).map(([key, score]) => (
                                                                            <div key={key} className="text-center">
                                                                                <div className="text-[10px] uppercase text-gray-500">{key.slice(0, 3)}</div>
                                                                                <div className={`text-sm font-bold ${score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{score}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {analysis.critique?.quality_notes && (
                                                                        <p className="text-xs text-gray-400 italic line-clamp-2">"{analysis.critique.quality_notes}"</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCRM;
