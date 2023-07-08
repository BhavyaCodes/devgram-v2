import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';

import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import { trpc } from '~/utils/trpc';
import Link from '~/components/common/Link';
import { LogoSvg } from '~/components/common/LogoSvg';
import { useState } from 'react';

interface ListItemProps {
  _id: string;
  image?: string;
  name: string;
  verified?: boolean | null;
  developer?: boolean | null;
}

const ListItem = ({ _id, image, name, developer, verified }: ListItemProps) => {
  const [followed, setFollowed] = useState(false);

  const followerUserMutation = trpc.user.followUser.useMutation({
    onSuccess(data, variables) {
      setFollowed(true);
    },
  });

  const unFollowUserMutation = trpc.user.unfollowUser.useMutation({
    onSuccess(data, variables) {
      setFollowed(false);
    },
  });

  return (
    <Link
      href={`/${_id}`}
      display="flex"
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        px: 2,
        py: 1,
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box flexShrink={0} mr={2}>
        <Avatar src={getImageUrl(image)} alt={name} />
      </Box>
      <Box flexGrow={1} display="flex">
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center">
            <Typography fontWeight={700}>{name}</Typography>{' '}
            {verified && (
              <Tooltip title="Verified">
                <VerifiedRoundedIcon
                  sx={{ ml: 1, fontSize: 20 }}
                  color="primary"
                />
              </Tooltip>
            )}
            {developer && <LogoSvg title="Developer" ml={0.5} />}
          </Box>
        </Box>

        <Box
          maxWidth={100}
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-end"
        >
          {followed ? (
            <Button
              variant="outlined"
              color="inherit"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                unFollowUserMutation.mutate({ userId: _id });
              }}
              sx={{
                display: 'inline-block',
                width: 100,
                ml: 0.5,
                '&::after': {
                  display: 'flex',
                  justifyContent: 'center',
                  content: "'Following'",
                },
                '&:hover': {
                  color: (theme) => theme.palette.error.light,
                  '&::after': {
                    content: '"UnFollow"',
                  },
                },
              }}
            ></Button>
          ) : (
            <Button
              variant="contained"
              sx={{
                ml: 0.5,
                width: 300,
              }}
              color="inherit"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                followerUserMutation.mutate({ userId: _id });
              }}
            >
              Follow
            </Button>
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default ListItem;
