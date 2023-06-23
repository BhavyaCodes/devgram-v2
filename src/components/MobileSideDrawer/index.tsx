import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FC, useEffect } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { trpc } from '~/utils/trpc';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from '../common/Link';

//icons
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import GitHubIcon from '@mui/icons-material/GitHub';
import { SideDrawerOption } from './SideDrawerOption';

interface MobileSideDrawerProps {
  drawerOpen: boolean;
  onClose: () => void;
}

export const MobileSideDrawer: FC<MobileSideDrawerProps> = ({
  drawerOpen,
  onClose,
}) => {
  const theme = useTheme();
  const context = trpc.useContext();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const getUserQuery = trpc.user.getUser.useQuery(undefined, {
    staleTime: 60000,
    enabled: drawerOpen,
  });

  const logoutMutation = trpc.user.logout.useMutation({
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      context.user.getUser.setData(undefined, () => null);
    },
  });

  const userPublicProfile = trpc.user.getPublicProfile.useQuery(
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      profileId: getUserQuery.data?._id.toString(),
    },
    {
      enabled: !!getUserQuery.data?._id && drawerOpen,
      staleTime: 60000,
    },
  );

  useEffect(() => {
    if (!matches) {
      onClose();
    }
  }, [matches]);

  return (
    <Drawer
      open={drawerOpen}
      onClose={onClose}
      sx={{
        width: 240,
        maxWidth: '100%',
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={1}
        >
          <Typography fontWeight={700} fontSize={17} pl={1}>
            Account Info
          </Typography>
          <IconButton sx={{ mr: -0.5 }} onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      {userPublicProfile.data && getUserQuery.data && (
        <>
          <Box p={2}>
            <Avatar
              src={getImageUrl(getUserQuery.data?.image)}
              alt={getUserQuery.data?.name}
            />
            <Typography mt={1} fontSize={17} fontWeight={700}>
              {getUserQuery.data?.name}
            </Typography>
          </Box>
          <Box display="flex" p={2}>
            <Link
              href={`/${getUserQuery.data._id.toString()}/following`}
              onClick={onClose}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography component="span" fontWeight={700} mr={1}>
                {userPublicProfile.data.followingCount}{' '}
                <Typography component="span" variant="body2">
                  Following
                </Typography>
              </Typography>
            </Link>
            <Link
              onClick={onClose}
              href={`/${getUserQuery.data._id.toString()}/followers`}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography component="span" fontWeight={700}>
                {userPublicProfile.data.followerCount}{' '}
                <Typography component="span" variant="body2">
                  Followers
                </Typography>
              </Typography>
            </Link>
          </Box>
          <Box onClick={onClose}>
            <SideDrawerOption
              text="Profile"
              href={`/${getUserQuery.data._id.toString()}`}
            >
              <PersonIcon />
            </SideDrawerOption>
            <SideDrawerOption text="About" href="/about">
              <InfoIcon />
            </SideDrawerOption>
            <SideDrawerOption
              text="GitHub"
              target="_blank"
              href="https://github.com/BhavyaCodes/devgram-v2"
            >
              <GitHubIcon />
            </SideDrawerOption>
          </Box>
        </>
      )}
      <Box p={1}>
        <Button
          color="inherit"
          onClick={() => {
            onClose();
            logoutMutation.mutate();
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};
