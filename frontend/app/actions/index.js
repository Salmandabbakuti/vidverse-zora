"use server";
import { pinata } from "@/app/utils/pinata";

export const getPinataSignedUrl = async (options = { expires: 30 }) => {
  const url = await pinata.upload.public.createSignedURL(options);
  return url;
};
