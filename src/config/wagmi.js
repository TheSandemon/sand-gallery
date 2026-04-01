import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID;

export const wagmiConfig = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'Sand Gallery',
            preference: 'all',
        }),
        metaMask(),
        ...(wcProjectId ? [walletConnect({ projectId: wcProjectId })] : []),
    ],
    ssr: true,
    transports: {
        [base.id]: http(),
    },
});
