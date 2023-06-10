import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '~/server/env';

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { type } = req.query;

  const folderName =
    type === 'avatar'
      ? 'avatar'
      : type === 'post'
      ? 'post'
      : type === 'banner'
      ? 'banner'
      : undefined;

  if (!folderName) {
    return res.status(400).send({ message: 'wrong folder name' });
  }

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: `${env.NEXT_PUBLIC_CLOUDINARY_FOLDER}/${folderName}`,
      timestamp,
      transformation: 'c_scale,h_100',
    },
    env.CLOUDINARY_API_SECRET,
  );

  // crop: 'crop', height: '100'

  res.send({ signature, timestamp });
}
