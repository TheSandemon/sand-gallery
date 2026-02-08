import React from 'react';
import { StudioProvider } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
// Import the content directly to avoid circular dependency
// We will need to extract StudioContent from Studio.jsx, or duplicate the import logic
// But Studio.jsx default export is the Page. We should move the content to a separate component.
// For now, let's assume we will refactor Studio.jsx to export StudioContent.
import StudioContent from '../../components/StudioContent';

const StudioEmbed = ({ cmsStyles = {}, isEditor = false }) => {
    // In editor mode, show a placeholder instead of the full studio
    if (isEditor) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                color: '#888',
                ...cmsStyles
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>Studio Application</div>
                <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.25rem' }}>Interactive app (preview on live page)</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', ...cmsStyles }}>
            {/* The Studio Context Provider should ideally wrap the page, but wrapping here is safe for the section */}
            <StudioProvider>
                <StudioContent />
            </StudioProvider>
        </div>
    );
};

export default StudioEmbed;
