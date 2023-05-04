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
  {
    const dbUri = env.DATABASE_URL;

    const code = req.query.code as string;
    if (!code) {
      res.status(500).redirect('/');
    }
    await mongoose.connect(dbUri);

    const obj = await getGoogleOAuthTokens({ code });

    const userData = jwt.decode(obj.id_token) as {
      email: string;
      name: string;
      picture: string;
      email_verified: boolean;
    };

    const user = await User.findOne({ email: userData.email });
    if (!user) {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      const newUser = new User({
        email: userData.email,
        name: userData.name,
        image: userData.picture,
      });

      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id.toString() },
        env.JWT_SECRET,
      );
      const session = new Session({
        userId: newUser._id,
        token,
      });
      await session.save();
      res.setHeader(
        'Set-Cookie',
        `token=${token}; HttpOnly; Path=/${
          env.NODE_ENV === 'development' ? '' : ' Secure'
        }`,
      );
      console.log(res.getHeaders());

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
      `token=${token}; HttpOnly; Path=/${
        env.NODE_ENV === 'development' ? '' : ' Secure'
      }`,
    );
    console.log(res.getHeaders());
    return res.redirect('/');
  }
}

export async function getGoogleOAuthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: 'authorization_code',
  };

  const qs = new URLSearchParams(values);
  try {
    const res = await axios.post<GoogleTokensResult>(url, qs.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(error.response.data.error);

    throw new Error(error.message);
  }
}
