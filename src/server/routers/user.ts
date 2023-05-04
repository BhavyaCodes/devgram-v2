import { ObjectId } from 'mongodb';
import { router, currentUserProcedure } from '../trpc';

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
      const user = ctx.user;
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      return user;
    }),
});
