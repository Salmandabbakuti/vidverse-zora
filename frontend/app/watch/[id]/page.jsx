"use client";
import { useState, useEffect, use, useMemo } from "react";
import {
  message,
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Divider,
  Button,
  Empty,
  Space,
  Image,
  Tabs,
  Result
} from "antd";
import {
  HeartTwoTone,
  CheckCircleTwoTone,
  ShareAltOutlined,
  DownloadOutlined,
  LikeOutlined,
  LikeFilled
} from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import { useEthersSigner } from "@/app/hooks/ethers";
import relativeTime from "dayjs/plugin/relativeTime";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import VideoEditDrawer from "@/app/components/VideoEditDrawer";
import CoinCard from "@/app/components/CoinCard";
import CommentSection from "@/app/components/CommentSection";
import { ellipsisString, vidverseContract } from "@/app/utils";
import { EXPLORER_URL } from "@/app/utils/constants";

const { Title, Text, Paragraph } = Typography;
dayjs.extend(relativeTime);

export default function VideoPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isVideoLiked, setIsVideoLiked] = useState(false);

  const { id } = use(params);
  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();

  const signer = useEthersSigner();

  const fetchVideo = async () => {
    setLoading(true);
    try {
      // fetch video from contract
      const video = await vidverseContract.videos(id);
      console.log("Video fetched:", video);
      console.log(video?.createdAt, "createdAt");
      console.log(video?.likesCount, "likesCount");
      console.log(video?.commentsCount, "commentsCount");
      setVideo(video);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching video:", error);
      message.error("Failed to fetch video");
    }
  };

  const handleToggleLikeVideo = async () => {
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:84532")
      return message.error("Please switch to Base Sepolia Testnet");
    setIsLiking(true);
    try {
      const toggleLikeTx = await vidverseContract
        .connect(signer)
        .toggleLikeVideo(id);
      console.log("Transaction submitted:", toggleLikeTx);
      await toggleLikeTx.wait();
      // Update local state to reflect the like
      setIsVideoLiked((prev) => !prev);
      message.success(
        `Video ${isVideoLiked ? "unliked" : "liked"} successfully!`
      );
    } catch (error) {
      console.error("Error liking video:", error);
      message.error("Failed to like video. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  const isVideoLikedByUser = async () => {
    if (!account) return false; // If no account is connected, return false
    try {
      const isLiked = await vidverseContract.isVideoLikedByUser(id, account);
      console.log(`Video ${id} liked by user ${account}: ${isLiked}`);
      setIsVideoLiked(isLiked);
      return isLiked;
    } catch (err) {
      console.error("Failed to check if video is liked by user:", err);
      return false;
    }
  };

  const isVideoOwner = useMemo(() => {
    if (!video || !account) return false;
    return video?.owner?.toLowerCase() === account?.toLowerCase();
  }, [video, account]);

  useEffect(() => {
    fetchVideo();
    if (account) {
      isVideoLikedByUser();
    }
  }, [id, account]);

  if (!loading && !video?.videoHash) {
    return (
      <Result
        status="404"
        title="Video Not Found"
        subTitle="Sorry, the video you are looking for does not exist."
        extra={
          <Link href="/">
            <Button type="primary" shape="round">
              Back Home
            </Button>
          </Link>
        }
      />
    );
  }
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          {loading ? (
            <Card
              loading
              style={{ borderRadius: "20px" }}
              cover={
                <div
                  style={{
                    height: 400,
                    borderRadius: 20
                  }}
                />
              }
            />
          ) : (
            <div
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: "white",
                padding: "10px"
              }}
            >
              {/* Video Section */}
              <Plyr
                style={{ borderRadius: "10px", overflow: "hidden" }}
                autoPlay
                options={{ autoplay: true }}
                controls
                source={{
                  type: "video",
                  sources: [
                    {
                      src: `https://ipfs.io/ipfs/${video?.videoHash}`,
                      type: "video/mp4"
                    }
                  ]
                }}
              />

              {/* Video Title */}
              <Space
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  display: "flex",
                  marginTop: "10px"
                }}
              >
                {/* Title on the left */}
                <Title level={5} style={{ margin: 0 }}>
                  {video?.title}
                </Title>
                {/* Actions on the right */}
                <Space size="small" wrap>
                  <Button
                    type="text"
                    loading={isLiking}
                    icon={
                      isVideoLiked ? (
                        <LikeFilled style={{ color: "#1677ff" }} />
                      ) : (
                        <LikeOutlined style={{ color: "#1677ff" }} />
                      )
                    }
                    onClick={handleToggleLikeVideo}
                  >
                    {video?.likesCount || 0}
                  </Button>
                  <a
                    href={`https://ipfs.io/ipfs/${video?.videoHash}`}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Button type="text" icon={<DownloadOutlined />} />
                  </a>
                  <Button
                    type="text"
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: `${video?.title} | VidVerse`,
                            text: `${video?.title} | VidVerse`,
                            url: window.location.href
                          })
                          .catch((err) =>
                            console.error("Failed to share video:", err)
                          );
                      } else {
                        console.log(
                          "Web Share API not supported in your browser"
                        );
                        navigator.clipboard.writeText(window.location.href);
                        message.success("Link copied to clipboard");
                      }
                    }}
                  />
                  {isVideoOwner && <VideoEditDrawer video={video} />}
                </Space>
              </Space>

              <br />
              {/* Video Description and Info */}
              <Text type="secondary">
                {`${dayjs(Number(video?.createdAt) * 1000).format(
                  "h:mm A MMM D, YYYY"
                )} (${dayjs(Number(video?.createdAt) * 1000).fromNow()}) • ${
                  video?.category
                } • ${video?.location}`}
              </Text>
              <Paragraph
                ellipsis={{ rows: 1, expandable: true, symbol: "more" }}
              >
                {video?.description}
              </Paragraph>
              {/* view on opensea link */}
              <Space>
                <Typography.Text type="secondary">
                  View Video Coin On:{" "}
                </Typography.Text>
                {/* view on etherscan */}
                <a
                  title="NERO Scan"
                  href={`${EXPLORER_URL}/token/${video?.coinAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src="https://etherscan.io/favicon.ico"
                    style={{ cursor: "pointer" }}
                    width={20}
                    height={20}
                    preview={false}
                  />
                </a>
                {/* View on zora app */}
                <a
                  title="View on Zora"
                  href={`https://testnet.zora.co/coin/bsep:${video?.coinAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src="https://zora.co/favicon.ico"
                    style={{ cursor: "pointer" }}
                    width={20}
                    height={20}
                    preview={false}
                  />
                </a>
              </Space>
              <Divider />
              {/* Channel Information */}
              <Row align="middle" gutter={8} style={{ margin: "5px" }}>
                <Col>
                  <Avatar
                    size="large"
                    src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${video?.owner}`}
                    style={{ cursor: "pointer", border: "1px solid grey" }}
                  />
                </Col>
                <Col>
                  <Text strong>{ellipsisString(video?.owner, 12, 8)}</Text>{" "}
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                  <br />
                  <Button
                    icon={<HeartTwoTone twoToneColor="#eb2f96" />}
                    type="primary"
                    shape="round"
                    size="small"
                    style={{ marginTop: "5px" }}
                  >
                    Support
                  </Button>
                </Col>
              </Row>
            </div>
          )}
          <div
            style={{
              marginTop: "5px",
              overflow: "hidden",
              borderRadius: "10px",
              backgroundColor: "white",
              padding: "10px"
            }}
          >
            <CommentSection videoId={id} />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <CoinCard coinAddress={video?.coinAddress} />
        </Col>
      </Row>
    </div>
  );
}
