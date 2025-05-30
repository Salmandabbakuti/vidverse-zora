import { useEffect, useState } from "react";
import { Input, List, Avatar, Button, Space, Typography, message } from "antd";
import { CommentOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import { useEthersSigner } from "@/app/hooks/ethers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { vidverseContract, ellipsisString } from "@/app/utils";

dayjs.extend(relativeTime);

export default function CommentSection({ videoId }) {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const signer = useEthersSigner();

  const fetchVideoComments = async () => {
    setDataLoading(true);
    try {
      const videoComments = await vidverseContract.getVideoComments(videoId);
      console.log("videoComments", videoComments);
      // Map the comments to the expected format
      setComments(videoComments?.reverse());
    } catch (error) {
      console.error("Error fetching video comments:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!videoId) return;
    fetchVideoComments();
  }, [videoId]);

  const handleAddComment = async () => {
    console.log("commentInput", commentInput);
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:84532")
      return message.error("Please switch to Base Sepolia Testnet");
    if (!commentInput) return message.error("Comment cannot be empty");
    setLoading(true);
    try {
      const addCommentTx = await vidverseContract
        .connect(signer)
        .commentVideo(videoId, commentInput);
      setCommentInput("");
      console.log("addCommentTx", addCommentTx);
      // add comment to state
      const newComment = {
        id: addCommentTx?.hash,
        author: account,
        comment: commentInput,
        createdAt: Math.floor(Date.now() / 1000) // current timestamp in seconds
      };
      setComments((prevComments) => [newComment, ...prevComments]);
      message.success("Comment added!");
    } catch (error) {
      console.error(error);
      message.error("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography.Title level={5}>
        <CommentOutlined /> Holder Comments ({comments?.length || 0})
      </Typography.Title>
      <Typography.Text type="secondary">
        <InfoCircleOutlined /> Only coin holders can comment on this video.
        Please buy a coin to comment.
      </Typography.Text>
      <Input
        type="text"
        autoFocus={true}
        variant="borderless"
        placeholder="Add a public comment..."
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
        style={{ marginBottom: "10px" }}
        addonAfter={
          commentInput && (
            <Space>
              <Button
                shape="round"
                size="small"
                onClick={() => setCommentInput("")}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                shape="round"
                size="small"
                loading={loading}
                onClick={handleAddComment}
              >
                Submit
              </Button>
            </Space>
          )
        }
      />
      <List
        itemLayout="horizontal"
        dataSource={comments}
        rowKey={(item) => item?.id}
        split={false}
        loading={dataLoading}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="circle"
                  size="small"
                  style={{
                    cursor: "pointer",
                    border: "1px solid grey"
                  }}
                  src={`https://api.dicebear.com/5.x/open-peeps/svg?seed=${item?.author}`}
                />
              }
              title={
                <Space>
                  <Typography.Text strong>
                    {ellipsisString(item?.author, 8, 5)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {dayjs(Number(item?.createdAt) * 1000).fromNow()}
                  </Typography.Text>
                </Space>
              }
              description={item?.comment}
            />
          </List.Item>
        )}
      />
    </>
  );
}
