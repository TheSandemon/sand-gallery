import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const FeatureRoll = () => {
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

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

    // Handle video transition - start cross-fade
    const handleVideoEnd = () => {
        if (videos.length > 1) {
            setPreviousIndex(currentIndex);
            setCurrentIndex((prev) => (prev + 1) % videos.length);
            setIsTransitioning(true);
        }
    };

    // Clear previous video after cross-fade transition completes
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setPreviousIndex(null);
                setIsTransitioning(false);
            }, 2000); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    if (videos.length === 0) {
        return null;
    }

    const currentVideo = videos[currentIndex];

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
            {/* Previous Video (fading out during transition) */}
            {previousIndex !== null && (
                <video
                    key={`prev-${videos[previousIndex].id}`}
                    src={videos[previousIndex].url}
                    autoPlay
                    muted
                    className="absolute inset-0 w-full h-full object-cover animate-fade-out"
                />
            )}

            {/* Current Video (fading in during transition) */}
            <video
                key={currentVideo.id}
                src={currentVideo.url}
                autoPlay
                muted
                loop={videos.length === 1 && !isTransitioning}
                onEnded={handleVideoEnd}
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
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
