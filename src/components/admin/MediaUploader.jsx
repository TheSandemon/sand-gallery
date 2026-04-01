import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import {
    Image, Film, Music, Gamepad2, AppWindow, Wrench, Tv, Link,
    Upload, Check, X
} from 'lucide-react';

const MEDIA_TYPES = [
    { id: 'image', label: 'Image', Icon: Image },
    { id: 'video', label: 'Video', Icon: Film },
    { id: 'audio', label: 'Audio', Icon: Music },
    { id: 'game', label: 'Game', Icon: Gamepad2 },
    { id: 'app', label: 'App', Icon: AppWindow },
    { id: 'tool', label: 'Tool', Icon: Wrench },
    { id: 'embed', label: 'Embed', Icon: Tv },
    { id: 'link', label: 'Link', Icon: Link },
];

const MediaUploader = ({ categories = [] }) => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [mediaType, setMediaType] = useState('image');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [embedUrl, setEmbedUrl] = useState('');
    const [isEmbed, setIsEmbed] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [category, setCategory] = useState('');
    const [githubRepo, setGithubRepo] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
            if (!name) {
                setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setError('');
            if (!name) {
                setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleCancel = () => {
        setFile(null);
        setName('');
        setDescription('');
        setUrl('');
        setEmbedUrl('');
        setGithubRepo('');
        setUploadProgress(0);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload media
    const handleUpload = async () => {
        if (!user) {
            setError('Please sign in first.');
            return;
        }

        if (!name.trim()) {
            setError('Please enter a name.');
            return;
        }

        // Validate based on type
        if (mediaType === 'image' || mediaType === 'audio' || mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') {
            if (!file && !url && !githubRepo) {
                setError('Please select a file, enter a URL, or provide a GitHub repo.');
                return;
            }
        } else if (mediaType === 'video') {
            if (!isEmbed && !file && !url) {
                setError('Please select a file or enter a URL.');
                return;
            }
        } else if (mediaType === 'embed' || mediaType === 'link') {
            if (!url.trim()) {
                setError('Please enter a URL.');
                return;
            }
        }

        setUploading(true);
        setError('');
        setUploadProgress(10);

        try {
            let finalUrl = url;
            let thumbnail = null;

            // Handle file upload
            if (file && !isEmbed) {
                setUploadProgress(30);
                let folder = 'media';
                if (mediaType === 'game') folder = 'games';
                else if (mediaType === 'app') folder = 'apps';
                else if (mediaType === 'tool') folder = 'tools';
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalUrl = await getDownloadURL(snapshot.ref);
                setUploadProgress(70);

                if (mediaType === 'image') {
                    thumbnail = finalUrl;
                }
                if (mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') {
                    thumbnail = finalUrl;
                }
            }

            setUploadProgress(80);

            // Handle embed URL (YouTube/Vimeo)
            if (isEmbed && embedUrl) {
                let embed = embedUrl;
                let videoId = null;

                if (embedUrl.includes('youtube.com/watch')) {
                    videoId = new URL(embedUrl).searchParams.get('v');
                    embed = `https://www.youtube.com/embed/${videoId}`;
                } else if (embedUrl.includes('youtu.be/')) {
                    videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                    embed = `https://www.youtube.com/embed/${videoId}`;
                } else if (embedUrl.includes('vimeo.com/')) {
                    videoId = embedUrl.split('vimeo.com/')[1]?.split('?')[0];
                    embed = `https://player.vimeo.com/video/${videoId}`;
                }

                finalUrl = embed;

                if (videoId && !thumbnail) {
                    thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                }
            }

            // Handle GitHub repo URL for games/apps/tools
            if ((mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') && githubRepo && !finalUrl) {
                const repoMatch = githubRepo.match(/github\.com[/:]([^\/]+)\/([^\/]+)/);
                if (repoMatch) {
                    const [, owner, repo] = repoMatch;
                    finalUrl = `https://${owner}.github.io/${repo}/`;
                }
            }

            setUploadProgress(90);

            // Save to Firestore
            await addDoc(collection(db, 'media'), {
                name: name.trim(),
                description: description.trim(),
                url: finalUrl,
                thumbnail: thumbnail || finalUrl,
                type: mediaType,
                category: category,
                githubRepo: githubRepo.trim() || null,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });

            setUploadProgress(100);

            // Reset form
            handleCancel();
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-[#111] rounded-xl p-6 md:p-8 border border-[#222]">
            <h3 className="text-white text-xl font-bold mb-6">Upload Media</h3>

            {/* Error display */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <X size={14} />
                    {error}
                </div>
            )}

            {/* Upload progress */}
            {uploading && (
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-[#222] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-neon-green transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Media Type Selection */}
            <div className="mb-6">
                <label className="block text-gray-400 mb-3 text-sm font-medium">Media Type</label>
                <div className="flex flex-wrap gap-2">
                    {MEDIA_TYPES.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setMediaType(id); setIsEmbed(id === 'embed'); setError(''); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                mediaType === id
                                    ? 'bg-neon-green text-black'
                                    : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Drag & Drop Zone (for uploadable types) */}
            {(mediaType === 'image' || mediaType === 'audio' || mediaType === 'game' || mediaType === 'app' || mediaType === 'tool' || (mediaType === 'video' && !isEmbed)) && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragOver
                            ? 'border-neon-green bg-neon-green/5'
                            : 'border-[#444] hover:border-[#555]'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                            mediaType === 'image' ? 'image/*' :
                            mediaType === 'audio' ? 'audio/*' :
                            mediaType === 'game' || mediaType === 'app' || mediaType === 'tool' ? '.html,.htm' :
                            'video/*'
                        }
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                    />
                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-neon-green">
                            <Check size={32} />
                            <span className="font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Upload size={32} />
                            <span>Drag & drop a file here, or click to browse</span>
                        </div>
                    )}
                </div>
            )}

            {/* URL Input (alternative to upload) */}
            {(mediaType === 'image' || mediaType === 'video') && (
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2 text-sm">Or enter a URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/media.jpg"
                        disabled={uploading}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50"
                    />
                </div>
            )}

            {/* Embed URL for videos */}
            {mediaType === 'video' && (
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-400 mb-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isEmbed}
                            onChange={(e) => setIsEmbed(e.target.checked)}
                            disabled={uploading}
                            className="accent-neon-green"
                        />
                        Use embed URL (YouTube/Vimeo)
                    </label>
                    {isEmbed && (
                        <input
                            type="url"
                            value={embedUrl}
                            onChange={(e) => setEmbedUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            disabled={uploading}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50 mt-2"
                        />
                    )}
                </div>
            )}

            {/* Link type */}
            {(mediaType === 'embed' || mediaType === 'link') && (
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2 text-sm">
                        {mediaType === 'embed' ? 'YouTube/Vimeo URL' : 'Link URL'}
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); if (mediaType === 'video') setEmbedUrl(e.target.value); }}
                        placeholder={mediaType === 'embed' ? 'https://youtube.com/watch?v=...' : 'https://example.com'}
                        disabled={uploading}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50"
                    />
                </div>
            )}

            {/* GitHub Repository URL (for games/apps/tools) */}
            {(mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') && (
                <div className="mb-4">
                    <label className="block text-gray-400 mb-2 text-sm">Or enter a GitHub Repository URL</label>
                    <input
                        type="url"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        disabled={uploading}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        For GitHub Pages: enable it in your repo settings, or use a service like gitcdn to embed directly
                    </p>
                </div>
            )}

            {/* Name */}
            <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Project"
                    disabled={uploading}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50"
                />
            </div>

            {/* Description */}
            <div className="mb-4">
                <label className="block text-gray-400 mb-2 text-sm">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this media..."
                    rows={3}
                    disabled={uploading}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors resize-none disabled:opacity-50"
                />
            </div>

            {/* Category */}
            <div className="mb-6">
                <label className="block text-gray-400 mb-2 text-sm">Category (optional)</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={uploading}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-neon-green focus:outline-none transition-colors disabled:opacity-50"
                >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {file && !uploading && (
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-3 bg-[#222] text-gray-400 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 bg-neon-green text-black rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            Upload Media
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default MediaUploader;
