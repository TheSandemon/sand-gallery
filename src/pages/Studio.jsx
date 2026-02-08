import React from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';

const StudioPage = () => {
    const { data, loading } = usePageContent('studio');

    if (loading) {
        return <div style={{ minHeight: '100vh', background: '#000' }} />;
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

export default StudioPage;
