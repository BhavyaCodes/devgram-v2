import { ObjectId } from 'mongodb';
import { publicProcedure, router } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Session from '../models/Session';
import User from '../models/User';
import isMongoId from 'validator/lib/isMongoId';
import { Types } from 'mongoose';
import Follower from '../models/Follower';
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
        postCount: z.number(),
      }),
    )
    .query(async ({ input }) => {
      if (!isMongoId(input.profileId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invalid profile id',
        });
      }
      const aggregationResult = await User.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(input.profileId),
          },
        },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            pipeline: [
              {
                $group: {
                  _id: '$userId',
                  postCount: {
                    $sum: 1,
                  },
                },
              },
            ],
            foreignField: 'userId',
            as: 'posts',
          },
        },
        {
          $unwind: {
            path: '$posts',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            postCount: {
              $ifNull: ['$posts.postCount', 0],
            },
          },
        },
        {
          $unset: ['email', 'posts'],
        },
      ]);

      const userProfile = aggregationResult[0];

      if (!userProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'user not found' });
      }
      return userProfile;
    }),

  followUser: authOnlyProcedure
    .input(z.object({ userId: z.string() }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const result = await Follower.updateOne({
        followerId: ctx.session.userId,
        userId: input.userId,
      });

      return true;
    }),

  logout: currentSessionProcedure.mutation(async ({ ctx }) => {
    await Session.deleteOne({ _id: ctx?.session?._id });
    ctx.res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  }),
});
