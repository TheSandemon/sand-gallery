import React from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';

const Pricing = () => {
    const { data, loading } = usePageContent('pricing');

    if (loading) {
        return (
            <div style={{ height: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Fallback loading state */}
            </div>
        );
    }

    return (
        <main>
            {data && data.sections ? (
                <DynamicRenderer sections={data.sections} />
            ) : (
                <DynamicRenderer sections={[]} />
            )}
        </main>
    );
};

export default Pricing;
