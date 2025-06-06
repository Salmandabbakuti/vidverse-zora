import { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Button,
  message,
  Spin
} from "antd";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import { useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEthersSigner } from "@/app/hooks/ethers";
import { vidverseContract } from "@/app/utils";
import { uploadVideoAssets } from "@/app/actions/pinata";

export default function UploadDrawer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [thumbnailFileInput, setThumbnailFileInput] = useState(null);
  const [videoFileInput, setVideoFileInput] = useState(null);
  const [loading, setLoading] = useState(false);

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();
  const router = useRouter();
  const signer = useEthersSigner();

  const handleSubmit = async (values) => {
    if (!account || !signer)
      return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:84532")
      return message.error("Please switch to Base Sepolia Testnet");
    if (!thumbnailFileInput || !videoFileInput) {
      message.error("Please upload a video and thumbnail");
      return;
    }
    if (videoFileInput.size > 90 * 1024 * 1024)
      return message.error("Video file size exceeds 90MB limit");

    if (thumbnailFileInput.size > 5 * 1024 * 1024)
      return message.error("Thumbnail file size exceeds 5MB limit");
    console.log("thumbnail", thumbnailFileInput);
    console.log("video", videoFileInput);
    // prepare metadata base. ther fileds like image, animation_url, content will be added in the api after uploading
    const metadataBase = {
      name: values.title,
      description: values.description,
      external_url: "",
      properties: {
        category: values.category,
        location: values.location
      }
    };

    setLoading(true);
    message.info("Uploading video and thumbnail to IPFS");
    const formData = new FormData();
    formData.append("thumbnailFile", thumbnailFileInput);
    formData.append("videoFile", videoFileInput);
    formData.append("metadataBase", JSON.stringify(metadataBase));
    try {
      const uploadRes = await uploadVideoAssets(formData);
      if (uploadRes?.error) {
        console.error("Error uploading video assets to IPFS:", uploadRes.error);
        return message.error(
          `Failed to upload video assets to IPFS. ${uploadRes.error}`
        );
      }
      const { metadata, video, thumbnail } = uploadRes;
      console.log("uploadRes", { metadata, video, thumbnail });
      const metadataCID = metadata.cid;
      const videoCID = video.cid;
      const thumbnailCID = thumbnail.cid;
      // first upload the video, then the thumbnail
      // then construct metadata and upload it {name, description, image, external_url, animation_url, properties {category, location}}
      // image is the thumbnail, animation_url is the video should be in ipfs://<CID> format
      console.log("uploadRes ->v,t,m", videoCID, thumbnailCID, metadataCID);
      message.success("Thumbnail and video are uploaded to IPFS");
      message.info("Adding video info to the contract");
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
      console.error("Error uploading video:", error);
      message.error(
        `Failed to upload video: ${
          error?.shortMessage || "Please try again later"
        }`
      );
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
          <Spin spinning={loading} tip="Transaction in progress...">
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
                rules={[
                  { required: true, message: "Please enter the location" }
                ]}
              >
                <Input placeholder="Enter video location" />
              </Form.Item>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category" }
                ]}
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
          </Spin>
        </Form>
      </Drawer>
    </>
  );
}
