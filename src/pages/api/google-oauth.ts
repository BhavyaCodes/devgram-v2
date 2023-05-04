import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  {
    console.log(req.query);
    // Handle any other HTTP method
    res.redirect('/');
  }
}
