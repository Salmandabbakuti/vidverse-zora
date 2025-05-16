# VidVerse - Zora

A decentralized video‑sharing platform where every video is a tradable token powered by Zora Coins Protocol

### Overview

VidVerse is a decentralized, ad-free video sharing platform empowering content creators to monetize their work through Zora Coins. Each video is a tradable token, allowing creators to earn from their content while maintaining ownership and control. The platform is built on the Zora protocol, enabling seamless integration with the Zora ecosystem. Viewers can watch content, trade fractional stakes in videos, and earn rewards—transforming passive views into active market engagement.

![vidverse-zora-video-page-sc](https://github.com/user-attachments/assets/3d72cd70-e6eb-49e6-bd92-0b7633def266)

### Problem it solves

Today’s creator platforms are controlled by centralized entities that decide who gets reach, how they get paid, and how creators interact with their audience, lack of ownership for creators, and limited monetization options. VidVerse addresses these challenges by providing a decentralized platform where creators can tokenize their videos, allowing them to earn directly from their audience without relying on ads or intermediaries.

- **Decentralization**: Unlike traditional platforms, VidVerse is built on a decentralized protocol, ensuring that creators retain ownership and control over their content.
- **Tokenization**: Each video is represented as a tradable token, allowing creators to monetize their work directly through the Zora Coins Protocol.
- **Fractional Ownership**: Viewers can purchase fractional stakes in videos, enabling them to invest in content they believe in and earn rewards based on the video's performance.
- **Community Engagement**: The platform fosters a community-driven approach, where viewers can actively participate in the success of their favorite creators by trading and investing in videos.
- **Ad-Free Experience**: VidVerse is ad-free. No ads, no tracking, and no data collection. Enjoy a clean and private viewing experience. This also means that creators can monetize their content in a fairer way, without relying on ad revenue.
- **Incentives for Viewers**: Viewers can earn rewards by engaging with content, creating a win-win situation for both creators and their audience.
- **Familiar User Experience**: VidVerse is designed to be familiar to users of traditional video sharing platforms like YouTube. This means that creators can easily transition to VidVerse without having to learn a new platform, and viewers can easily find and interact with content.

### Tech Stack

- **Frontend**: React.js, Next.js, Antdesign
- **Wallet Management**: Reown Appkit
- **Web3 Client**: Wagmi, viem, Ethers.js
- **Smart Contracts**: Solidity, Hardhat, openzeppelin, Zora Contracts
- **Storage**: IPFS, Pinata
- **Blockchain**: Base Sepolia
- **Data Indexing**: TheGraph

### How we built it

#### 1. Smart Contracts: [`contracts/VidVerse.sol`](contracts/VidVerse.sol)

- **Registry & Storage**

  - `Video` struct holds video metadata and offchain pointers: `title`, `description`, `category`, `location`, `videoHash`, `thumbnailHash`, `metadataHash`, `coinAddress`, `owner`, `timestamp`.
  - `mapping(uint256 ⇒ Video)` tracks videos by `videoId`.

- **Core Functions**

  - `addVideo(...)`

    - Validates inputs
    - Constructs `metadataUri` (`ipfs://<metadataHash>`)
    - Calls `ZoraFactory.deploy{value: msg.value}` to deploy a Zora ERC‑20 coin with relevant parameters
    - Creates a new `Video` struct with video metadata, offchain pointers, coinAddress and stores it in the `videos` mapping with a unique `videoId`
    - Emits `VideoAdded` with all relevant IDs and hashes

  - `updateVideoInfo(...)`

    - Only owner can call
    - Pins new metadata off‑chain and calls `ICoin.setContractURI(newUri)`
    - Updates video metadata in the `videos` mapping and emits `VideoInfoUpdated`

2. **IPFS Pinning Service**: [`frontend/app/utils/pinata.js`](frontend/app/utils/pinata.js)

   - **pinFilesToIPFS(files, options)**

     - Uploads multiple blobs (video + thumbnail) into a single IPFS folder
     - Returns a base `folderCID` for asset URIs

   - **pinJSONToIPFS(json, options)**

     - Uploads metadata JSON blob to IPFS
     - Returns its own `metadataCID`

3. **Backend API Routes (/api/pinata/upload.ts):** [`frontend/app/api/pinata/upload/route.js`](frontend/app/api/pinata/upload/route.js)

   - **POST**

     1. Parses `FormData` for `thumbnailFile`, `videoFile`, and JSON `metadataBase`.
     2. Conditionally pins files (if present) to IPFS, retrieving `folderCID`.
     3. Builds `finalMetadata` with IPFS URIs:

        ```json
        {
          "name": "...",
          "description": "...",
          "external_url": "https://vidverse.xyz/videos/<videoId>",
          "image": "ipfs://<folderCID>/thumb.png",
          "animation_url": "ipfs://<folderCID>/video.mp4",
          "properties": {
            "category": "...",
            "location": "..."
          }
        }
        ```

     4. Pins `finalMetadata` via `pinJSONToIPFS` → `metadataCID`.
     5. Returns all three CIDs in JSON: `{ thumbnail, video, metadata }`.

4. **Frontend Application (React + Next.js)**

   - **Upload Form**: [`frontend/app/components/UploadDrawer.jsx`](frontend/app/components/UploadDrawer.jsx)

     - File inputs for video & thumbnail, text inputs for title/description/etc.
     - Uses `FormData` to send files and JSON metadata to `/api/pinata/upload`.
     - Api route handles file uploads and returns IPFS CIDs.

   - **On-Chain Interaction**

     - After receiving CIDs, uses `ethers.js` to call `VidVerse.addVideo(...)` with all hashes and metadata fields.

   - **Video Gallery & Detail:** [`frontend/app/components/VideoCard.jsx`](frontend/app/components/VideoCard.jsx), [`frontend/app/watch/[id]/page.jsx`](frontend/app/watch/[id]/page.jsx)

     - Reads on‑chain `videos` mapping via direct contract calls.
     - Renders IPFS assets using `https://ipfs.io/ipfs/<hash>`.
     - Displays Video cards with title, thumbnail, category, and location.
     - On click, navigates to a detailed view with video player and metadata.
     - Uses `plyr-react` for video playback.

   - **Market & Stats UI**: [`frontend/app/components/CoinCard.jsx`](frontend/app/components/CoinCard.jsx)

     - Integrates with Zora’s sdk to show market cap, volume, liquidity, and holder counts of coined video.
     - Allows users to buy/sell via the Uniswap V3 pool of each video coin using zora sdk.

Each layer communicates via minimal, gas‑efficient pointers (IPFS CIDs and ERC‑20 addresses), creating a modular, scalable stack for decentralized video publishing and tokenized marketplaces.

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

![vidverse-zora-video-page-sc](https://github.com/user-attachments/assets/3d72cd70-e6eb-49e6-bd92-0b7633def266)

## Changelog

### 0.1.0

- Initial release
- Video & metadata upload functionality
- Coin‑izing videos via Zora Factory (on‑chain ERC‑20 mint)
- Video playback with metadata display and coin stats and trading functionality
- Update coin metadata when video info is updated

## Roadmap

- [ ] Subscription based content/holders only content(premium content). how about like onlyfans but onlyHolders
- [ ] Tag-based and full-text search, filtering, sorting videos
- [ ] Add support for video comments and likes
- [ ] Add support for video playlists and channels
- [ ] Implement video recommendations and related videos based on trade volume, watch time, and user stakes
- [ ] Royalties & splits for creators

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
