import React from 'react';

const Footer = () => {
    // Automated version string from CI/CD
    const VERSION = import.meta.env.VITE_APP_VERSION || "DEV_MODE";

    return (
        <footer className="w-full py-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm text-center">
            <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                Sand Gallery {VERSION}
            </p>
        </footer>
    );
};

export default Footer;
