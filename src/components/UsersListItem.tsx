import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from './common/Link';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

interface UsersListItem {
  _id: string;
  image?: string;
  bio?: string;
  name: string;
  verified?: boolean | null;
  developer?: boolean | null;
}

const UsersListItem = ({
  _id,
  image,
  bio,
  name,
  developer,
  verified,
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
          {developer && (
            <Tooltip title="Developer">
              <CodeRoundedIcon sx={{ ml: 1, fontSize: 20 }} color="primary" />
            </Tooltip>
          )}
        </Box>
        <Typography variant="body1">{bio}</Typography>
      </Box>
    </Link>
  );
};

export default UsersListItem;
