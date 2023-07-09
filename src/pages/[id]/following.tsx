import { Box, Button, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';
import UsersListItem from '~/components/UsersListItem';
import { trpc } from '~/utils/trpc';

const Following: NextPage = () => {
  const router = useRouter();
  const followerId = router.query.id as string;
  const getUserQuery = trpc.user.getUser.useQuery(undefined);

  const { data } = trpc.user.getPublicProfile.useQuery(
    { profileId: followerId },
    {
      onError: ({ data }) => {
        if (data?.code === 'NOT_FOUND') {
          console.log('user not found');
        }

        if (data?.code === 'BAD_REQUEST') {
          console.log('bad__request');
        }
      },
    },
  );

  const followingQuery = trpc.user.getFollowing.useInfiniteQuery(
    {
      followerId,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const following = followingQuery.data?.pages.flatMap(
    (page) => page.following,
  );

  return (
    <>
      <FollowersHeaderLayout selected="following" />
      <Box
        sx={{
          borderLeft: {
            md: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            md: '1px solid rgb(56, 68, 77)',
          },
        }}
        borderBottom="1px solid rgb(56, 68, 77)"
      >
        {following?.length == 0 && data && (
          <Typography align="center" variant="h5" py={3}>
            {data.name} does not follow anyone 🧛
          </Typography>
        )}
        {following?.map((obj) => (
          <UsersListItem
            key={obj._id.toString()}
            _id={obj.userId._id.toString()}
            name={obj.userId.name}
            image={obj.userId.image}
            bio={obj.userId.bio}
            developer={obj.userId.tags?.developer}
            verified={obj.userId.tags?.verified}
            hideFollowButton={getUserQuery.data?._id === obj.userId._id}
            followed={obj.userId.followed}
            type="follow"
            profileId={followerId}
            postId={undefined}
          />
        ))}
      </Box>

      {followingQuery.hasNextPage && (
        <Button onClick={() => followingQuery.fetchNextPage()}>
          Load more
        </Button>
      )}
    </>
  );
};

export default Following;
