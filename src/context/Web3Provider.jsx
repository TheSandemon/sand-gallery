import React from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient();

const cdpApiKey = import.meta.env.VITE_CDP_API_KEY;

export const Web3Provider = ({ children }) => {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {cdpApiKey ? (
                    <OnchainKitProvider
                        apiKey={cdpApiKey}
                        chain={base}
                    >
                        {children}
                    </OnchainKitProvider>
                ) : (
                    children
                )}
            </QueryClientProvider>
        </WagmiProvider>
    );
};
