// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/ICoin.sol";
import "./interfaces/IZoraFactory.sol";

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
        uint256 likesCount;
        uint256 commentsCount;
        uint256 createdAt;
    }

    struct Comment {
        uint256 id;
        uint256 videoId;
        string comment;
        address author;
        uint256 createdAt;
    }

    mapping(uint256 id => Video video) public videos;
    mapping(uint256 id => Comment[] comments) public videoComments;
    mapping(uint256 videoId => mapping(address user => bool isLiked))
        public isVideoLikedByUser;

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

    event VideoCommented(
        uint256 indexed id,
        uint256 indexed videoId,
        string comment,
        address indexed author,
        uint256 createdAt
    );

    event VideoLikeToggled(
        uint256 indexed videoId,
        address indexed user,
        bool isLiked
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
        // config parameters for the Uniswap v3 pool; `abi.encode(address currency, int24 tickLower, int24 tickUpper, uint16 numDiscoveryPositions, uint256 maxDiscoverySupplyShare)`
        // values may not be accurate, and zora team isn't helpful in providing the right values at all
        bytes memory poolConfig = abi.encode(
            2, // version
            address(0), // currency use address(0) for ETH/WETH
            -250000, // tickLower -250000 for WETH/ETH pairs
            -200000, // tickUpper -200000 for for WETH/ETH pairs
            10, // numDiscoveryPositions
            50000000000000000 // maxDiscoverySupplyShare
        );
        // Deploy coin via ZoraFactory
        (address coinAddr, ) = zoraFactory.deploy{value: msg.value}(
            msg.sender, // payoutRecipient
            owners,
            metadataUri,
            name,
            symbol,
            poolConfig,
            msg.sender, // platformReferrer
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
            coinAddr,
            0, // likesCount
            0, // commentsCount
            block.timestamp
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

    function commentVideo(
        uint256 _videoId,
        string memory _comment
    ) external onlyExistingVideo(_videoId) {
        require(
            bytes(_comment).length > 0 && bytes(_comment).length <= 280,
            "Comment must be 1-280 characters long"
        );
        // Check if the sender holds the coin
        ICoin coin = ICoin(videos[_videoId].coinAddress);
        require(
            coin.balanceOf(msg.sender) > 0,
            "You must hold the video coin to comment"
        );
        uint256 commentId = videos[_videoId].commentsCount++;
        videoComments[_videoId].push(
            Comment(commentId, _videoId, _comment, msg.sender, block.timestamp)
        );
        emit VideoCommented(
            commentId,
            _videoId,
            _comment,
            msg.sender,
            block.timestamp
        );
    }

    function toggleLikeVideo(
        uint256 _videoId
    ) external onlyExistingVideo(_videoId) returns (bool isLiked) {
        // check if user has already liked the video
        bool isLikedAlready = isVideoLikedByUser[_videoId][msg.sender];
        // toggle like status and update likes count
        if (isLikedAlready) {
            videos[_videoId].likesCount--;
            isVideoLikedByUser[_videoId][msg.sender] = false;
            isLiked = false;
        } else {
            videos[_videoId].likesCount++;
            isVideoLikedByUser[_videoId][msg.sender] = true;
            isLiked = true;
        }
        emit VideoLikeToggled(_videoId, msg.sender, isLiked);
    }

    function getVideoComments(
        uint256 _videoId
    ) external view onlyExistingVideo(_videoId) returns (Comment[] memory) {
        return videoComments[_videoId];
    }
}
