import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';

import NewPost from '~/components/NewPost';
import PostsList from '~/components/PostsList';
import getGoogleOAuthURL from '~/utils/getGoogleUrl';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useContext();

  const userData = trpc.user.getUser.useQuery(undefined, {
    retry: false,
  });

  // console.log(userData.data);

  // const myString = trpc.post.sayHi.useQuery('dfgrtrhrth');
  // console.log(myString.data);
  // const postsQuery = trpc.post.list.useInfiniteQuery(
  //   {
  //     limit: 5,
  //   },
  //   {
  //     getPreviousPageParam(lastPage) {
  //       return lastPage.nextCursor;
  //     },
  //   },
  // );

  // const addPost = trpc.post.add.useMutation({
  //   async onSuccess() {
  //     // refetches posts after a post is added
  //     await utils.post.list.invalidate();
  //   },
  // });

  // prefetch all posts for instant navigation
  // useEffect(() => {
  //   const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  //   for (const { id } of allPosts) {
  //     void utils.post.byId.prefetch({ id });
  //   }
  // }, [postsQuery.data, utils]);

  return (
    <>
      {userData.data ? (
        <h3>Welcome {userData.data.name}</h3>
      ) : (
        <a href={getGoogleOAuthURL()}>Login With Google</a>
      )}
      <h2>Latest Posts</h2>
      {/* {postsQuery.status === 'loading' && '(loading)'} */}
      <PostsList />
      <NewPost />
    </>
  );
};

export default IndexPage;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createServerSideHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
