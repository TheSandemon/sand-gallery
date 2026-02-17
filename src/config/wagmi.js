import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

// Get WalletConnect project ID from env, fallback to empty string if not set
const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID || "";

export const wagmiConfig = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'Sand Gallery',
            preference: 'all',
        }),
        metaMask(),
        // Only include WalletConnect if project ID is provided
        ...(wcProjectId ? [
            walletConnect({
                projectId: wcProjectId,
            })
        ] : []),
    ],
    ssr: true,
    transports: {
        [base.id]: http(),
    },
});
