import { Avatar, Box, ListItemIcon, ListItemText } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import { trpc } from '~/utils/trpc';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, MouseEvent } from 'react';

export const ProfileButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const context = trpc.useContext();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logoutMutation = trpc.user.logout.useMutation({
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      context.user.getUser.setData(undefined, () => null);
    },
  });

  const { data } = trpc.user.getUser.useQuery(undefined, { staleTime: 60000 });

  return (
    <>
      <Box
        role="button"
        display="flex"
        p={1.5}
        onClick={handleClick}
        alignItems="center"
        sx={{
          borderRadius: 200,
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            transition: (theme) => theme.transitions.create('background-color'),
            cursor: 'pointer',
          },
        }}
      >
        <Avatar src={getImageUrl(data?.image)} alt={data?.name} />

        <MoreHorizIcon
          sx={{
            ml: 2,
            display: {
              xs: 'none',
              lg: 'inline',
            },
          }}
        />
      </Box>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            logoutMutation.mutate();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
