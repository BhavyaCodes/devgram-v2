import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import NewPost from '~/components/NewPost';
import PostsList from '~/components/PostList';
import { ProfileHeader } from '~/components/ProfileHeader';
import { trpc } from '~/utils/trpc';

const ProfilePage = () => {
  const router = useRouter();
  const profileId = router.query.id as string;

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
    <Box>
      <ProfileHeader />
      {getUser.data?._id.toString() === profileId ? <NewPost /> : null}
      <PostsList profileId={profileId} />
    </Box>
  );
};

export default ProfilePage;
