import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();

    if (user?.role !== 'owner') {
        return (
            <div style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2 style={{ color: '#ff4444' }}>ACCESS DENIED</h2>
                <p>Restricted to Administrator access only.</p>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '120px', maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
                ADMIN <span style={{ color: 'var(--neon-green)' }}>DASHBOARD</span>
            </h1>

            <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(0, 143, 78, 0.2)'
                }}>
                    <h3>Site Parameters</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Placeholder for dynamic controls (Audio, Video, Theme values).</p>
                </div>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(0, 143, 78, 0.2)'
                }}>
                    <h3>User Management</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Future list of all registered users.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
