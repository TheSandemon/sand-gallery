import React, { useEffect } from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';

const Gallery = () => {
    const { data, loading, error } = usePageContent('gallery');

    // Set page title
    useEffect(() => {
        if (data?.meta?.title) {
            document.title = data.meta.title;
        }
    }, [data]);

    if (loading) {
        return <PageLoader variant="grid" />;
    }

    if (error) {
        return (
            <div className="min-h-screen pt-[120px] text-center text-red-500">
                <p>Error loading gallery data.</p>
                <p className="text-sm text-gray-500">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* Dynamic Rendering of Sections */}
            <DynamicRenderer sections={data?.sections || []} />
        </div>
    );
};

export default Gallery;
