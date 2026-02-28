import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'Sand Gallery',
            preference: 'all',
        }),
        metaMask(),
        walletConnect({
            projectId: 'f410f0efd044c134d2af196d3951aea95' || import.meta.env.VITE_WC_PROJECT_ID, 
        }),
    ],
    ssr: true,
    transports: {
        [base.id]: http(),
    },
});
