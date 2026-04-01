import React from 'react';

const Footer = () => {
    // Use VITE_BUILD_TIME env var if set (from CI/build pipeline), otherwise static version
    const version = import.meta.env.VITE_BUILD_TIME || '1.0.0';

    return (
        <footer className="w-full py-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm text-center">
            <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                &copy; 2026 Sand Gallery &mdash; v{version}
            </p>
        </footer>
    );
};

export default Footer;
