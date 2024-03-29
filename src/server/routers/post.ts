/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { ObjectId } from 'mongodb';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Post, { IPost } from '../models/Post';
import { router } from '../trpc';
// import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import Like from '../models/Like';
import { TRPCError } from '@trpc/server';
import { commentRouter } from './comment';
import Comment from '../models/Comment';
import { env } from '../env';
import { v2 as cloudinary } from 'cloudinary';
import isMongoId from 'validator/lib/isMongoId';

const MAX_POST_LENGTH = 280;
const OTHER_MAX_LENGTH = 500;

interface PostsAggregationResult {
  _id: ObjectId;
  userId: {
    _id: ObjectId;
    image?: string;
    name: string;
  };
  content: string;
  imageId?: string;
  createdAt: Date;
  gifUrl?: string;
  updatedAt: Date;
  __v: number;
  likeCount: number;
  commentCount: number;
  hasLiked?: boolean | null;
  lastComment?: {
    _id: ObjectId;
    userId: {
      _id: ObjectId;
      image?: string;
      name: string;
    };
    postId: ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const postRouter = router({
  create: authOnlyProcedure
    .input(
      z.object({
        content: z.string().max(MAX_POST_LENGTH),
        imageId: z.string().max(OTHER_MAX_LENGTH).optional(),
        gifUrl: z.string().max(OTHER_MAX_LENGTH).optional(),
      }),
    )
    .output(
      z.object({
        post: z.object({
          content: z.string(),
          _id: z.instanceof(ObjectId),
          createdAt: z.date(),
          updatedAt: z.date(),
          imageId: z.string().optional(),
          gifUrl: z.string().optional(),
          userId: z.object({
            _id: z.instanceof(ObjectId),
            image: z.string().optional(),
            name: z.string(),
            tags: z
              .object({
                verified: z.boolean().nullish(),
                developer: z.boolean().nullish(),
              })
              .optional(),
          }),
          likeCount: z.number(),
          commentCount: z.number(),
          hasLiked: z.null(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const post = new Post({
        content: input.content,
        userId: ctx.session.userId._id,
        imageId: input.imageId,
        gifUrl: input.imageId ? undefined : input.gifUrl,
      });

      const savedPost = await post.save();

      const result = {
        content: savedPost.content,
        _id: savedPost._id,
        createdAt: savedPost.createdAt,
        updatedAt: savedPost.updatedAt,
        imageId: savedPost.imageId,
        gifUrl: savedPost.gifUrl,
        userId: {
          _id: ctx.session.userId._id,
          image: ctx.session.userId.image,
          name: ctx.session.userId.name,
          tags: ctx.session.userId.tags,
        },
        likeCount: 0,
        commentCount: 0,
        hasLiked: null,
      };

      return { post: result };
    }),
  getAll: currentSessionProcedure
    .input(
      z.object({
        followingOnly: z.boolean().optional(),
        profileId: z.string().optional(),
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
        posts: z.array(
          z.object({
            content: z.string(),
            _id: z.instanceof(ObjectId),
            createdAt: z.date(),
            updatedAt: z.date(),
            imageId: z.string().optional(),
            gifUrl: z.string().optional(),
            userId: z.object({
              _id: z.instanceof(ObjectId),
              image: z.string().optional(),
              name: z.string(),
              tags: z
                .object({
                  verified: z.boolean().nullish(),
                  developer: z.boolean().nullish(),
                })
                .optional(),
            }),
            likeCount: z.number(),
            commentCount: z.number(),
            hasLiked: z.boolean().nullish(),
            lastComment: z
              .object({
                _id: z.instanceof(ObjectId),
                postId: z.instanceof(ObjectId),
                content: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
                userId: z.object({
                  _id: z.instanceof(ObjectId),
                  image: z.string().optional(),
                  name: z.string(),
                  tags: z
                    .object({
                      verified: z.boolean().nullish(),
                      developer: z.boolean().nullish(),
                    })
                    .optional(),
                }),
              })
              .nullish(),
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
    //TODO: big rafactor of query
    .query(async ({ input, ctx }) => {
      const followingOnly = input.followingOnly;
      if (followingOnly) {
        if (!ctx.session) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'user not logged in',
          });
        }
        const userId = ctx.session?.userId;
        const limit = 5;
        const cursor = input.cursor;
        const createdAt = input.cursor?.createdAt;
        const _id = input?.cursor?._id;
        const operator = input.cursor?.exclude ? '$lt' : '$lte';

        const query: FilterQuery<IPost> =
          createdAt && _id
            ? {
                $or: [
                  {
                    createdAt: { [operator]: createdAt },
                  },
                  { createdAt, _id: { [operator]: new Types.ObjectId(_id) } },
                ],
              }
            : {};

        const pipeline: PipelineStage[] = [
          { $match: query },

          {
            $lookup: {
              from: 'followers',
              localField: 'userId',
              pipeline: [
                {
                  $match: {
                    followerId: ctx.session.userId._id,
                  },
                },
              ],
              foreignField: 'userId',
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
            $match: {
              $or: [
                {
                  userId: ctx.session.userId._id,
                },
                {
                  following: {
                    $exists: true,
                  },
                },
              ],
            },
          },
          {
            $sort: { createdAt: -1, _id: -1 },
          },
          {
            $limit: limit + 1,
          },
          {
            $lookup: {
              from: 'likes',
              pipeline: [
                {
                  $group: {
                    _id: '$postId',
                    likes: {
                      $sum: 1,
                    },
                  },
                },
              ],
              localField: '_id',
              foreignField: 'postId',
              as: 'likeData',
            },
          },
          {
            $lookup: {
              from: 'comments',
              pipeline: [
                {
                  $group: {
                    _id: '$postId',
                    comments: {
                      $sum: 1,
                    },
                  },
                },
              ],
              localField: '_id',
              foreignField: 'postId',
              as: 'commentData',
            },
          },
          {
            $unwind: {
              path: '$likeData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$commentData',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              likeCount: {
                $ifNull: ['$likeData.likes', 0],
              },
              commentCount: {
                $ifNull: ['$commentData.comments', 0],
              },
            },
          },
          {
            $unset: ['likeData', 'commentData', 'following'],
          },
          {
            $lookup: {
              from: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tags: 1,
                  },
                },
              ],
              localField: 'userId',
              foreignField: '_id',
              as: 'userId',
            },
          },
          {
            $unwind: {
              path: '$userId',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $lookup: {
              from: 'comments',
              localField: '_id',
              pipeline: [
                {
                  $sort: {
                    createdAt: -1,
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'userId',
                    pipeline: [
                      {
                        $project: {
                          _id: 1,
                          name: 1,
                          image: 1,
                          tags: 1,
                        },
                      },
                    ],
                    foreignField: '_id',
                    as: 'userId',
                  },
                },
              ],
              foreignField: 'postId',
              as: 'lastComment',
            },
          },
          {
            $unwind: {
              path: '$lastComment',

              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: '$lastComment.userId',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'likes',
              pipeline: [
                {
                  $match: {
                    userId: userId._id,
                  },
                },
              ],
              localField: '_id',
              foreignField: 'postId',
              as: 'hasLiked',
            },
          },
          {
            $addFields: {
              hasLiked: {
                $cond: {
                  if: {
                    $anyElementTrue: ['$hasLiked'],
                  },
                  then: true,
                  else: undefined,
                },
              },
            },
          },
        ];

        const posts: PostsAggregationResult[] = await Post.aggregate(pipeline);

        let nextCursor: typeof cursor = undefined;
        if (posts.length > limit) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const nextItem = posts.pop()!;
          if (nextItem) {
            nextCursor = {
              _id: nextItem._id.toString(),
              createdAt: nextItem.createdAt,
            };
          }
        }

        return { posts, nextCursor };
      }
      const profileId = input.profileId;
      if (profileId) {
        if (!isMongoId(profileId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'invalid profile id',
          });
        }
      }
      const userId = ctx.session?.userId;
      const limit = 5;
      const cursor = input.cursor;
      const createdAt = input.cursor?.createdAt;
      const _id = input?.cursor?._id;
      const operator = input.cursor?.exclude ? '$lt' : '$lte';

      const query: FilterQuery<IPost> =
        createdAt && _id
          ? {
              $or: [
                {
                  createdAt: { [operator]: createdAt },
                },
                { createdAt, _id: { [operator]: new Types.ObjectId(_id) } },
              ],
              ...(profileId ? { userId: new Types.ObjectId(profileId) } : {}),
            }
          : {
              ...(profileId ? { userId: new Types.ObjectId(profileId) } : {}),
            };

      const pipeLine: PipelineStage[] = [
        {
          $match: query,
        },
        {
          $sort: { createdAt: -1, _id: -1 },
        },

        {
          $limit: limit + 1,
        },
        {
          $lookup: {
            from: 'likes',
            pipeline: [
              {
                $group: {
                  _id: '$postId',
                  likes: {
                    $sum: 1,
                  },
                },
              },
            ],
            localField: '_id',
            foreignField: 'postId',
            as: 'likeData',
          },
        },
        {
          $lookup: {
            from: 'comments',
            pipeline: [
              {
                $group: {
                  _id: '$postId',
                  comments: {
                    $sum: 1,
                  },
                },
              },
            ],
            localField: '_id',
            foreignField: 'postId',
            as: 'commentData',
          },
        },
        {
          $unwind: {
            path: '$likeData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$commentData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            likeCount: {
              $ifNull: ['$likeData.likes', 0],
            },
            commentCount: {
              $ifNull: ['$commentData.comments', 0],
            },
          },
        },
        {
          $unset: ['likeData', 'commentData'],
        },
        {
          $lookup: {
            from: 'users',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  image: 1,
                  tags: 1,
                },
              },
            ],
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: {
            path: '$userId',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        image: 1,
                        tags: 1,
                      },
                    },
                  ],
                  foreignField: '_id',
                  as: 'userId',
                },
              },
            ],
            foreignField: 'postId',
            as: 'lastComment',
          },
        },
        {
          $unwind: {
            path: '$lastComment',

            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$lastComment.userId',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      if (userId) {
        pipeLine.push(
          {
            $lookup: {
              from: 'likes',
              pipeline: [
                {
                  $match: {
                    userId: userId._id,
                  },
                },
              ],
              localField: '_id',
              foreignField: 'postId',
              as: 'hasLiked',
            },
          },
          {
            $addFields: {
              hasLiked: {
                $cond: {
                  if: {
                    $anyElementTrue: ['$hasLiked'],
                  },
                  then: true,
                  else: undefined,
                },
              },
            },
          },
        );
      }

      const posts: PostsAggregationResult[] = await Post.aggregate(pipeLine);

      let nextCursor: typeof cursor = undefined;
      if (posts.length > limit) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = posts.pop()!;
        if (nextItem) {
          nextCursor = {
            _id: nextItem._id.toString(),
            createdAt: nextItem.createdAt,
          };
        }
      }

      return { posts, nextCursor };
    }),
  getPostById: currentSessionProcedure
    .input(z.object({ postId: z.string() }))
    .output(
      z.object({
        post: z.object({
          content: z.string(),
          _id: z.instanceof(ObjectId),
          createdAt: z.date(),
          updatedAt: z.date(),
          imageId: z.string().optional(),
          gifUrl: z.string().optional(),
          userId: z.object({
            _id: z.instanceof(ObjectId),
            image: z.string().optional(),
            name: z.string(),
            tags: z
              .object({
                verified: z.boolean().nullish(),
                developer: z.boolean().nullish(),
              })
              .optional(),
          }),
          likeCount: z.number(),
          commentCount: z.number(),
          hasLiked: z.boolean().nullish(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const postId = input.postId;
      if (postId) {
        if (!isMongoId(postId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'invalid profile id',
          });
        }
      }
      const userId = ctx.session?.userId;

      const pipeLine: PipelineStage[] = [
        {
          $match: { _id: new Types.ObjectId(postId) },
        },
        {
          $limit: 1,
        },
        {
          $lookup: {
            from: 'likes',
            pipeline: [
              {
                $group: {
                  _id: '$postId',
                  likes: {
                    $sum: 1,
                  },
                },
              },
            ],
            localField: '_id',
            foreignField: 'postId',
            as: 'likeData',
          },
        },
        {
          $lookup: {
            from: 'comments',
            pipeline: [
              {
                $group: {
                  _id: '$postId',
                  comments: {
                    $sum: 1,
                  },
                },
              },
            ],
            localField: '_id',
            foreignField: 'postId',
            as: 'commentData',
          },
        },
        {
          $unwind: {
            path: '$likeData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$commentData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            likeCount: {
              $ifNull: ['$likeData.likes', 0],
            },
            commentCount: {
              $ifNull: ['$commentData.comments', 0],
            },
          },
        },
        {
          $unset: ['likeData', 'commentData'],
        },
        {
          $lookup: {
            from: 'users',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  image: 1,
                  tags: 1,
                },
              },
            ],
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: {
            path: '$userId',
            preserveNullAndEmptyArrays: false,
          },
        },
      ];

      if (userId) {
        pipeLine.push(
          {
            $lookup: {
              from: 'likes',
              pipeline: [
                {
                  $match: {
                    userId: userId._id,
                  },
                },
              ],
              localField: '_id',
              foreignField: 'postId',
              as: 'hasLiked',
            },
          },
          {
            $addFields: {
              hasLiked: {
                $cond: {
                  if: {
                    $anyElementTrue: ['$hasLiked'],
                  },
                  then: true,
                  else: undefined,
                },
              },
            },
          },
        );
      }

      const post = (await Post.aggregate(pipeLine))[0];

      return {
        post,
      };
    }),
  viewLikes: currentSessionProcedure
    .input(
      z.object({
        postId: z.string(),
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
        likes: z.array(
          z.object({
            _id: z.instanceof(ObjectId),
            postId: z.instanceof(ObjectId),
            createdAt: z.date(),
            updatedAt: z.date(),
            userId: z.object({
              _id: z.instanceof(ObjectId),
              image: z.string().optional(),
              name: z.string(),
              bio: z.string().optional(),
              tags: z
                .object({
                  verified: z.boolean().nullish(),
                  developer: z.boolean().nullish(),
                })
                .optional(),
              followed: z.boolean().nullish(),
            }),
          }),
        ),
        nextCursor: z
          .object({ createdAt: z.date(), _id: z.string() })
          .nullish(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const limit = 5;
      const cursor = input.cursor;
      const operator = cursor?.exclude ? '$lt' : '$lte';

      const user = ctx.session?.userId;

      const pipeline: PipelineStage[] = [
        {
          $match: {
            postId: new Types.ObjectId(input.postId),
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
          },
        },
        {
          $sort: { createdAt: -1, _id: -1 },
        },
        { $limit: limit + 1 },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            pipeline: [
              {
                $unset: [
                  'email',
                  'bio',
                  'banner',
                  'createdAt',
                  'updatedAt',
                  '__v',
                ],
              },
            ],
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $unwind: {
            path: '$userId',
            preserveNullAndEmptyArrays: false,
          },
        },
      ];

      if (user) {
        pipeline.push(
          {
            $lookup: {
              from: 'followers',
              localField: 'userId._id',
              pipeline: [
                {
                  $match: {
                    followerId: user._id,
                  },
                },
                {
                  $project: {
                    _id: 1,
                  },
                },
              ],
              foreignField: 'userId',
              as: 'userId.followed',
            },
          },
          {
            $unwind: {
              path: '$userId.followed',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              'userId.followed': {
                $toBool: '$userId.followed',
              },
            },
          },
        );
      }

      const likes = await Like.aggregate(pipeline);

      let nextCursor: typeof cursor = undefined;

      if (likes.length > limit) {
        const nextItem = likes.pop();
        if (nextItem) {
          nextCursor = {
            _id: nextItem._id.toString(),
            createdAt: nextItem.createdAt,
          };
        }
      }

      return { likes, nextCursor };
    }),
  likePost: authOnlyProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      const postId = input;

      try {
        await Like.updateOne(
          { postId, userId },
          { userId, postId },
          { upsert: true, new: true },
        ).lean();
        return true;
      } catch (error) {
        console.log(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  unlikePost: authOnlyProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.userId;
      const postId = input;

      try {
        await Like.deleteOne({ postId, userId }, { userId, postId });
        return true;
      } catch (error) {
        console.log(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  deletePost: authOnlyProcedure
    .input(z.string())
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const currentUser = ctx.session.userId;

      await Promise.all([
        Comment.deleteMany({ postId: input }),
        Like.deleteMany({ postId: input }),
      ]);

      const deletedPost = await Post.findOneAndDelete({
        _id: input,
        userId: currentUser._id,
      });

      if (deletedPost?.imageId) {
        cloudinary.config({
          cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET,
          secure: true,
        });

        await cloudinary.uploader
          .destroy(deletedPost.imageId)
          .then((data) => console.log(data))
          .catch((err) => console.log(err));
      }

      if (!deletedPost) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      return true;
    }),
  comment: commentRouter,
});
