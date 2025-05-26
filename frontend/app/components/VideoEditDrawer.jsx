import { useState } from "react";
import { useAppKitAccount, useAppKitState } from "@reown/appkit/react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Button,
  message,
  Image
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEthersSigner } from "@/app/hooks/ethers";
import { vidverseContract } from "@/app/utils";
import { uploadVideoAssets } from "@/app/actions/pinata";

export default function VideoEditDrawer({ video: videoData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [thumbnailFileInput, setThumbnailFileInput] = useState(null);
  const [loading, setLoading] = useState(false);

  const { address: account } = useAppKitAccount();
  const { selectedNetworkId } = useAppKitState();

  const router = useRouter();
  const signer = useEthersSigner();

  const handleSubmit = async (values) => {
    if (!account) return message.error("Please connect your wallet first");
    if (selectedNetworkId !== "eip155:84532")
      return message.error("Please switch to Base Sepolia Testnet");
    if (thumbnailFileInput && thumbnailFileInput.size > 5 * 1024 * 1024)
      return message.error("Thumbnail file size exceeds 5MB limit");
    let thumbnailCID = videoData?.thumbnailHash || "";
    setLoading(true);
    console.log("thumbnail", thumbnailFileInput);
    // prepare metadata base
    const metadataBase = {
      name: values.title,
      description: values.description,
      image: `ipfs://${thumbnailCID}`,
      external_url: "",
      animation_url: `ipfs://${videoData?.videoHash}`,
      content: {
        mime: "video/mp4", //TBF: hardcoded because we don't have the video file in edit info
        uri: `ipfs://${videoData?.videoHash}`
      },
      properties: {
        category: values.category,
        location: values.location
      }
    };
    const formData = new FormData();
    if (thumbnailFileInput) {
      formData.append("thumbnailFile", thumbnailFileInput);
    }
    formData.append("metadataBase", JSON.stringify(metadataBase));

    try {
      if (thumbnailFileInput) message.info("Uploading new thumbnail to IPFS");
      const uploadRes = await uploadVideoAssets(formData);
      if (uploadRes?.error) {
        console.error("Error uploading video assets to IPFS:", uploadRes.error);
        return message.error(
          `Failed to upload video assets to IPFS. ${uploadRes.error}`
        );
      }
      message.success("Thumbnail and metadata uploaded to IPFS");
      message.info("Updating video info in the contract");
      const { metadata, video, thumbnail } = uploadRes;
      console.log("uploaded m,v,t->", metadata, video, thumbnail);
      const metadataCID = metadata.cid;
      thumbnailCID = thumbnail.cid;

      if (!thumbnailCID)
        return message.error("Thumbnail is required to update video info");
      const tx = await vidverseContract
        .connect(signer)
        .updateVideoInfo(
          videoData?.id,
          values.title,
          values.description,
          values.category,
          values.location,
          thumbnailCID,
          metadataCID
        );
      await tx.wait();
      message.success(
        "Video info updated successfully. Refreshing in few seconds..."
      );
      setDrawerOpen(false);
      // Refresh the page to show the updated video after 3 seconds
      setTimeout(() => router.refresh(), 5000);
    } catch (error) {
      console.error(error);
      message.error("Failed to update video info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<EditOutlined />}
        shape="circle"
        title="Edit Video Info"
        onClick={() => setDrawerOpen(true)}
      />
      <Drawer
        title="Edit Video Info"
        width={620}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: videoData?.title,
            description: videoData?.description,
            location: videoData?.location,
            category: videoData?.category
          }}
        >
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
            rules={[
              {
                required: !videoData?.thumbnailHash,
                message: "Please upload a thumbnail"
              }
            ]}
          >
            <Space direction="vertical">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setThumbnailFileInput(e.target.files[0]);
                }}
              />
              <Image
                preview={false}
                alt={videoData?.title}
                style={{ border: "1px solid grey" }}
                src={
                  thumbnailFileInput
                    ? URL.createObjectURL(thumbnailFileInput)
                    : `https://ipfs.io/ipfs/${videoData?.thumbnailHash}`
                }
                width={450}
                height={200}
              />
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
                loading={loading}
                htmlType="submit"
              >
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}
