import { pinFilesToIPFS, pinJSONToIPFS } from "@/app/utils/pinata";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const thumbnailFile = formData.get("thumbnailFile");
  const videoFile = formData.get("videoFile");
  const metadataBase = formData.get("metadataBase");
  const metadataBaseJson = JSON.parse(metadataBase);
  console.log("metadataBaseJson", metadataBaseJson);
  console.log("videoFile", videoFile);
  console.log("thumbnailFile", thumbnailFile);
  console.log("metadataBase", metadataBase);
  if (!thumbnailFile || !videoFile) {
    return NextResponse.json(
      { error: "Thumbnail and video files are required" },
      { status: 400 }
    );
  }
  try {
    const { cid: folderCID } = await pinFilesToIPFS(
      [thumbnailFile, videoFile],
      {
        metadata: {
          name: `VidVerse_${metadataBaseJson.name}_assets_${Date.now()}`
        }
      }
    );

    console.log("uploadRes", uploadRes);

    const finalMetadata = {
      ...metadataBaseJson,
      image: `ipfs://${folderCID}/${thumbnailFile.name}`,
      animation_url: `ipfs://${folderCID}/${videoFile.name}`
    };
    console.log("finalMetadata", finalMetadata);
    // pin the metadata to IPFS
    const metadataRes = await pinJSONToIPFS(finalMetadata, {
      metadata: {
        name: `VidVerse_${metadataBaseJson.name}_metadata_${Date.now()}`
      }
    });
    // add the metadata to the results
    console.log("metadataRes", metadataRes);
    return NextResponse.json({
      metadata: metadataRes,
      video: {
        cid: `${folderCID}/${videoFile.name}`
      },
      thumbnail: {
        cid: `${folderCID}/${thumbnailFile.name}`
      }
    });
  } catch (error) {
    console.error("Error uploading video assets to IPFS:", error);
    return NextResponse.json(
      { error: "Failed to upload video assets to IPFS. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // welcome to the Pinata API
  return NextResponse.json({
    message: "Welcome to pinata upload!"
  });
}
