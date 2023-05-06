import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';
import { useQueryClient } from '@tanstack/react-query';
import NewPost from '~/components/NewPost';
import PostsList from '~/components/PostsList';
import getGoogleOAuthURL from '~/utils/getGoogleUrl';
import { Button, Typography } from '@mui/material';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const queryClient = useQueryClient();

  const getUser = trpc.user.getUser.useQuery(undefined, {
    retry: false,
    initialData: null,
    onError: ({ data }) => {
      // console.log('@@@@@@@@@@@@@@@@@@@@@@\n', data);
      if (data?.code === 'UNAUTHORIZED') {
        console.log('not logged in');
      }
    },
  });

  const logoutMutation = trpc.user.logout.useMutation({
    onSuccess: () => {
      queryClient.setQueryData([['user', 'getUser'], { type: 'query' }], null);
    },
  });

  // console.log(getUser.data);

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
      <Typography variant="h1" component="h1">
        Devgram
      </Typography>
      {getUser.data ? (
        <h3 data-test="welcome-text">Welcome {getUser.data.name}</h3>
      ) : (
        <a href={getGoogleOAuthURL()}>Login With Google</a>
      )}
      <h2>Latest Posts</h2>
      {/* {postsQuery.status === 'loading' && '(loading)'} */}
      <PostsList />
      {getUser.data ? <NewPost /> : <p>Login to post</p>}
      {getUser.data ? (
        <Button
          data-cy="logout-button"
          type="button"
          variant="contained"
          color="error"
          onClick={() => logoutMutation.mutate()}
        >
          Logout
        </Button>
      ) : null}
      <Button onClick={() => utils.user.getUser.refetch()}>refetch user</Button>
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
