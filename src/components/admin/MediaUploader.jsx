import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

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

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
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
            if (!name) {
                setName(droppedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    // Upload media
    const handleUpload = async () => {
        if (!user) {
            alert('Please sign in first');
            return;
        }

        if (!name.trim()) {
            alert('Please enter a name');
            return;
        }

        // Validate based on type
        if (mediaType === 'image' || mediaType === 'audio' || mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') {
            if (!file && !url) {
                alert('Please select a file to upload');
                return;
            }
        } else if (mediaType === 'video') {
            if (!isEmbed && !file && !url) {
                alert('Please select a file or enter a URL');
                return;
            }
        } else if (mediaType === 'embed' || mediaType === 'link') {
            if (!url.trim()) {
                alert('Please enter a URL');
                return;
            }
        }

        setUploading(true);

        try {
            let finalUrl = url;
            let thumbnail = null;

            // Handle file upload
            if (file && !isEmbed) {
                // Upload games/apps/tools to respective folders, others to media/
                let folder = 'media';
                if (mediaType === 'game') folder = 'games';
                else if (mediaType === 'app') folder = 'apps';
                else if (mediaType === 'tool') folder = 'tools';
                const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalUrl = await getDownloadURL(snapshot.ref);

                // For images, use the URL as thumbnail
                if (mediaType === 'image') {
                    thumbnail = finalUrl;
                }
                // For games/apps/tools, use URL as both file and thumbnail
                if (mediaType === 'game' || mediaType === 'app' || mediaType === 'tool') {
                    thumbnail = finalUrl;
                }
            }

            // Handle embed URL (YouTube/Vimeo)
            if (isEmbed && embedUrl) {
                // Convert YouTube URL to embed URL and get thumbnail
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

                // Generate thumbnail for YouTube embeds
                if (videoId && !thumbnail) {
                    thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                }
            }

            // Save to Firestore
            await addDoc(collection(db, 'media'), {
                name: name.trim(),
                description: description.trim(),
                url: finalUrl,
                thumbnail: thumbnail || finalUrl,
                type: mediaType,
                category: category,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });

            // Reset form
            setName('');
            setDescription('');
            setUrl('');
            setEmbedUrl('');
            setFile(null);
            setCategory('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            alert('Media uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ background: '#111', borderRadius: '12px', padding: '2rem', border: '1px solid #222' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'white' }}>Upload Media</h3>

            {/* Media Type Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Media Type</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                        { id: 'image', label: 'Image', icon: '🖼️' },
                        { id: 'video', label: 'Video', icon: '🎬' },
                        { id: 'audio', label: 'Audio', icon: '🎵' },
                        { id: 'game', label: 'Game', icon: '🎮' },
                        { id: 'app', label: 'App', icon: '📱' },
                        { id: 'tool', label: 'Tool', icon: '🔧' },
                        { id: 'embed', label: 'Embed (YouTube)', icon: '📺' },
                        { id: 'link', label: 'Link', icon: '🔗' },
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => { setMediaType(type.id); setIsEmbed(type.id === 'embed'); }}
                            style={{
                                padding: '0.5rem 1rem',
                                background: mediaType === type.id ? 'var(--neon-green)' : '#222',
                                color: mediaType === type.id ? 'black' : '#888',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {type.icon} {type.label}
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
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? 'var(--neon-green)' : '#444'}`,
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        background: dragOver ? 'rgba(0,143,78,0.1)' : 'transparent',
                        transition: 'all 0.2s'
                    }}
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
                        style={{ display: 'none' }}
                    />
                    {file ? (
                        <div style={{ color: 'var(--neon-green)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                            <div>{file.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                    ) : (
                        <div style={{ color: '#666' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                            <div>Drag & drop a file here, or click to browse</div>
                        </div>
                    )}
                </div>
            )}

            {/* URL Input (alternative to upload) */}
            {(mediaType === 'image' || mediaType === 'video') && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Or enter a URL instead
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/media.jpg"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#0a0a0a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            )}

            {/* Embed URL for videos */}
            {mediaType === 'video' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', marginBottom: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isEmbed}
                            onChange={(e) => setIsEmbed(e.target.checked)}
                        />
                        Use embed URL (YouTube/Vimeo)
                    </label>
                    {isEmbed && (
                        <input
                            type="url"
                            value={embedUrl}
                            onChange={(e) => setEmbedUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Link type */}
            {(mediaType === 'embed' || mediaType === 'link') && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        {mediaType === 'embed' ? 'YouTube/Vimeo URL' : 'Link URL'}
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); if (mediaType === 'video') setEmbedUrl(e.target.value); }}
                        placeholder={mediaType === 'embed' ? 'https://youtube.com/watch?v=...' : 'https://example.com'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#0a0a0a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            )}

            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Project"
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this media..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category (optional)</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                    }}
                >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                    ))}
                </select>
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: uploading ? '#333' : 'var(--neon-green)',
                    color: uploading ? '#666' : 'black',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
        </div>
    );
};

export default MediaUploader;
