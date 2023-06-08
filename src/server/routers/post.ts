/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { ObjectId } from 'mongodb';
import { authOnlyProcedure, currentSessionProcedure } from '../middleware';
import Post, { IPost } from '../models/Post';
import { router, publicProcedure } from '../trpc';
// import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
import Like from '../models/Like';
import { TRPCError } from '@trpc/server';
import { commentRouter } from './comment';
import Comment from '../models/Comment';
import { env } from '../env';
import { v2 as cloudinary } from 'cloudinary';
/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
// const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
//   id: true,
//   title: true,
//   text: true,
//   createdAt: true,
//   updatedAt: true,
// });

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
  sayHi: publicProcedure.input(z.string()).query(({ input }) => {
    return input;
  }),
  create: authOnlyProcedure
    .input(
      z.object({
        content: z.string(),
        imageId: z.string().optional(),
        gifUrl: z.string().optional(),
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
    .query(async ({ input, ctx }) => {
      const profileId = input.profileId;
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

      // console.log(query2);

      // const posts = await Post.find(query)
      //   .sort({ createdAt: -1, _id: -1 })
      //   .limit(limit + 1)
      //   .populate('userId', { _id: 1, image: 1, name: 1 })
      //   .lean();

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
  viewLikes: publicProcedure
    .input(z.string())
    .output(
      z.array(
        z.object({
          _id: z.instanceof(ObjectId),
          postId: z.instanceof(ObjectId),
          createdAt: z.date(),
          updatedAt: z.date(),
          userId: z.object({
            _id: z.instanceof(ObjectId),
            image: z.string().optional(),
            name: z.string(),
          }),
        }),
      ),
    )
    .query(async ({ input }) => {
      const likeDocs = await Like.find({ postId: input })
        .populate('userId', {
          _id: 1,
          image: 1,
          name: 1,
        })
        .lean();

      return likeDocs;
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
  // list: publicProcedure
  //   .input(
  //     z.object({
  //       limit: z.number().min(1).max(100).nullish(),
  //       cursor: z.string().nullish(),
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     /**
  //      * For pagination docs you can have a look here
  //      * @see https://trpc.io/docs/useInfiniteQuery
  //      * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
  //      */
  //     const limit = input.limit ?? 50;
  //     const { cursor } = input;
  //     const items = await prisma.post.findMany({
  //       select: defaultPostSelect,
  //       // get an extra item at the end which we'll use as next cursor
  //       take: limit + 1,
  //       where: {},
  //       cursor: cursor
  //         ? {
  //             id: cursor,
  //           }
  //         : undefined,
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     });
  //     let nextCursor: typeof cursor | undefined = undefined;
  //     if (items.length > limit) {
  //       // Remove the last item and use it as next cursor
  //       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //       const nextItem = items.pop()!;
  //       nextCursor = nextItem.id;
  //     }
  //     return {
  //       items: items.reverse(),
  //       nextCursor,
  //     };
  //   }),
  // byId: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     const { id } = input;
  //     const post = await prisma.post.findUnique({
  //       where: { id },
  //       select: defaultPostSelect,
  //     });
  //     if (!post) {
  //       throw new TRPCError({
  //         code: 'NOT_FOUND',
  //         message: `No post with id '${id}'`,
  //       });
  //     }
  //     return post;
  //   }),
  // add: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string().uuid().optional(),
  //       title: z.string().min(1).max(32),
  //       text: z.string().min(1),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const post = await prisma.post.create({
  //       data: input,
  //       select: defaultPostSelect,
  //     });
  //     return post;
  //   }),
});
