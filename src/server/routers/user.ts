import { ObjectId } from 'mongodb';
import { router } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Session from '../models/Session';
export const userRouter = router({
  getUser: authOnlyProcedure
    .output(
      z
        .object({
          _id: z.instanceof(ObjectId),
          image: z.string().url().optional(),
          createdAt: z.date(),
          updatedAt: z.date(),
          name: z.string(),
        })
        .or(z.undefined()),
    )
    .query(({ ctx }) => {
      const session = ctx.session;
      if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return session.userId;
    }),

  logout: currentSessionProcedure.mutation(async ({ ctx }) => {
    await Session.deleteOne({ _id: ctx?.session?._id });
    ctx.res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  }),
});
