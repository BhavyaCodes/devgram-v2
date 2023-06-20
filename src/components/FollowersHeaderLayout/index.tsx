import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { trpc } from '~/utils/trpc';
import { Option } from '../common/Option';
import Link from '../common/Link';

export const FollowersHeaderLayout = ({
  selected,
}: {
  selected: 'followers' | 'following';
}) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const router = useRouter();
  const profileId = router.query.id as string;

  const { data } = trpc.user.getPublicProfile.useQuery(
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

  const OptionsBox = () => (
    <Box
      display="flex"
      position={matches ? 'sticky' : undefined}
      borderBottom="1px solid rgb(56, 68, 77)"
      top={-1}
      bgcolor="rgba(0, 0, 0, 0.65)"
      sx={{
        backdropFilter: 'blur(12px)',
      }}
    >
      <Option
        href={`/${profileId}/followers`}
        selected={selected === 'followers'}
      >
        Followers
      </Option>

      <Option
        href={`/${profileId}/following`}
        selected={selected === 'following'}
      >
        Following
      </Option>
    </Box>
  );

  return (
    <>
      <Box
        width="100%"
        borderTop={0}
        position={matches ? undefined : 'sticky'}
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
          <Link href={`/${profileId}`}>
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
        {!matches && <OptionsBox />}
      </Box>
      {matches && <OptionsBox />}
    </>
  );
};
