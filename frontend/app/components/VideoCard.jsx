import React from "react";
import { Card, Avatar, Typography, Image } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styles from "./VideoCard.module.css";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export default function VideoCard({ video }) {
  return (
    <Card
      style={{ borderRadius: 20 }}
      hoverable
      cover={
        <Image
          preview={false}
          alt={video?.title}
          src={`https://ipfs.io/ipfs/${video?.thumbnailHash}`}
          className={styles.thumbnail}
          style={{ minHeight: 200, maxHeight: 200 }}
        />
      }
      className={styles.card}
    >
      <Card.Meta
        avatar={
          <Avatar
            size="large"
            src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${video?.owner}`}
            style={{ border: "1px solid grey", cursor: "pointer" }}
          />
        }
        title={
          <div className={styles.metaTitle}>
            <Title level={5} className={styles.title}>
              {video?.title}
            </Title>
          </div>
        }
        description={
          <div>
            <Text className={styles.text}>
              {video?.owner?.slice(0, 9) +
                "..." +
                video?.owner?.slice(-5) +
                " "}
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            </Text>
            <Text className={styles.text}>
              {video?.category +
                " • " +
                dayjs(Number(video?.createdAt) * 1000).fromNow()}
            </Text>
          </div>
        }
      />
    </Card>
  );
}
