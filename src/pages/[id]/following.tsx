import { Box, Button } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';
import UsersListItem from '~/components/UsersListItem';
import { trpc } from '~/utils/trpc';

const Following: NextPage = () => {
  const router = useRouter();
  const followerId = router.query.id as string;
  const getUserQuery = trpc.user.getUser.useQuery(undefined);

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
        <>
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
        </>
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
