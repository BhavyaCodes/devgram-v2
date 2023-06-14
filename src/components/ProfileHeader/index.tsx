import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import { useEffect, useState } from 'react';
import EditProfileModal from './EditProfileModal';
import { formatText } from '~/utils/formatText';
import { formatDate } from '~/utils/formatDate';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { getImageUrl } from '~/utils/getImageUrl';
import ModalList, { ModalListOptions } from './ModalList';
import Link from '../common/Link';
import { LogoSvg } from '../common/LogoSvg';

export const ProfileHeader = () => {
  const [modalListOptions, setModalListOptions] = useState<ModalListOptions>({
    open: false,
    type: 'getFollowing',
  });
  const [rendered, setRendered] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const router = useRouter();

  const profileId = router.query.id as string;
  useEffect(() => {
    setRendered(true);
  }, []);
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

  const handleShowFollowing = () => {
    setModalListOptions({
      open: true,
      type: 'getFollowing',
    });
  };

  const handleShowFollowers = () => {
    setModalListOptions({
      open: true,
      type: 'getFollowers',
    });
  };

  return (
    <>
      <ModalList
        modalListOptions={modalListOptions}
        handleClose={() => setModalListOptions((s) => ({ ...s, open: false }))}
        profileId={profileId}
      />
      <EditProfileModal
        open={editProfileOpen}
        handleClose={() => setEditProfileOpen(false)}
      />
      <Box
        width="100%"
        borderTop={0}
        position="sticky"
        top={-0.5}
        zIndex={1100}
        sx={{
          borderLeft: {
            md: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            md: '1px solid rgb(56, 68, 77)',
          },
          backdropFilter: 'blur(12px)',
        }}
        bgcolor="rgba(0, 0, 0, 0.65)"
      >
        <Box display="flex" alignItems="center" position="sticky">
          <Link href="/">
            <IconButton sx={{ flexShrink: 0, ml: 1, mr: 2 }}>
              <ArrowBackRoundedIcon />
            </IconButton>
          </Link>
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
        <Box
          bgcolor="#ccc"
          sx={{
            aspectRatio: 3,
            '& img': {
              display: 'block',
              maxWidth: '100%',
            },
          }}
        >
          {!!data?.banner && (
            <img src={getImageUrl(data?.banner)} alt="profile banner" />
          )}
        </Box>
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
            bgcolor="black"
            sx={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#ccc',
              '& img': {
                objectFit: 'cover',
                minWidth: '100%',
                minHeight: '100%',
              },
            }}
          >
            <img src={getImageUrl(data?.image)} alt={`${data?.name} avatar`} />
          </Box>
          <Box p={2}>
            {currentUserQuery.data?._id.toString() === data?._id.toString() ? (
              <Button
                variant="contained"
                onClick={() => setEditProfileOpen(true)}
                size="small"
              >
                Edit Profile
              </Button>
            ) : data?.followed ? (
              <Button
                size="small"
                variant="contained"
                onClick={handleUnFollowUser}
              >
                UnFollow
              </Button>
            ) : (
              <Button
                size="small"
                variant="contained"
                onClick={handleFollowUser}
              >
                Follow
              </Button>
            )}
          </Box>
        </Box>
        <Box p={2} mt={-8}>
          <Typography
            fontSize={20}
            fontWeight={800}
            component="h1"
            whiteSpace="pre-wrap"
            sx={{ overflowWrap: 'anywhere' }}
            display="flex"
            alignItems="center"
          >
            {formatText(data?.name)}
            {data?.tags?.verified && (
              <Tooltip title="Verified">
                <VerifiedRoundedIcon
                  sx={{ ml: 1, fontSize: 20 }}
                  color="primary"
                />
              </Tooltip>
            )}
            {data?.tags?.developer && <LogoSvg title="Developer" ml={0.5} />}
          </Typography>
          <Typography
            variant="body1"
            whiteSpace="pre-wrap"
            sx={{ overflowWrap: 'anywhere' }}
            color="rgb(231, 233, 234)"
          >
            {formatText(data?.bio)}
          </Typography>

          <Typography
            variant="body2"
            display="flex"
            alignItems="baseline"
            mt={1}
          >
            <CalendarMonthIcon
              sx={{
                fontSize: 'inherit',
                position: 'relative',
                top: 1,
                mr: 0.75,
              }}
            />
            {rendered && (
              <Typography component="span">
                Joined {formatDate(data?.createdAt)}
              </Typography>
            )}
          </Typography>
          <Box display="flex">
            <Link
              href={`/${profileId}/following`}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography component="span" fontWeight={700} mr={1}>
                {data?.followingCount}{' '}
                <Typography component="span" variant="body2">
                  Following
                </Typography>
              </Typography>
            </Link>
            <Link
              href={`/${profileId}/followers`}
              color="inherit"
              sx={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <Typography component="span" fontWeight={700}>
                {data?.followerCount}{' '}
                <Typography component="span" variant="body2">
                  Followers
                </Typography>
              </Typography>
            </Link>
          </Box>
        </Box>
      </Box>
      <Box onClick={handleShowFollowers}>Followers: {data?.followerCount}</Box>
      <Box onClick={handleShowFollowing}>Following: {data?.followingCount}</Box>
      <Box>Followed: {data?.followed ? 'true' : 'false'}</Box>
      <Box>Follows you: {data?.followsYou ? 'true' : 'false'}</Box>
    </>
  );
};
