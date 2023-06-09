import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

interface ProfileHeaderProps {
  userId?: string;
  name?: string;
  image?: string;
  postCount?: number;
}

export const ProfileHeader = ({
  userId,
  name,
  image,
  postCount,
}: ProfileHeaderProps) => {
  const router = useRouter();

  const followUserMutation = trpc.user.followUser.useMutation();

  const handleFollowUser = () => {
    if (!userId) {
      return;
    }
    followUserMutation.mutate({ userId });
  };

  return (
    <>
      <Box
        width="100%"
        overflow="hidden"
        borderBottom="1px solid rgb(56, 68, 77)"
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
              {name || ''}
            </Typography>
            <Typography fontSize={13} color="rgb(113, 118, 123)">
              {postCount} Posts
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box>
        <Button onClick={handleFollowUser}>Follow</Button>
      </Box>
    </>
  );
};
