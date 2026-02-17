/**
 * WalletUI - Extracted from Navbar.jsx
 * Handles wallet connection UI using OnchainKit
 */
import React from 'react';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownBasename,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';

/**
 * Desktop wallet UI with full identity display
 * Shows avatar, name, address, and balance
 */
const WalletUIDesktop = () => (
    <Wallet>
        <ConnectWallet className="bg-[var(--accent-primary)] hover:opacity-80 text-black font-bold py-2 px-4 rounded transition-all duration-300">
            <Avatar className="h-6 w-6" />
            <Name />
        </ConnectWallet>
        <WalletDropdown className="bg-[var(--bg-main)] border border-[var(--accent-primary)]/20">
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-[var(--text-dim)]" />
                <EthBalance className="text-[var(--accent-secondary)]" />
            </Identity>
            <WalletDropdownBasename className="hover:bg-[var(--accent-primary)]/10" />
            <WalletDropdownDisconnect className="hover:bg-red-500/10 text-red-500" />
        </WalletDropdown>
    </Wallet>
);

/**
 * Mobile wallet UI - compact version
 */
const WalletUIMobile = () => (
    <Wallet>
        <ConnectWallet className="bg-[var(--accent-primary)] text-black font-bold py-3 px-6 rounded-lg">
            <Avatar />
            <Name />
        </ConnectWallet>
        <WalletDropdown className="bg-[var(--bg-main)] border border-[var(--accent-primary)]/20">
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-[var(--text-dim)]" />
                <EthBalance className="text-[var(--accent-secondary)]" />
            </Identity>
            <WalletDropdownBasename />
            <WalletDropdownDisconnect />
        </WalletDropdown>
    </Wallet>
);

export { WalletUIDesktop, WalletUIMobile };
export default Wallet;
