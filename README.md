# VidVerse - Zora

### Overview

### How we built it

### How it works

## Getting Started

### 1. Deploying the Smart Contracts

This project is scaffolded using [hardhat](https://hardhat.org/docs). Please refer to the documentation for more information on folder structure and configuration.

> Copy the `.env.example` file to `.env` and update the environment variables with your own values.

```bash

npm install

npx hardhat compile

npx hardhat ignition deploy ./ignition/modules/VidVerse.ts --network baseSepolia
```

### 2. Running the Frontend

This project uses [Next.js](https://nextjs.org/) for the frontend. Please refer to the documentation for more information on folder structure and configuration.

> Copy the `.env.example` file to `.env` and update the environment variables with your own values.

```bash
cd frontend

npm install

npm run dev
```

### Screenshots

![vidverse-zora-video-page-sc](https://github.com/user-attachments/assets/127f0fa2-d181-4183-8e7e-884fe1166932)

## References

- [Zora App](https://zora.co/)
- [Trade coin - Zora](https://docs.zora.co/coins/sdk/trade-coin)
- [Factory contract - Zora](https://docs.zora.co/coins/contracts/factory)
- [Coin Contract - Zora ](https://docs.zora.co/coins/contracts/coin)
- [Zora SDK Docs](https://docs.zora.co/)
- [Ethers.js adapters - Wagmi](https://wagmi.sh/react/guides/ethers)
- [Appkit - Reown](https://docs.reown.com/appkit/overview)
- [Uploading files - Pinata](https://docs.pinata.cloud/files/uploading-files)
- [Route handlers - Next.js](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Safety & Security

This is an experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk. I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
