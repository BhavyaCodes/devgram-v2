import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';
import NewPost from '~/components/NewPost';
import { Avatar, Box, Typography, useScrollTrigger } from '@mui/material';
import PostsList from '~/components/PostList';
import { Option } from '~/components/common/Option';

import { useState } from 'react';
import { getImageUrl } from '~/utils/getImageUrl';
import { LogoSvg } from '~/components/common/LogoSvg';
import { MobileSideDrawer } from '~/components/MobileSideDrawer';
import { LoginButton } from '~/components/LoginButton';

const IndexPage: NextPageWithLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<'forYou' | 'following'>(
    'forYou',
  );

  const trigger = useScrollTrigger({
    threshold: 20,
  });

  const getUser = trpc.user.getUser.useQuery(undefined, {
    staleTime: 60000,
    retry: false,
    onError: ({ data }) => {
      if (data?.code === 'UNAUTHORIZED') {
        console.log('not logged in');
      }
    },
  });

  return (
    <>
      <MobileSideDrawer
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <Box
        component="header"
        position="sticky"
        top={0}
        bgcolor="rgba(18, 18, 18, 0.5)"
        sx={{
          backdropFilter: 'blur(12px)',
          borderLeft: {
            xs: 'none',
            sm: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            xs: 'none',
            sm: '1px solid rgb(56, 68, 77)',
          },
          transition: (theme) => theme.transitions.create('top'),
          top: {
            xs: trigger ? -60 : 0,
            sm: 0,
          },
        }}
        borderBottom={getUser.data ? undefined : '1px solid rgb(56, 68, 77)'}
        zIndex={1100}
      >
        <Box
          justifyContent={getUser.data ? 'center' : 'space-between'}
          mx={2}
          py={2}
          sx={{
            display: {
              xs: 'flex',
              sm: 'none',
            },
          }}
          // bgcolor="rgba(18, 18, 18, 0.5)"
          alignItems="center"
        >
          {getUser.data && (
            <Avatar
              onClick={() => {
                setDrawerOpen(true);
              }}
              sx={{
                position: 'absolute',
                left: 16,
              }}
              src={getImageUrl(getUser.data.image)}
              alt={getUser.data.name}
            />
          )}
          <LogoSvg width={30} />
          {!getUser.data && getUser.isFetched && <LoginButton />}
        </Box>
        <Box
          justifyContent="space-between"
          mx={2}
          py={2}
          sx={{
            display: {
              xs: 'none',
              sm: 'flex',
            },
          }}
        >
          <Typography
            component="h2"
            fontSize={20}
            fontWeight={700}
            data-test="welcome-text"
          >
            Home
          </Typography>
          {!getUser.data && getUser.isFetched && <LoginButton />}
        </Box>
        {!!getUser.data && (
          <Box display="flex" borderBottom="1px solid rgb(56, 68, 77)" top={-1}>
            <Option
              onClick={() => setSelectedFeed('forYou')}
              selected={selectedFeed === 'forYou'}
            >
              For you
            </Option>

            <Option
              onClick={() => setSelectedFeed('following')}
              selected={selectedFeed === 'following'}
            >
              Following
            </Option>
          </Box>
        )}
      </Box>

      {getUser.data && <NewPost followingOnly={selectedFeed === 'following'} />}

      <PostsList followingOnly={selectedFeed === 'following'} />
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
