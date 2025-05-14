import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts
    },
    baseMainnet: {
      url: "https://mainnet.base.org",
      accounts
    }
  }
};

export default config;
