import React from 'react';
import usePageContent from '../hooks/usePageContent';
import DynamicRenderer from '../components/cms/DynamicRenderer';
import PageLoader from '../components/PageLoader';

const StudioPage = () => {
    const { data, loading } = usePageContent('studio', { realtime: false });

    if (loading) {
        return <PageLoader variant="default" />;
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
