import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}`
});

export const pinFilesToIPFS = async (files, options = {}) => {
  const res = await pinata.upload.public.fileArray(files, options);
  return res;
};

export const pinJSONToIPFS = async (json, options = {}) => {
  const res = await pinata.upload.public.json(json, options);
  return res;
};
