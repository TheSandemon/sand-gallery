/**
 * AppProviders - Composite Context Provider
 * Flattens the 5-level context nesting in App.jsx
 * 
 * Providers (in order):
 * 1. ThemeProvider - Theme state and CSS variables
 * 2. Web3Provider - Wallet connection and blockchain state
 * 3. AuthProvider - User authentication state
 * 4. WishlistProvider - User's saved/favorite items
 * 5. Router - React Router (wraps children)
 */
import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { Web3Provider } from '../context/Web3Provider';
import { AuthProvider } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';

/**
 * Inner provider wrapper - avoids double Router
 */
const ProviderChain = ({ children }) => {
    return (
        <ThemeProvider>
            <Web3Provider>
                <AuthProvider>
                    <WishlistProvider>
                        {children}
                    </WishlistProvider>
                </AuthProvider>
            </Web3Provider>
        </ThemeProvider>
    );
};

/**
 * AppProviders - Use this instead of nesting providers manually
 * 
 * @param {React.ReactNode} children - Child components
 * @param {boolean} includeRouter - Whether to include Router (default: true)
 * 
 * @example
 * // Before (5-level nesting in App.jsx):
 * <ThemeProvider>
 *   <Web3Provider>
 *     <AuthProvider>
 *       <WishlistProvider>
 *         <Router>
 *           <App />
 *         </Router>
 *       </WishlistProvider>
 *     </AuthProvider>
 *   </Web3Provider>
 * </ThemeProvider>
 * 
 * // After (single component):
 * <AppProviders>
 *   <App />
 * </AppProviders>
 */
const AppProviders = ({ children, includeRouter = true }) => {
    const content = <ProviderChain>{children}</ProviderChain>;
    
    if (includeRouter) {
        return <Router>{content}</Router>;
    }
    
    return content;
};

export default AppProviders;
