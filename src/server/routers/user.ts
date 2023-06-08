import { ObjectId } from 'mongodb';
import { publicProcedure, router } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Session from '../models/Session';
import User from '../models/User';
import isMongoId from 'validator/lib/isMongoId';
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

  getPublicProfile: publicProcedure
    .input(z.object({ profileId: z.string() }))
    .output(
      z.object({
        _id: z.instanceof(ObjectId),
        image: z.string().url().optional(),
        createdAt: z.date(),
        name: z.string(),
      }),
    )
    .query(async ({ input }) => {
      if (!isMongoId(input.profileId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invalid profile id',
        });
      }
      const userProfile = await User.findById(input.profileId, {
        _id: 1,
        image: 1,
        createdAt: 1,
        name: 1,
      }).lean();

      if (!userProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'user not found' });
      }
      return userProfile;
    }),

  logout: currentSessionProcedure.mutation(async ({ ctx }) => {
    await Session.deleteOne({ _id: ctx?.session?._id });
    ctx.res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  }),
});
