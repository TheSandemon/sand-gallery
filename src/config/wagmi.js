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
            projectId: import.meta.env.VITE_WC_PROJECT_ID || '8a3c067f960c1c4913334c72a26b1026', // Placeholder if not set
        }),
    ],
    ssr: true,
    transports: {
        [base.id]: http(),
    },
});
