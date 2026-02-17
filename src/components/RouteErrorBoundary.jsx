import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * RouteErrorBoundary - Wraps individual routes with their own error boundaries
 * This prevents one page crash from killing the entire app
 */
const RouteErrorBoundary = ({ children, fallback }) => {
    return (
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            {children}
        </ErrorBoundary>
    );
};

export default RouteErrorBoundary;
