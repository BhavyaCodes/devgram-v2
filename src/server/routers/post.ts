/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import Post from '../models/Post';
import { router, publicProcedure } from '../trpc';
// import { TRPCError } from '@trpc/server';
import { z } from 'zod';
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

export const postRouter = router({
  sayHi: publicProcedure.input(z.string()).query(({ input }) => {
    return input;
  }),
  create: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    const post = new Post({ content: input });
    const result = (await post.save()).toJSON();
    return result;
  }),
  getAll: publicProcedure
    // .output(
    //   z.array(
    //     z.object({
    //       content: z.string(),
    //       _id: z.instanceof(ObjectId),
    //       createdAt: z.date(),
    //       updatedAt: z.date(),
    //     }),
    //   ),
    // )
    .query(async () => {
      const posts = await Post.find({}).lean();
      // console.log(posts);
      // console.log('---------------', typeof posts[0]?.createdAt);
      return posts;
    }),
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
