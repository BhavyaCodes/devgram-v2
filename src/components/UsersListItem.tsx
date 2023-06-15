import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from './common/Link';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { LogoSvg } from './common/LogoSvg';

interface UsersListItem {
  _id: string;
  image?: string;
  bio?: string;
  name: string;
  verified?: boolean | null;
  developer?: boolean | null;
  followed?: boolean | null;
  hideFollowButton?: boolean;
}

const UsersListItem = ({
  _id,
  image,
  bio,
  name,
  developer,
  verified,
  followed,
  hideFollowButton,
}: UsersListItem) => {
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
          <Typography variant="body1">{bio}</Typography>
        </Box>

        <Box
          width={100}
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-end"
        >
          {!hideFollowButton && (
            <>
              {followed ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  sx={{
                    display: 'inline-block',
                    width: 100,
                    '&::after': {
                      display: 'flex',
                      justifyContent: 'center',
                      content: "'Following'",
                    },
                    '&:hover': {
                      color: 'red',
                      '&::after': {
                        content: '"UnFollow"',
                      },
                    },
                  }}
                ></Button>
              ) : (
                <Button
                  variant="contained"
                  color="inherit"
                  type="button"
                  onClick={(e) => e.preventDefault()}
                >
                  Follow
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default UsersListItem;
