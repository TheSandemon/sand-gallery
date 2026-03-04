import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FeatureRoll = () => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const videoRef = useRef(null);
    const nextVideoRef = useRef(null);

    // Fetch videos from feature_roll category
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const docRef = doc(db, 'gallery_categories', 'feature_roll');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().items) {
                    const items = docSnap.data().items;
                    // Filter to only video type items
                    const videoItems = items.filter(item => item.type === 'video' || item.url);
                    setVideos(videoItems);
                }
            } catch (error) {
                console.error('Error fetching feature roll:', error);
            }
        };

        fetchVideos();
    }, []);

    // Handle video transition
    const handleVideoEnd = () => {
        if (videos.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
            setIsLoaded(false);
        }
    };

    const handleCanPlay = () => {
        setIsLoaded(true);
    };

    if (videos.length === 0) {
        return null;
    }

    const currentVideo = videos[currentIndex];
    const nextVideo = videos[(currentIndex + 1) % videos.length];

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
            {/* Current Video */}
            <video
                ref={videoRef}
                key={currentVideo.id}
                src={currentVideo.url}
                autoPlay
                muted
                loop={videos.length === 1}
                onEnded={handleVideoEnd}
                onCanPlay={handleCanPlay}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Next Video (preloaded, for seamless transition) */}
            {videos.length > 1 && (
                <video
                    ref={nextVideoRef}
                    key={`next-${nextVideo.id}`}
                    src={nextVideo.url}
                    preload="auto"
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-0"
                />
            )}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                }}
            />

            {/* Grain Effect */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />
        </div>
    );
};

export default FeatureRoll;
