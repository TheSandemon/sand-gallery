import React from 'react';
import { useParams } from 'react-router-dom';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';
import UnifiedHero from '../components/hero/UnifiedHero';

/**
 * Home Page
 * 
 * Uses UnifiedHero when no CMS content exists.
 * CMS content takes precedence via DynamicRenderer.
 */
const Home = () => {
    const { data, loading } = usePageContent('home', { realtime: false });

    if (loading) {
        return <PageLoader variant="hero" />;
    }

    const hasContent = data && data.sections && data.sections.length > 0;

    return (
        <main>
            {hasContent ? (
                <DynamicRenderer sections={data.sections} />
            ) : (
                <UnifiedHero />
            )}
        </main>
    );
};

export default Home;
