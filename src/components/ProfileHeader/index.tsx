import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/router';

interface ProfileHeaderProps {
  name?: string;
  image?: string;
  postCount?: number;
}

export const ProfileHeader = ({
  name,
  image,
  postCount,
}: ProfileHeaderProps) => {
  const router = useRouter();
  return (
    <>
      <Box
        py={0.25}
        display="flex"
        border="1px solid rgb(56, 68, 77)"
        borderBottom="0px"
        alignItems="center"
      >
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
    </>
  );
};
