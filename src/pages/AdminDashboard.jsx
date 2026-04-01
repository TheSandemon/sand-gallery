import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { RefreshCw, Image as ImageIcon, AlertTriangle, Plus, X, Shield, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
    const { user, getAllUsers, grantCredits } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showHidden, setShowHidden] = useState(false);
    const [grantModal, setGrantModal] = useState(null); // { uid, name }
    const [grantAmount, setGrantAmount] = useState('1000');
    const [granting, setGranting] = useState(false);
    const [grantError, setGrantError] = useState('');
    const [grantSuccess, setGrantSuccess] = useState('');

    useEffect(() => {
        fetchUsers();

        const unsub = onSnapshot(doc(db, 'config', 'ui_settings'), (docSnap) => {
            if (docSnap.exists()) {
                setShowHidden(docSnap.data().showHiddenPages || false);
            }
        });
        return () => unsub();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    const openGrantModal = (uid, name) => {
        setGrantModal({ uid, name });
        setGrantAmount('1000');
        setGrantError('');
        setGrantSuccess('');
    };

    const closeGrantModal = () => {
        setGrantModal(null);
        setGrantError('');
        setGrantSuccess('');
    };

    const handleGrant = async (e) => {
        e.preventDefault();
        if (!grantModal) return;

        const amount = parseInt(grantAmount, 10);
        if (isNaN(amount) || amount <= 0) {
            setGrantError('Enter a valid positive number.');
            return;
        }

        setGranting(true);
        setGrantError('');

        try {
            const success = await grantCredits(grantModal.uid, amount);
            if (success) {
                setGrantSuccess(`Granted ${amount} credits to ${grantModal.name}!`);
                setTimeout(() => {
                    closeGrantModal();
                    fetchUsers();
                }, 1500);
            } else {
                setGrantError('Failed to grant credits. Try again.');
            }
        } catch (err) {
            setGrantError('Error: ' + err.message);
        } finally {
            setGranting(false);
        }
    };

    const toggleHiddenPages = async () => {
        const newState = !showHidden;
        try {
            await setDoc(doc(db, 'config', 'ui_settings'), { showHiddenPages: newState }, { merge: true });
        } catch (err) {
            console.error('Error updating settings:', err);
        }
    };

    if (!user || user.role !== 'owner') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">ACCESS DENIED</h1>
                    <p className="text-gray-500">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        ADMIN <span className="text-neon-green">DASHBOARD</span>
                    </h1>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-[#222] text-gray-400 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link
                        to="/admin/media"
                        className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green rounded-lg text-sm font-bold hover:bg-neon-green hover:text-black transition-colors"
                    >
                        <ImageIcon size={14} />
                        MEDIA MANAGER
                    </Link>
                    <Link
                        to="/crm"
                        className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green rounded-lg text-sm font-bold hover:bg-neon-green hover:text-black transition-colors"
                    >
                        <Shield size={14} />
                        OPEN CRM TOOL
                    </Link>
                </div>

                {/* User Management */}
                <div className="bg-[#111] rounded-xl p-6 border border-[#222] mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield size={16} className="text-neon-green" />
                        User Management
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
                            <Loader2 size={20} className="animate-spin" />
                            <span>Loading users...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-[#222]">
                                        <th className="pb-3 pr-4 font-medium">User</th>
                                        <th className="pb-3 pr-4 font-medium">Role</th>
                                        <th className="pb-3 pr-4 font-medium">Credits</th>
                                        <th className="pb-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 last:border-0">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    {u.photoURL && (
                                                        <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full" />
                                                    )}
                                                    <div>
                                                        <div className="text-white text-sm font-medium">{u.displayName || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-600">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    u.role === 'owner' ? 'bg-neon-gold/20 text-neon-gold' :
                                                    u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-[#333] text-gray-400'
                                                }`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4 text-neon-green font-bold text-sm">
                                                {u.credits || 0}
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => openGrantModal(u.id, u.displayName || 'User')}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/20 text-neon-green border border-neon-green/50 rounded-lg text-xs font-bold hover:bg-neon-green hover:text-black transition-colors cursor-pointer"
                                                >
                                                    <Plus size={12} />
                                                    Grant
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Visibility Settings */}
                <div className="bg-[#111] rounded-xl p-6 border border-[#222] mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-bold mb-1">Global Visibility Settings</h3>
                            <p className="text-gray-500 text-sm">Control the visibility of beta/hidden pages (Studio, Pricing).</p>
                        </div>
                        <button
                            onClick={toggleHiddenPages}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                                showHidden
                                    ? 'bg-neon-green text-black'
                                    : 'bg-[#333] text-gray-300 border border-[#444]'
                            }`}
                        >
                            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                            {showHidden ? 'VISIBLE' : 'HIDDEN'}
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Zap size={14} className="text-neon-green" />
                        System Status
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neon-green inline-block" />
                        All systems operational. Firestore connection active.
                    </p>
                </div>
            </div>

            {/* Grant Credits Modal */}
            {grantModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeGrantModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Grant credits"
                >
                    <div
                        className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Grant Credits</h3>
                            <button
                                onClick={closeGrantModal}
                                className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleGrant}>
                            <p className="text-gray-400 text-sm mb-4">
                                Grant credits to <span className="text-white font-medium">{grantModal.name}</span>
                            </p>

                            <input
                                type="number"
                                value={grantAmount}
                                onChange={e => setGrantAmount(e.target.value)}
                                min="1"
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-lg font-bold focus:border-neon-green focus:outline-none mb-3"
                                placeholder="Enter amount"
                                autoFocus
                            />

                            {grantError && (
                                <p className="text-red-400 text-sm mb-3">{grantError}</p>
                            )}
                            {grantSuccess && (
                                <p className="text-neon-green text-sm mb-3">{grantSuccess}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeGrantModal}
                                    className="flex-1 py-2.5 bg-[#222] text-gray-400 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={granting}
                                    className="flex-1 py-2.5 bg-neon-green text-black rounded-lg text-sm font-bold hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {granting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Granting...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={14} />
                                            Grant Credits
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
