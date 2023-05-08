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
import Comment from '../models/Comment';
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

      await newComment.save();
      return newComment;
    }),
  getCommentsByPostId: publicProcedure
    .input(z.string())
    .output(
      z.array(
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
    )
    .query(async ({ input }) => {
      const comments = await Comment.find({ postId: input })
        .populate('userId', { _id: 1, image: 1, name: 1 })
        .sort({ createdAt: -1 })
        .lean();

      return comments;
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

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (comment?.postId.toString() === post?._id.toString()) {
        // Comment is make to logged in user's Post
        await Comment.deleteOne({ _id: input.commentId });
        return true;
      }

      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }),
});
