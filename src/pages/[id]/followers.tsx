import { Box, Button } from '@mui/material';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';
import UsersListItem from '~/components/UsersListItem';
import { trpc } from '~/utils/trpc';

const Followers: NextPage = () => {
  const router = useRouter();
  const userId = router.query.id as string;
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
        <>
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
            />
          ))}
        </>
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
