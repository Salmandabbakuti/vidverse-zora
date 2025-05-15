"use client";
import { useState, useEffect, use, useMemo } from "react";
import {
  message,
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Skeleton,
  Divider,
  Button,
  Input,
  Empty,
  Space,
  Tabs,
  Image,
  Statistic,
  Descriptions
} from "antd";
import {
  HeartTwoTone,
  CheckCircleTwoTone,
  ShareAltOutlined,
  DownloadOutlined,
  ExportOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppKitAccount } from "@reown/appkit/react";
import relativeTime from "dayjs/plugin/relativeTime";
import { getCoin } from "@zoralabs/coins-sdk";
import Link from "next/link";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
// import VideoCard from "@/app/components/VideoCard";
import VideoEditDrawer from "@/app/components/VideoEditDrawer";
import { ellipsisString, vidverseContract } from "@/app/utils";
import { EXPLORER_URL } from "@/app/utils/constants";

const { Title, Text, Paragraph } = Typography;
dayjs.extend(relativeTime);

export default function VideoPage({ params }) {
  // const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [coinDetails, setCoinDetails] = useState(null);

  const { id } = use(params);
  const { address: account } = useAppKitAccount();
  console.log("account in watch page", account);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      // fetch videos from contract
      const nextVideoId = await vidverseContract.nextVideoId();
      console.log("Next video ID:", nextVideoId);
      const videosList = await Promise.all(
        Array.from({ length: Number(nextVideoId) }, (_, i) =>
          vidverseContract.videos(i)
        )
      );
      console.log("Videos fetched:", videosList);
      // get the video with the given id
      console.log("Video ID:", typeof id);
      const video = videosList.find(
        (video) => Number(video?.id).toString() === id
      );
      console.log("Video fetched:", video);
      setVideo(video);
      // set related videos
      // const relatedVideos = videosList.filter(
      //   (video) => Number(video?.id).toString() !== id
      // );
      // console.log("Related videos:", relatedVideos);
      // setRelatedVideos(relatedVideos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching video:", error);
      message.error("Failed to fetch video");
    }
  };

  const getCoinDetails = async () => {
    if (!video?.coinAddress) return;
    setLoading(true);
    try {
      const res = await getCoin({
        address: video?.coinAddress,
        chain: 84532 // base sepolia
      });
      console.log("Coin res:", res);
      const coin = res?.data?.zora20Token;
      console.log("Coin details:", coin);
      setCoinDetails(coin);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching coin details:", error);
    }
  };

  const isVideoOwner = useMemo(() => {
    if (!video || !account) return false;
    return video?.owner?.toLowerCase() === account?.toLowerCase();
  }, [video, account]);

  console.log("Video owner:", video?.owner);
  console.log("Account:", account);
  console.log("Is video owner:", isVideoOwner);

  useEffect(() => {
    fetchVideo();
  }, [id, account]);

  useEffect(() => {
    if (video?.coinAddress) {
      getCoinDetails();
    }
  }, [video?.coinAddress]);

  if (!loading && !video?.videoHash) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%"
        }}
      >
        <Empty description="Video not found" />
      </div>
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
                <Space size="middle">
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
                  View Video NFT On:
                </Typography.Text>
                {/* <a
                  title="OpenSea"
                  href={`https://testnets.opensea.io/assets/arbitrum_sepolia/${VIDVERSE_CONTRACT_ADDRESS}/${video?.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src="https://opensea.io/favicon.ico"
                    width={20}
                    height={20}
                    preview={false}
                    style={{ cursor: "pointer" }}
                  />
                </a> */}
                {/* view on rarible */}
                {/* <a
                  title="Rarible"
                  href={`https://testnet.rarible.com/token/arbitrum/${VIDVERSE_CONTRACT_ADDRESS}:${video?.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src="https://rarible.com/favicon.ico"
                    width={20}
                    height={20}
                    preview={false}
                    style={{ cursor: "pointer" }}
                  />
                </a> */}
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
              </Space>
              <Divider />
              {/* Channel Information */}
              <Row align="middle" gutter={8} style={{ margin: "5px" }}>
                <Col>
                  <Link href={`/channel/${video?.owner}`}>
                    <Avatar
                      size="large"
                      src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${video?.owner}`}
                      style={{ cursor: "pointer", border: "1px solid grey" }}
                    />
                  </Link>
                </Col>
                <Col>
                  <Link href={`/channel/${video?.owner}`}>
                    <Text strong>{ellipsisString(video?.owner, 12, 8)}</Text>{" "}
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  </Link>
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
        </Col>
        <Col xs={24} md={8}>
          {loading || !video ? (
            <Card loading style={{ borderRadius: "20px", minHeight: 400 }} />
          ) : (
            <Card
              title={coinDetails?.name || "Coin Details"}
              style={{ borderRadius: "20px" }}
              extra={
                <a
                  href={`${EXPLORER_URL}/token/${coinDetails?.address}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExportOutlined title="View on Etherscan" />
                </a>
              }
            >
              {/* Coin Statistics */}
              {/* <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Market Cap"
                    value={video?.marketCap || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Volume (24h)"
                    value={video?.volume24h || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12} style={{ marginTop: 16 }}>
                  <Statistic
                    title="Earnings"
                    value={video?.earnings || 0}
                    prefix="$"
                    precision={2}
                  />
                </Col>
                <Col span={12} style={{ marginTop: 16 }}>
                  <Statistic title="Holders" value={video?.holders || 0} />
                </Col>
              </Row> */}
              {/* coin stats with Descriptions component */}
              <Descriptions
                layout="vertical"
                column={2}
                colon={false}
                size="small"
                items={[
                  {
                    label: "Market Cap",
                    children: (
                      <Statistic
                        value={coinDetails?.marketCap || 0}
                        prefix="$"
                        precision={2}
                      />
                    )
                  },
                  {
                    label: "Volume (24h)",
                    children: (
                      <Statistic
                        value={video?.volume24h || 0}
                        prefix="$"
                        precision={2}
                      />
                    )
                  },
                  {
                    label: "Total Vol",
                    children: (
                      <Statistic
                        value={coinDetails?.totalVolume || 0}
                        prefix="$"
                        precision={2}
                      />
                    )
                  },
                  {
                    label: "Earnings",
                    children: (
                      <Statistic
                        value={video?.earnings || 0}
                        prefix="$"
                        precision={2}
                      />
                    )
                  },
                  {
                    label: "Holders",
                    children: (
                      <Statistic value={coinDetails?.uniqueHolders || 0} />
                    )
                  },
                  {
                    label: "Total Supply",
                    children: (
                      <Statistic value={coinDetails?.totalSupply || 0} />
                    )
                  }
                ]}
              />
              <Divider />
              {/* Buy/Sell Section */}
              <Space style={{ width: "100%", justifyContent: "center" }}>
                <Input placeholder="Amount" type="number" min={0} />
                <Button
                  variant="solid"
                  shape="round"
                  style={{
                    backgroundColor: "#02bf76",
                    color: "white"
                  }}
                >
                  Buy
                </Button>
                <Button color="red" variant="solid" shape="round">
                  Sell
                </Button>
              </Space>
              <Divider />
              {/* Tabs Section */}
              <Tabs
                defaultActiveKey="comments"
                items={[
                  {
                    key: "comments",
                    label: "Comments",
                    children: <Empty description="No comments yet" />
                  },
                  {
                    key: "holders",
                    label: `Holders (${coinDetails?.uniqueHolders || 0})`,
                    children: <Empty description="No holders yet" />
                  },
                  {
                    key: "activity",
                    label: "Activity",
                    children: <Empty description="No activity yet" />
                  },
                  {
                    key: "details",
                    label: "Details",
                    children: (
                      <Descriptions
                        column={1}
                        colon={false}
                        size="large"
                        items={[
                          {
                            label: "Name",
                            children: coinDetails?.name || "-"
                          },
                          {
                            label: "Symbol",
                            children: coinDetails?.symbol || "-"
                          },
                          {
                            label: "Address",
                            children: coinDetails?.address || "-"
                          },
                          {
                            label: "Chain",
                            children: coinDetails?.chainId || "-"
                          },
                          {
                            label: "Creator",
                            children: coinDetails?.creatorAddress || "-"
                          },
                          {
                            label: "Created At",
                            // createdAt is in 2025-05-14T11:14:30 format
                            children: dayjs(coinDetails?.createdAt || 0).format(
                              "h:mm A MMM D, YYYY"
                            )
                          }
                          // Add more details as needed
                        ]}
                      />
                    )
                  }
                ]}
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
