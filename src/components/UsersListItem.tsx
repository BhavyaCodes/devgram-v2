import { Avatar, Box, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from './common/Link';

interface UsersListItem {
  _id: string;
  image?: string;
  bio?: string;
  name: string;
}

const UsersListItem = ({ _id, image, bio, name }: UsersListItem) => {
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
        <Typography fontWeight={700}>{name}</Typography>
        <Typography variant="body1">{bio}</Typography>
      </Box>
    </Link>
  );
};

export default UsersListItem;
