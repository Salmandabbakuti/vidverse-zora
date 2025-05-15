import { pinFilesToIPFS, pinJSONToIPFS } from "@/app/utils/pinata";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const thumbnailFile = formData.get("thumbnailFile");
  const videoFile = formData.get("videoFile");
  const metadataBase = formData.get("metadataBase");
  if (!metadataBase) {
    return NextResponse.json(
      { error: "MetadataBase is required" },
      { status: 400 }
    );
  }
  const metadataBaseJson = JSON.parse(metadataBase);
  console.log("upload input", {
    thumbnailFile,
    videoFile,
    metadataBaseJson
  });
  try {
    const filesToPin = [];
    let folderCID = "";
    if (thumbnailFile) filesToPin.push(thumbnailFile);
    if (videoFile) filesToPin.push(videoFile);
    if (filesToPin.length) {
      const uploadRes = await pinFilesToIPFS(filesToPin, {
        metadata: {
          name: `VidVerse_${metadataBaseJson.name}_assets_${Date.now()}`
        }
      });

      folderCID = uploadRes.cid;
    }

    const finalMetadata = {
      ...metadataBaseJson,
      ...(thumbnailFile
        ? { image: `ipfs://${folderCID}/${thumbnailFile.name}` }
        : {}),
      ...(videoFile
        ? { animation_url: `ipfs://${folderCID}/${videoFile.name}` }
        : {})
    };
    console.log("finalMetadata before uploading to IPFS", finalMetadata);
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
        cid: finalMetadata.animation_url.split("ipfs://")[1]
      },
      thumbnail: {
        cid: finalMetadata.image.split("ipfs://")[1]
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
