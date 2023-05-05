import { ObjectId } from 'mongodb';
import { router, currentUserProcedure, publicProcedure } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getUser: currentUserProcedure
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
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@\n', session.userId);
      return session.userId;
    }),

  // logout: currentUserProcedure.mutation(({ctx}) => {}),
});
