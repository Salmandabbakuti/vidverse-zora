"use client";
import { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, theme } from "antd";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, base, baseSepolia } from "@reown/appkit/networks";

// 1. Get projectId at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
const networks = [baseSepolia, base, mainnet];

// 2. Create a metadata object
const metadata = {
  name: "VidVerse",
  description:
    "VidVerse is a decentralized video platform that allows users to upload, share, and monetize their videos using blockchain technology.",
  url: "https://mywebsite.com", // origin must match your domain & subdomain
  icons: ["https://avatars.mywebsite.com/"]
};

// 3. Create the AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  networks,
  projectId,
  defaultNetwork: baseSepolia,
  allowUnsupportedChain: false,
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#1677ff"
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    swaps: false,
    onramp: false,
    // socials: false, // should be false or provider only
    email: true,
    connectMethodsOrder: ["wallet", "social", "email"],
    emailShowWallets: true,
    legalCheckbox: true,
    termsConditionsUrl: "https://example.com/terms",
    privacyPolicyUrl: "https://example.com/privacy"
  }
});

export default function Web3Provider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <ConfigProvider
      theme={{
        algorithm: [theme.defaultAlgorithm]
      }}
    >
      {mounted && children}
    </ConfigProvider>
  );
}
