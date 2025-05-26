"use server";
import { PinataSDK } from "pinata";
import { errorResponse } from "./utils";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL
});

export async function uploadVideoAssets(formData) {
  const thumbnailFile = formData.get("thumbnailFile");
  const videoFile = formData.get("videoFile");
  const metadataBase = formData.get("metadataBase");
  if (!metadataBase)
    return errorResponse("Metadata base is required", 400, true);
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
      const uploadRes = await pinata.upload.public.fileArray(filesToPin, {});
      console.log("uploadRes", uploadRes);
      folderCID = uploadRes.cid;
    }

    const finalMetadata = {
      ...metadataBaseJson,
      ...(thumbnailFile && {
        image: `ipfs://${folderCID}/${thumbnailFile.name}`
      }),
      ...(videoFile && {
        animation_url: `ipfs://${folderCID}/${videoFile.name}`,
        content: {
          mime: videoFile?.type || "video/mp4",
          uri: `ipfs://${folderCID}/${videoFile.name}`
        }
      })
    };
    console.log("finalMetadata before uploading to IPFS", finalMetadata);
    // pin the metadata to IPFS
    const metadataRes = await pinata.upload.public.json(finalMetadata, {});
    // add the metadata to the results
    console.log("metadataRes", metadataRes);
    return {
      metadata: metadataRes,
      video: {
        cid: finalMetadata.animation_url.split("ipfs://")[1]
      },
      thumbnail: {
        cid: finalMetadata.image.split("ipfs://")[1]
      }
    };
  } catch (error) {
    console.error("Error uploading video assets to IPFS:", error);
    return errorResponse(error);
  }
}
