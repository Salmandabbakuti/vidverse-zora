import { Contract, JsonRpcProvider } from "ethers";
import { VIDVERSE_CONTRACT_ADDRESS } from "./constants";

const VIDVERSE_ABI = [
  "function addVideo(string _title, string _description, string _category, string _location, string _thumbnailHash, string _videoHash, string _metadataHash) payable",
  "function updateVideoInfo(uint256 _videoId, string _title, string _description, string _category, string _location, string _thumbnailHash, string _metadataHash)",
  "function commentVideo(uint256 _videoId, string _comment)",
  "function videos(uint256 id) view returns (uint256 id, string title, string description, string category, string location, string thumbnailHash, string videoHash, address owner, address coinAddress, uint256 createdAt)",
  "function getVideoComments(uint256 _videoId) view returns (tuple(uint256 id, uint256 videoId, string comment, address author, uint256 createdAt)[])",
  "function nextVideoId() view returns (uint256)",
  "function zoraFactory() view returns (address)"
];

const defaultProvider = new JsonRpcProvider("https://sepolia.base.org", 84532, {
  staticNetwork: true
});

export const vidverseContract = new Contract(
  VIDVERSE_CONTRACT_ADDRESS,
  VIDVERSE_ABI,
  defaultProvider
);

export const ellipsisString = (str, first, last) =>
  str.slice(0, first) + "..." + str.slice(-last);

export const abbreviateNumber = (number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(number);
