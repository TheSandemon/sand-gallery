import React, { useState } from 'react';
import { Mail, Github, Twitter, Linkedin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError('');

        try {
            await addDoc(collection(db, 'contacts'), {
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: formData.message.trim(),
                createdAt: serverTimestamp(),
            });
            setSending(false);
            setSent(true);
        } catch (err) {
            console.error('Contact form error:', err);
            setSending(false);
            setError('Failed to send message. Please try again.');
        }
    };

    const SOCIAL_LINKS = [
        { name: 'GitHub', icon: Github, url: 'https://github.com' },
        { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
        { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        CONTACT
                    </h1>
                    <p className="text-xl text-gray-400 max-w-xl">
                        Have a project in mind? Let's create something amazing together.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        {sent ? (
                            <div className="bg-[#111] rounded-lg p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-neon-green" />
                                </div>
                                <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-gray-400">Thanks for reaching out. I'll get back to you soon.</p>
                                <button
                                    onClick={() => { setSent(false); setFormData({ name: '', email: '', message: '' }); }}
                                    className="mt-6 text-neon-green hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">NAME</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-colors"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">EMAIL</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2 text-sm">MESSAGE</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none transition-colors resize-none"
                                        placeholder="Tell me about your project..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-neon-green text-black font-bold py-4 rounded-lg hover:bg-neon-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            SEND MESSAGE
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-[#111] rounded-lg p-8">
                            <h3 className="text-white font-bold mb-4 text-lg">GET IN TOUCH</h3>
                            <p className="text-gray-400 mb-6">
                                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                            </p>
                            <a
                                href="mailto:hello@sand.gallery"
                                className="flex items-center gap-3 text-neon-green hover:underline"
                            >
                                <Mail size={20} />
                                hello@sand.gallery
                            </a>
                        </div>

                        <div className="bg-[#111] rounded-lg p-8">
                            <h3 className="text-white font-bold mb-4 text-lg">SOCIAL</h3>
                            <div className="flex gap-4">
                                {SOCIAL_LINKS.map(social => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center text-gray-400 transition-colors hover:text-white`}
                                        aria-label={social.name}
                                    >
                                        <social.icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#111] to-[#1a1a1a] rounded-lg p-8 border border-[#333]">
                            <h3 className="text-white font-bold mb-4 text-lg">WHAT I DO</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Creative Direction
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Video Production
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Audio Design
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-neon-green rounded-full" />
                                    Web Development
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
