import React from 'react';
import { StudioProvider } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';
// Import the content directly to avoid circular dependency
// We will need to extract StudioContent from Studio.jsx, or duplicate the import logic
// But Studio.jsx default export is the Page. We should move the content to a separate component.
// For now, let's assume we will refactor Studio.jsx to export StudioContent.
import StudioContent from '../../components/StudioContent';

const StudioEmbed = ({ cmsStyles = {} }) => {
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
