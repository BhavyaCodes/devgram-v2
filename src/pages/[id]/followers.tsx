import { Box, Button, Typography } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';
import UsersListItem from '~/components/UsersListItem';
import { trpc } from '~/utils/trpc';

const Followers: NextPage = () => {
  const router = useRouter();
  const userId = router.query.id as string;

  const { data } = trpc.user.getPublicProfile.useQuery(
    { profileId: userId },
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
  const getUserQuery = trpc.user.getUser.useQuery(undefined);

  const followersQuery = trpc.user.getFollowers.useInfiniteQuery(
    {
      userId,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const followers = followersQuery.data?.pages.flatMap(
    (page) => page.followers,
  );

  return (
    <>
      <FollowersHeaderLayout selected="followers" />
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
        {followers?.length == 0 && data && (
          <Typography align="center" variant="h5" py={3}>
            No one follows {data.name} 🤓
          </Typography>
        )}
        {followers?.map((obj) => (
          <UsersListItem
            key={obj._id.toString()}
            _id={obj.followerId._id.toString()}
            name={obj.followerId.name}
            image={obj.followerId.image}
            bio={obj.followerId.bio}
            developer={obj.followerId.tags?.developer}
            verified={obj.followerId.tags?.verified}
            hideFollowButton={getUserQuery.data?._id === obj.followerId._id}
            followed={obj.followerId.followed}
            type="follow"
            profileId={userId}
            postId={undefined}
          />
        ))}
      </Box>

      {followersQuery.hasNextPage && (
        <Button onClick={() => followersQuery.fetchNextPage()}>
          Load more
        </Button>
      )}
    </>
  );
};

export default Followers;
