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
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../env';

export const userRouter = router({
  getUser: authOnlyProcedure
    .output(
      z.object({
        _id: z.instanceof(ObjectId),
        image: z.string().optional(),
        createdAt: z.date(),
        bio: z.string().optional(),
        updatedAt: z.date(),
        name: z.string(),
      }),
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
        image: z.string().optional(),
        createdAt: z.date(),
        name: z.string(),
        bio: z.string().optional(),
        postCount: z.number(),
        banner: z.string().optional(),
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

  editProfile: authOnlyProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .output(
      z.object({
        _id: z.instanceof(ObjectId),
        image: z.string().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
        name: z.string(),
        bio: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        // new avatar image and existing image is from cloudinary
        input.image &&
        !z.string().url().safeParse(ctx.session.userId.image).success &&
        ctx.session.userId.image
      ) {
        // delete existing image from cloudinary
        cloudinary.config({
          cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
          secure: true,
        });

        await cloudinary.uploader
          .destroy(ctx.session.userId.image)
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: ctx.session.userId._id },
        input,
        {
          new: true,
        },
      ).lean();

      if (!updatedUser) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return updatedUser;
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
