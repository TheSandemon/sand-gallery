import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient();

// Check if required config is available
const cdpApiKey = import.meta.env.VITE_CDP_API_KEY;

export const Web3Provider = ({ children }) => {
    // If no CDP API key, still render children but OnchainKit might show limited functionality
    // This allows the app to work in demo/development mode
    
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    apiKey={cdpApiKey || "demo"} // Use demo key to prevent crash
                    chain={base}
                >
                    {children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
