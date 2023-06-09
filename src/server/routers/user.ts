import { ObjectId } from 'mongodb';
import { router } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Session from '../models/Session';
import User from '../models/User';
import isMongoId from 'validator/lib/isMongoId';
import { PipelineStage, Types } from 'mongoose';
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

  getPublicProfile: currentSessionProcedure
    .input(z.object({ profileId: z.string() }))
    .output(
      z.object({
        _id: z.instanceof(ObjectId),
        image: z.string().url().optional(),
        createdAt: z.date(),
        name: z.string(),
        postCount: z.number(),
        followerCount: z.number(),
        followed: z.boolean().nullish(),
        followsYou: z.boolean().nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (!isMongoId(input.profileId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invalid profile id',
        });
      }

      const pipeline: PipelineStage[] = [
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
          $lookup: {
            from: 'followers',
            localField: '_id',
            pipeline: [
              {
                $group: {
                  _id: '$userId',
                  followerCount: {
                    $sum: 1,
                  },
                },
              },
            ],
            foreignField: 'userId',
            as: 'followers',
          },
        },
        {
          $unwind: {
            path: '$followers',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            followerCount: {
              $ifNull: ['$followers.followerCount', 0],
            },
          },
        },
        {
          $unset: ['followers', 'email', 'posts'],
        },
      ];
      const loggedInUserId = ctx.session?.userId._id;

      if (loggedInUserId) {
        pipeline.push(
          {
            $lookup: {
              from: 'followers',
              localField: '_id',
              pipeline: [
                {
                  $match: {
                    followerId: loggedInUserId,
                  },
                },
              ],
              foreignField: 'userId',
              as: 'followed',
            },
          },
          {
            $unwind: {
              path: '$followed',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'followers',
              localField: '_id',
              pipeline: [
                {
                  $match: {
                    userId: loggedInUserId,
                  },
                },
              ],
              foreignField: 'followerId',
              as: 'followsYou',
            },
          },
          {
            $unwind: {
              path: '$followsYou',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              followed: {
                $toBool: '$followed',
              },
              followsYou: {
                $toBool: '$followsYou',
              },
            },
          },
        );
      }

      const aggregationResult = await User.aggregate(pipeline);

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
      if (input.userId === ctx.session.userId._id.toString()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "can't follow yourself",
        });
      }

      const result = await Follower.updateOne(
        {
          followerId: ctx.session.userId._id,
          userId: input.userId,
        },
        {},
        { upsert: true },
      );
      return result.acknowledged;
    }),

  unfollowUser: authOnlyProcedure
    .input(z.object({ userId: z.string() }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      const result = await Follower.deleteOne({
        followerId: ctx.session.userId._id,
        userId: input.userId,
      });
      return result.acknowledged;
    }),

  logout: currentSessionProcedure.mutation(async ({ ctx }) => {
    await Session.deleteOne({ _id: ctx?.session?._id });
    ctx.res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`);
  }),
});
