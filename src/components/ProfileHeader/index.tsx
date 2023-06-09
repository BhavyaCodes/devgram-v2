import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

export const ProfileHeader = ({}) => {
  const router = useRouter();

  const profileId = router.query.id as string;

  const currentUserQuery = trpc.user.getUser.useQuery(undefined, {
    staleTime: 60000,
    retry: false,
    onError: ({ data }) => {
      if (data?.code === 'UNAUTHORIZED') {
        console.log('not logged in');
      }
    },
  });

  const { data, refetch } = trpc.user.getPublicProfile.useQuery(
    { profileId },
    {
      // staleTime: 60000,
      onError: ({ data }) => {
        if (data?.code === 'NOT_FOUND') {
          console.log('user not found');
          // router.replace()
        }

        if (data?.code === 'BAD_REQUEST') {
          console.log('bad__request');
          // router.replace()
        }
      },
    },
  );

  const followUserMutation = trpc.user.followUser.useMutation();
  const unfollowUserMutation = trpc.user.unfollowUser.useMutation();

  const handleFollowUser = () => {
    if (!data?._id) {
      return;
    }
    followUserMutation
      .mutateAsync({
        userId: data?._id.toString(),
      })
      .then(() => refetch());
  };

  const handleUnFollowUser = () => {
    if (!data?._id) {
      return;
    }
    unfollowUserMutation
      .mutateAsync({
        userId: data?._id.toString(),
      })
      .then(() => refetch());
  };

  return (
    <>
      <Box
        width="100%"
        overflow="hidden"
        borderTop={0}
        position="sticky"
        top={0}
        sx={{
          borderLeft: {
            md: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            md: '1px solid rgb(56, 68, 77)',
          },
          backdropFilter: 'blur(12px)',
        }}
        bgcolor="rgba(0, 0, 0, 0)"
      >
        <Box display="flex" alignItems="center" position="sticky">
          <IconButton onClick={router.back} sx={{ flexShrink: 0, mx: 1 }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Typography fontWeight={700} fontSize={20}>
              {data?.name || ''}
            </Typography>
            <Typography fontSize={13} color="rgb(113, 118, 123)">
              {data?.postCount} Posts
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          borderLeft: {
            md: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            md: '1px solid rgb(56, 68, 77)',
          },
        }}
      >
        <Box height={120} bgcolor="#ccc" />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            border="4px solid black"
            borderRadius={50}
            overflow="hidden"
            position="relative"
            top={-67}
            height={134}
            ml={2}
            sx={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& img': {
                objectFit: 'cover',
                minWidth: '100%',
                minHeight: '100%',
              },
            }}
          >
            <img src={data?.image} alt={`${data?.name} avatar`} />
          </Box>
          <Box p={2}>
            {currentUserQuery.data?._id.toString() === data?._id.toString() ? (
              <Box>My Profile</Box>
            ) : data?.followed ? (
              <Button variant="contained" onClick={handleUnFollowUser}>
                UnFollow
              </Button>
            ) : (
              <Button variant="contained" onClick={handleFollowUser}>
                Follow
              </Button>
            )}
          </Box>
        </Box>
      </Box>
      <Box>
        <Button onClick={handleFollowUser}>Follow</Button>
        <Button onClick={handleUnFollowUser}>UnFollow</Button>
      </Box>
      <Box>Followers: {data?.followerCount}</Box>
      <Box>Followed: {data?.followed ? 'true' : 'false'}</Box>
      <Box>Follows you: {data?.followsYou ? 'true' : 'false'}</Box>
    </>
  );
};
