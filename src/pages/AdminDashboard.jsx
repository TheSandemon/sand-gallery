import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, getAllUsers, grantCredits } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleGrant = async (uid, currentCredits) => {
        const amountStr = prompt("Enter amount of credits to grant (e.g., 1000):", "1000");
        if (!amountStr) return;

        const amount = parseInt(amountStr, 10);
        if (isNaN(amount)) {
            alert("Invalid number");
            return;
        }

        const success = await grantCredits(uid, amount);
        if (success) {
            alert(`Granted ${amount} credits!`);
            fetchUsers(); // Refresh list
        }
    };

    if (!user || user.role !== 'owner') {
        return (
            <div style={{ paddingTop: '100px', textAlign: 'center', color: 'red' }}>
                <h1>ACCESS DENIED</h1>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '120px', maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '3rem', margin: 0 }}>
                    ADMIN <span style={{ color: 'var(--neon-green)' }}>DASHBOARD</span>
                </h1>
                <Link to="/crm" style={{
                    fontSize: '1rem',
                    padding: '0.8rem 1.5rem',
                    background: 'var(--neon-green)',
                    color: 'black',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '900',
                    letterSpacing: '1px',
                    boxShadow: '0 0 15px rgba(0, 143, 78, 0.4)',
                    transition: 'all 0.3s ease'
                }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    OPEN CRM
                </Link>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>User Management</h2>
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '10px' }}>User</th>
                                <th style={{ padding: '10px' }}>Role</th>
                                <th style={{ padding: '10px' }}>Credits</th>
                                <th style={{ padding: '10px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {u.photoURL && <img src={u.photoURL} alt="" style={{ width: '30px', borderRadius: '50%' }} />}
                                        <div>
                                            <div>{u.displayName || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.email}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            background: u.role === 'owner' ? 'var(--neon-gold)' : '#333',
                                            color: u.role === 'owner' ? 'black' : 'white',
                                            fontSize: '0.8rem'
                                        }}>{u.role}</span>
                                    </td>
                                    <td style={{ padding: '10px', color: 'var(--neon-green)', fontWeight: 'bold' }}>
                                        {String(u.credits || 0)}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => handleGrant(u.id, u.credits)}
                                            style={{
                                                padding: '4px 12px',
                                                background: 'rgba(0, 143, 78, 0.2)',
                                                border: '1px solid var(--neon-green)',
                                                color: 'var(--neon-green)',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Grant
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ background: '#111', padding: '20px', borderRadius: '10px' }}>
                <h3>System Status</h3>
                <p style={{ color: 'var(--text-secondary)' }}>All systems operational. Firestore connection active.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
