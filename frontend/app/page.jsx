"use client";
import { useState, useEffect } from "react";
import {
  message,
  Row,
  Col,
  Card,
  Empty,
  Select,
  Space,
  Typography
} from "antd";
import { SwapOutlined } from "@ant-design/icons";
import Link from "next/link";
import VideoCard from "./components/VideoCard";
import { vidverseContract } from "@/app/utils";
import styles from "./page.module.css";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // fetch videos from contract
      const nextVideoId = await vidverseContract.nextVideoId();
      const videosList = await Promise.all(
        Array.from({ length: Number(nextVideoId) }, (_, i) =>
          vidverseContract.videos(i)
        )
      );
      console.log("Videos fetched:", videosList);
      setVideos(videosList?.reverse());
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching videos:", error);
      message.error("Failed to fetch videos");
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <>
      {/* Sort Dropdown */}
      <div
        title="Sort videos"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
          marginTop: 10
        }}
      >
        <SwapOutlined
          style={{
            fontSize: 17,
            marginRight: 5,
            transform: "rotate(90deg) scaleY(-1)"
          }}
        />
        <Select
          defaultValue="createdAt_desc"
          onChange={(value) => {}}
          style={{ width: 150 }}
        >
          <Option value="createdAt_desc">Newest First</Option>
          <Option value="createdAt_asc">Oldest First</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} justify="start" className={styles.grid}>
        {loading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card
                loading
                style={{ borderRadius: 20 }}
                cover={
                  <div
                    style={{
                      height: 150,
                      borderRadius: 20
                    }}
                  />
                }
              />
            </Col>
          ))
        ) : videos?.length === 0 ? (
          <Empty
            style={{
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              width: "100%"
            }}
            description={
              <Space direction="vertical" size={2} align="center">
                <Title level={5}>No Videos Found</Title>
                <Text type="secondary">
                  Try adjusting your search or filters, or check back later for
                  new content.
                </Text>
                <Text>
                  <span role="img" aria-label="film">
                    🎬
                  </span>{" "}
                  Discover and share amazing videos on <b>VidVerse</b>!
                </Text>
              </Space>
            }
          />
        ) : (
          videos.map((video) => (
            <Col key={video?.id} xs={24} sm={12} md={8} lg={6}>
              <Link href={`/watch/${video?.id}`}>
                <VideoCard video={video} />
              </Link>
            </Col>
          ))
        )}
      </Row>
    </>
  );
}
