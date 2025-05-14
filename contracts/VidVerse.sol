// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";

interface IZoraFactory {
    function deploy(
        address payoutRecipient,
        address[] memory owners,
        string memory uri,
        string memory name,
        string memory symbol,
        address platformReferrer,
        address currency,
        int24 tickLower,
        uint256 orderSize
    ) external payable returns (address, uint256);
}

interface ICoin {
    function setContractURI(string memory newURI) external;

    function setPayoutRecipient(address newPayoutRecipient) external;

    function buy(
        address recipient,
        uint256 orderSize,
        uint256 minAmountOut,
        uint160 sqrtPriceLimitX96,
        address tradeReferrer
    ) external payable returns (uint256, uint256);

    function sell(
        address recipient,
        uint256 orderSize,
        uint256 minAmountOut,
        uint160 sqrtPriceLimitX96,
        address tradeReferrer
    ) external returns (uint256, uint256);

    function tokenURI() external view returns (string memory);

    function platformReferrer() external view returns (address);
}

contract VidVerse {
    using Strings for uint256;
    uint256 public nextVideoId;
    IZoraFactory public immutable zoraFactory;

    struct Video {
        uint256 id;
        string title;
        string description;
        string category;
        string location;
        string thumbnailHash;
        string videoHash;
        address owner;
        address coinAddress;
    }

    mapping(uint256 id => Video video) public videos;

    event VideoAdded(
        uint256 indexed id,
        string title,
        string description,
        string category,
        string location,
        string thumbnailHash,
        string videoHash,
        string metadataHash,
        address indexed owner,
        address indexed coinAddress
    );

    event VideoInfoUpdated(
        uint256 indexed id,
        string title,
        string description,
        string category,
        string location,
        string thumbnailHash,
        string metadataHash
    );

    constructor(address _zoraFactory) {
        zoraFactory = IZoraFactory(_zoraFactory);
    }

    modifier onlyExistingVideo(uint256 _videoId) {
        require(videos[_videoId].owner != address(0), "Video does not exist");
        _;
    }

    function addVideo(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _location,
        string memory _thumbnailHash,
        string memory _videoHash,
        string memory _metadataHash
    ) external payable {
        require(bytes(_videoHash).length > 0, "Video hash cannot be empty");
        require(
            bytes(_thumbnailHash).length > 0,
            "Thumbnail hash cannot be empty"
        );
        require(
            bytes(_metadataHash).length > 0,
            "Metadata hash cannot be empty"
        );
        require(bytes(_title).length > 0, "Title cannot be empty");
        uint256 videoId = nextVideoId++;
        // name and symbol should be unique for each video
        // like "VidVerse - <videoId>", "VID-<videoId>"
        string memory name = string(
            abi.encodePacked("VidVerse#", videoId.toString())
        );
        string memory symbol = string(
            abi.encodePacked("VV#", videoId.toString())
        );
        // metadataUri is the IPFS uri in the format of "ipfs://<metadataHash>"
        string memory metadataUri = string(
            abi.encodePacked("ipfs://", _metadataHash)
        );

        address[] memory owners = new address[](2);
        owners[0] = msg.sender;
        owners[1] = address(this); // contract itself is also an owner to update metadata and rewards share
        // Deploy coin via ZoraFactory
        (address coinAddr, ) = zoraFactory.deploy{value: msg.value}(
            msg.sender, // payoutRecipient
            owners,
            metadataUri,
            name,
            symbol,
            msg.sender, // platformReferrer
            address(0), // currency use address(0) for ETH/WETH
            -199200, // tickLower - 199200 for WETH/ETH pairs
            msg.value // orderSize - must match msg.value
        );

        videos[videoId] = Video(
            videoId,
            _title,
            _description,
            _category,
            _location,
            _thumbnailHash,
            _videoHash,
            msg.sender,
            coinAddr
        );

        emit VideoAdded(
            videoId,
            _title,
            _description,
            _category,
            _location,
            _thumbnailHash,
            _videoHash,
            _metadataHash,
            msg.sender,
            coinAddr
        );
    }

    function updateVideoInfo(
        uint256 _videoId,
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _location,
        string memory _thumbnailHash,
        string memory _metadataHash
    ) external onlyExistingVideo(_videoId) {
        Video storage video = videos[_videoId];
        require(
            video.owner == msg.sender,
            "Only Video owner can update video info"
        );
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(
            bytes(_thumbnailHash).length > 0,
            "Thumbnail hash cannot be empty"
        );
        require(
            bytes(_metadataHash).length > 0,
            "Metadata hash cannot be empty"
        );
        video.title = _title;
        video.description = _description;
        video.category = _category;
        video.location = _location;
        video.thumbnailHash = _thumbnailHash;
        // update metadata URI in the coin contract
        ICoin(video.coinAddress).setContractURI(
            string(abi.encodePacked("ipfs://", _metadataHash))
        );

        emit VideoInfoUpdated(
            _videoId,
            video.title,
            video.description,
            video.category,
            video.location,
            video.thumbnailHash,
            _metadataHash
        );
    }
}
