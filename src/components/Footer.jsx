import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

/**
 * Footer Component
 * Includes social links, OpenClaw badge, and dynamic copyright
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    // Version from Vite config or dev mode
    const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'DEV_MODE';

    const socialLinks = [
        { 
            icon: Github, 
            href: 'https://github.com/TheSandemon', 
            label: 'GitHub',
            hoverColor: 'hover:text-white'
        },
        { 
            icon: Twitter, 
            href: 'https://twitter.com', 
            label: 'Twitter',
            hoverColor: 'hover:text-[#1DA1F2]'
        },
        { 
            icon: Linkedin, 
            href: 'https://linkedin.com', 
            label: 'LinkedIn',
            hoverColor: 'hover:text-[#0A66C2]'
        }
    ];

    return (
        <footer className="w-full py-8 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Social Links with hover animations */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className={`p-2 rounded-lg bg-white/5 text-[var(--text-dim)] ${hoverColor} transition-all duration-300 hover:bg-white/10 hover:scale-110`}
                            >
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>

                    {/* OpenClaw Badge */}
                    <a 
                        href="https://openclaw.ai" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 hover:border-[var(--accent-primary)]/50 transition-all duration-300"
                    >
                        <span className="text-xs font-medium text-[var(--text-dim)] group-hover:text-[var(--text-primary)] transition-colors">
                            Built with
                        </span>
                        <span className="text-sm font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                            OpenClaw
                        </span>
                    </a>

                    {/* Copyright with dynamic year */}
                    <p className="text-xs text-[var(--text-dim)]/60 font-mono">
                        © {currentYear} Sand.Gallery — v{VERSION}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
