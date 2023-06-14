import { ObjectId } from 'mongodb';
import { publicProcedure, router } from '../trpc';

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Session from '../models/Session';
import User from '../models/User';
import isMongoId from 'validator/lib/isMongoId';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import Follower, { IFollower } from '../models/Follower';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../env';

export const userRouter = router({
  getUser: authOnlyProcedure
    .output(
      z.object({
        _id: z.instanceof(ObjectId),
        image: z.string().optional(),
        banner: z.string().optional(),
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
        followingCount: z.number(),
        followed: z.boolean().nullish(),
        followsYou: z.boolean().nullish(),
        tags: z
          .object({
            verified: z.boolean().nullish(),
            developer: z.boolean().nullish(),
          })
          .optional(),
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
          $lookup: {
            from: 'followers',
            localField: '_id',
            pipeline: [
              {
                $group: {
                  _id: 'followerId',
                  followingCount: {
                    $sum: 1,
                  },
                },
              },
            ],
            foreignField: 'followerId',
            as: 'following',
          },
        },
        {
          $unwind: {
            path: '$following',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            followerCount: {
              $ifNull: ['$followers.followerCount', 0],
            },
            followingCount: {
              $ifNull: ['$following.followingCount', 0],
            },
          },
        },
        {
          $unset: ['followers', 'following', 'email', 'posts'],
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
        banner: z.string().optional(),
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
        banner: z.string().optional(),
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

      if (
        // new banner image
        input.banner &&
        ctx.session.userId.banner
      ) {
        // delete existing image from cloudinary
        cloudinary.config({
          cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
          secure: true,
        });

        await cloudinary.uploader
          .destroy(ctx.session.userId.banner)
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

  getFollowing: publicProcedure
    .input(
      z.object({
        followerId: z.string(),
        cursor: z
          .object({
            createdAt: z.date(),
            _id: z.string(),
            exclude: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .output(
      z.object({
        following: z.array(
          z.object({
            _id: z.instanceof(ObjectId),
            userId: z.object({
              _id: z.instanceof(ObjectId),
              image: z.string().optional(),
              name: z.string(),
              bio: z.string().optional(),
            }),
          }),
        ),
        nextCursor: z
          .object({
            createdAt: z.date(),
            _id: z.string(),
          })
          .nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = 5;
      const cursor = input.cursor;
      const operator = cursor?.exclude ? '$lt' : '$lte';

      const query: FilterQuery<IFollower> = {
        followerId: input.followerId,
        ...(cursor?.createdAt && cursor?._id
          ? {
              $or: [
                {
                  createdAt: { [operator]: cursor.createdAt },
                },
                {
                  createdAt: cursor.createdAt,
                  _id: { [operator]: new Types.ObjectId(cursor._id) },
                },
              ],
            }
          : {}),
      };

      const following = await Follower.find(query)
        .limit(limit + 1)
        .populate('userId', {
          _id: 1,
          image: 1,
          name: 1,
          bio: 1,
        })
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      let nextCursor: typeof cursor = undefined;

      if (following.length > limit) {
        const nextItem = following.pop();
        if (nextItem) {
          nextCursor = {
            _id: nextItem._id.toString(),
            createdAt: nextItem.createdAt,
          };
        }
      }

      return { following, nextCursor };
    }),

  getFollowers: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        cursor: z
          .object({
            createdAt: z.date(),
            _id: z.string(),
            exclude: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .output(
      z.object({
        followers: z.array(
          z.object({
            _id: z.instanceof(ObjectId),
            followerId: z.object({
              _id: z.instanceof(ObjectId),
              image: z.string().optional(),
              name: z.string(),
              bio: z.string().optional(),
            }),
          }),
        ),
        nextCursor: z
          .object({
            createdAt: z.date(),
            _id: z.string(),
          })
          .nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = 5;
      const cursor = input.cursor;
      const operator = cursor?.exclude ? '$lt' : '$lte';

      const query: FilterQuery<IFollower> = {
        userId: input.userId,
        ...(cursor?.createdAt && cursor?._id
          ? {
              $or: [
                {
                  createdAt: { [operator]: cursor.createdAt },
                },
                {
                  createdAt: cursor.createdAt,
                  _id: { [operator]: new Types.ObjectId(cursor._id) },
                },
              ],
            }
          : {}),
      };

      const followers = await Follower.find(query)
        .limit(limit + 1)
        .populate('followerId', {
          _id: 1,
          image: 1,
          name: 1,
          bio: 1,
        })
        .sort({ createdAt: -1, _id: -1 })
        .lean();

      let nextCursor: typeof cursor = undefined;

      if (followers.length > limit) {
        const nextItem = followers.pop();
        if (nextItem) {
          nextCursor = {
            _id: nextItem._id.toString(),
            createdAt: nextItem.createdAt,
          };
        }
      }

      return { followers, nextCursor };
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
