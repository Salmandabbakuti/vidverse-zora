import { useState } from "react";
import { Drawer, Form, Input, Select, Space, Button, message } from "antd";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import {
  useAppKitProvider,
  useAppKitAccount,
  useAppKitState
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { vidverseContract } from "@/app/utils";

export default function UploadDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [thumbnailFileInput, setThumbnailFileInput] = useState(null);
  const [videoFileInput, setVideoFileInput] = useState(null);
  const [loading, setLoading] = useState(false);

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const { walletProvider } = useAppKitProvider("eip155");
  const router = useRouter();

  const handleSubmit = async (values) => {
    console.log("thumbnail", thumbnailFileInput);
    console.log("video", videoFileInput);
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:84532")
      return message.error("Please switch to Base Sepolia Testnet");
    if (!thumbnailFileInput || !videoFileInput) {
      message.error("Please upload a video and thumbnail");
      return;
    }
    setLoading(true);
    message.info("Uploading video and thumbnail to IPFS");
    // const [videoHash, thumbnailHash] = await upload({
    //   files: [videoFileInput, thumbnailFileInput]
    // });
    // TODO Upload logic using pinata
    // first upload the video, then the thumbnail
    // then construct metadata and upload it {name, description, image, external_url, animation_url properties {category, location}}
    // image is the thumbnail, animation_url is the video should be in ipfs://<CID> format
    console.log("uploadRes ->v,t", videoHash, thumbnailHash);
    const thumbnailCID = thumbnailHash.split("://")[1];
    const videoCID = videoHash.split("://")[1];
    const metadataCID = metadataHash.split("://")[1];
    console.log("metadataCID", metadataCID);
    console.log("thumbnailCID", thumbnailCID);
    console.log("videoCID", videoCID);
    message.success("Thumbnail and video are uploaded to IPFS");
    message.info("Adding video info to the contract");
    try {
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const tx = await vidverseContract
        .connect(signer)
        .addVideo(
          values.title,
          values.description,
          values.category,
          values.location,
          thumbnailCID,
          videoCID,
          metadataCID
        );
      await tx.wait();
      message.success(
        "Video uploaded successfully. Redirecting to home page..."
      );
      setDrawerOpen(false);
      // Refresh the page to show the new video after 3 seconds
      setTimeout(() => router.push("/"), 5000);
    } catch (error) {
      console.error(error);
      message.error("Failed to upload video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<VideoCameraAddOutlined />}
        shape="circle"
        size="large"
        onClick={() => setDrawerOpen(true)}
      />
      <Drawer
        title="Upload Video"
        width={620}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="video"
            label="Video"
            rules={[{ required: true, message: "Please upload a video" }]}
          >
            <Space direction="vertical">
              <Input
                type="file"
                accept="video/*, audio/*"
                onChange={(e) => {
                  setVideoFileInput(e.target.files[0]);
                }}
              />
              {videoFileInput && (
                <video
                  style={{ border: "1px solid grey" }}
                  width={450}
                  height={200}
                  controls
                  src={URL.createObjectURL(videoFileInput)}
                />
              )}
            </Space>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter the title" }]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description" }
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter video description" />
          </Form.Item>
          <Space size={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter the location" }]}
            >
              <Input placeholder="Enter video location" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select placeholder="Select a category" style={{ width: 180 }}>
                <Select.Option value="Music">Music</Select.Option>
                <Select.Option value="Gaming">Gaming</Select.Option>
                <Select.Option value="Education">Education</Select.Option>
                <Select.Option value="News">News</Select.Option>
                <Select.Option value="Entertainment">
                  Entertainment
                </Select.Option>
                <Select.Option value="Technology">Technology</Select.Option>
                <Select.Option value="Lifestyle">Lifestyle</Select.Option>
                <Select.Option value="Travel">Travel</Select.Option>
                <Select.Option value="Food">Food</Select.Option>
                <Select.Option value="Health">Health</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item
            name="thumbnail"
            label="Thumbnail"
            rules={[{ required: true, message: "Please upload a thumbnail" }]}
          >
            <Space direction="vertical">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setThumbnailFileInput(e.target.files[0]);
                }}
              />
              {thumbnailFileInput && (
                <Image
                  style={{ border: "1px solid grey" }}
                  src={URL.createObjectURL(thumbnailFileInput)}
                  alt="Thumbnail"
                  width={450}
                  height={200}
                />
              )}
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button shape="round" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                shape="round"
                htmlType="submit"
                loading={loading}
              >
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
