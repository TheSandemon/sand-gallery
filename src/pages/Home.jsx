import React from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';

const Home = () => {
    // CMS Integration: usePageContent fetches 'home' doc from Firestore
    const { data, loading } = usePageContent('home');

    if (loading) {
        return <PageLoader variant="hero" />;
    }

    return (
        <main>
            {data && data.sections ? (
                <DynamicRenderer sections={data.sections} />
            ) : (
                /* Fallback if data loading completely fails, though hook handles defaults */
                <DynamicRenderer sections={[]} />
            )}
        </main>
    );
};

export default Home;
