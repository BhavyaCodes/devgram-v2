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
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder: env.NEXT_PUBLIC_CLOUDINARY_FOLDER,
      timestamp,
      transformation: 'c_scale,h_100',
    },
    env.CLOUDINARY_API_SECRET,
  );

  // crop: 'crop', height: '100'
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.send({ signature, timestamp });
}
