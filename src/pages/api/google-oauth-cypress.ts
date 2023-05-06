import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '~/server/env';
import jwt from 'jsonwebtoken';
import User from '~/server/models/User';
import mongoose from 'mongoose';
import Session from '~/server/models/Session';

interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const refresh_token = env.REFRESH_TOKEN;
  const dbUri = env.DATABASE_URL;

  await mongoose.connect(dbUri);

  const obj = await getGoogleOAuthTokens({
    refresh_token,
  });

  const userData = jwt.decode(obj.id_token) as {
    email: string;
    name: string;
    picture: string;
    email_verified: boolean;
  };

  const user = await User.findOne({ email: userData.email });
  if (!user) {
    const newUser = new User({
      email: userData.email,
      name: userData.name,
      image: userData.picture,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id.toString() }, env.JWT_SECRET);
    const session = new Session({
      userId: newUser._id,
      token,
    });
    await session.save();
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/;${
        env.NODE_ENV === 'development' ? '' : ' Secure'
      }; Max-Age=31560000`,
    );

    return res.redirect('/');
  }
  const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET);

  const session = new Session({
    userId: user._id,
    token,
  });
  await session.save();
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/;${
      env.NODE_ENV === 'development' ? '' : ' Secure'
    }; Max-Age=31560000`,
  );
  return res.redirect('/');
}

async function getGoogleOAuthTokens({
  refresh_token,
}: {
  refresh_token: string;
}): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token,
  };

  try {
    const res = await axios.post<GoogleTokensResult>(url, values, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  } catch (error: any) {
    console.error(error.response.data.error);
    console.error(error.response.data);

    throw new Error(error.message);
  }
}
