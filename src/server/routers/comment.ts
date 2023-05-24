/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { ObjectId } from 'mongodb';
import { authOnlyProcedure } from '../middleware';
import Post from '../models/Post';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import Comment, { IComment } from '../models/Comment';
import { FilterQuery, Types } from 'mongoose';
/**
 *
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

export const commentRouter = router({
  addComment: authOnlyProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string(),
      }),
    )
    .output(
      z.object({
        comment: z.object({
          content: z.string(),
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { content, postId } = input;
      const user = ctx.session.userId;

      const count = await Post.countDocuments({ _id: postId });

      if (!count) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post does not exist',
        });
      }

      const newComment = new Comment({
        content,
        postId,
        userId: user._id,
      });

      const savedComment = await newComment.save();

      const result = {
        comment: {
          content: savedComment.content,
          _id: savedComment._id,
          createdAt: savedComment.createdAt,
          updatedAt: savedComment.updatedAt,
          postId: new Types.ObjectId(postId),
          userId: {
            _id: user._id,
            image: user.image,
            name: user.name,
          },
        },
      };

      return result;
    }),
  getCommentsByPostIdPaginated: publicProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            _id: z.string(),
            exclude: z.boolean().optional(),
          })
          .nullish(),
        postId: z.string(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        comments: z.array(
          z.object({
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
      const limit = input.limit || 5;
      const cursor = input.cursor;
      const createdAt = input.cursor?.createdAt;
      const _id = input?.cursor?._id;

      const operator = input.cursor?.exclude ? '$lt' : '$lte';

      const query: FilterQuery<IComment> =
        createdAt && _id
          ? {
              $or: [
                {
                  createdAt: { [operator]: createdAt },
                  postId: input.postId,
                },
                {
                  createdAt,
                  _id: { [operator]: new Types.ObjectId(_id) },
                  postId: input.postId,
                },
              ],
            }
          : { postId: input.postId };

      const comments = await Comment.find(query)
        .populate('userId', { _id: 1, image: 1, name: 1 })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 50) + 1)
        .lean();

      let nextCursor: typeof cursor = undefined;
      if (comments.length > limit) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = comments.pop()!;
        if (nextItem) {
          nextCursor = {
            _id: nextItem._id.toString(),
            createdAt: nextItem.createdAt,
          };
        }
      }

      return { comments, nextCursor };
    }),
  deleteComment: authOnlyProcedure
    .input(z.object({ commentId: z.string(), postId: z.string() }))
    .output(z.boolean())
    .mutation(async ({ ctx, input }) => {
      // If current user is author or Comment
      const deletedByCommentor = await Comment.findOneAndDelete({
        userId: ctx.session.userId._id,
        _id: input.commentId,
        postId: input.postId,
      });

      if (deletedByCommentor) {
        return true;
      }

      // If current user is author or Post

      const comment = await Comment.findOne({ _id: input.commentId });

      const post = await Post.findOne({
        userId: ctx.session.userId._id,
        _id: input.postId,
      });

      if (comment?.postId.toString() === post?._id.toString()) {
        // Comment is make to logged in user's Post
        await Comment.deleteOne({ _id: input.commentId });
        return true;
      }

      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }),
});
