import React from 'react';

const Footer = () => {
    // Hardcoded version string as requested (updated manually per deployment)
    const VERSION = "v2026.02.03-1545 GMT";

    return (
        <footer className="w-full py-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm text-center">
            <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity">
                Sand Gallery {VERSION}
            </p>
        </footer>
    );
};

export default Footer;
