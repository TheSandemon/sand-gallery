import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import VideoAnalysis from '../components/VideoAnalysis';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownBasename,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { LogOut, User, RefreshCw } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 flex items-center justify-center">
                <p className="text-gray-500">Please log in to view profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white/5 p-6 md:p-8 rounded-2xl border border-neon-green/30 backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-24 h-24 rounded-full border-[3px] border-neon-green object-cover"
                        />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white mb-1">{user.displayName}</h1>
                            <p className="text-gray-400 text-sm mb-2">{user.email}</p>
                            <span className="inline-block px-3 py-0.5 bg-neon-gold/20 text-neon-gold rounded-full text-xs font-bold uppercase">
                                {user.role || 'USER'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            Log Out
                        </button>
                        <Wallet>
                            <ConnectWallet className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-black rounded-lg font-bold text-sm transition-all cursor-pointer">
                                <Avatar className="w-4 h-4" />
                                <Name />
                            </ConnectWallet>
                            <WalletDropdown className="bg-[#0a0a0a] border border-neon-green/20 rounded-xl overflow-hidden">
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address className="text-gray-400" />
                                    <EthBalance className="text-neon-gold" />
                                </Identity>
                                <WalletDropdownBasename className="px-4 py-2 text-sm text-gray-400 hover:bg-neon-green/10 transition-colors block" />
                                <WalletDropdownDisconnect className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer">
                                    Disconnect
                                </WalletDropdownDisconnect>
                            </WalletDropdown>
                        </Wallet>
                    </div>
                </div>

                {/* Credits Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                        <h3 className="text-gray-500 text-sm mb-2 font-medium uppercase tracking-wider">Balance</h3>
                        <p className="text-5xl font-black text-neon-gold">
                            {user.credits || 0}
                            <span className="text-lg font-normal text-gray-500 ml-2">CREDITS</span>
                        </p>
                    </div>
                </div>

                {/* Video Analysis */}
                <div className="mt-8">
                    <VideoAnalysis userId={user.uid} />
                </div>

                {/* Creations Gallery */}
                <CreationsGallery userId={user.uid} />
            </div>
        </div>
    );
};

const CreationsGallery = ({ userId }) => {
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreations = async () => {
            try {
                const { collection, query, where, getDocs } = await import('firebase/firestore');
                const { db } = await import('../firebase');

                const q = query(
                    collection(db, 'creations'),
                    where('userId', '==', userId)
                );

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setCreations(data);
            } catch (error) {
                console.error("Error fetching creations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreations();
    }, [userId]);

    if (loading) {
        return (
            <div className="mt-8">
                <h3 className="text-neon-green border-b border-[#333] pb-2 mb-4 text-lg font-bold">MY CREATIONS</h3>
                <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Loading gallery...</span>
                </div>
            </div>
        );
    }

    if (creations.length === 0) {
        return (
            <div className="mt-8">
                <h3 className="text-neon-green border-b border-[#333] pb-2 mb-4 text-lg font-bold">MY CREATIONS</h3>
                <div className="text-gray-500 py-8 text-center">
                    No creations yet. Visit the Studio!
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h3 className="text-neon-green border-b border-[#333] pb-2 mb-4 text-lg font-bold">MY CREATIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {creations.map(item => (
                    <div key={item.id} className="bg-black/40 border border-[#333] rounded-xl p-4">
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">"{item.prompt}"</p>
                        {item.audioUrl && (
                            <audio controls src={item.audioUrl} className="w-full h-8 mb-2" />
                        )}
                        <p className="text-xs text-gray-600">
                            {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
