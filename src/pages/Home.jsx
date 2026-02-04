import React from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';

const Home = () => {
    // CMS Integration: usePageContent fetches 'home' doc from Firestore
    const { data, loading } = usePageContent('home');

    if (loading) {
        return (
            <div style={{ height: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Fallback loading state (optional: could mock the Hero skeleton) */}
            </div>
        );
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
