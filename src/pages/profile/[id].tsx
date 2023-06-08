import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import PostsList from '~/components/PostList';

const ProfilePage = () => {
  const router = useRouter();
  const profileId = router.query.id as string;
  return (
    <Box>
      <PostsList profileId={profileId} />
    </Box>
  );
};

export default ProfilePage;
