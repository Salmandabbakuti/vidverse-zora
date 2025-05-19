"use server";
import { pinata } from "@/app/utils/pinata";

export const getPinataSignedUrl = async () => {
  const url = await pinata.upload.public.createSignedURL({
    expires: 120 // seconds
  });
  return url;
};
