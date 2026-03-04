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
            projectId: import.meta.env.VITE_WC_PROJECT_ID,
        }),
    ],
    ssr: true,
    transports: {
        [base.id]: http(),
    },
});
