import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from 'react';
import { trpc } from '~/utils/trpc';

interface EditProfileModalProps {
  open: boolean;
  handleClose: () => void;
}

const EditProfileModal = ({ open, handleClose }: EditProfileModalProps) => {
  const [selectedAvatar, setSelectedAvatar] = useState<File | undefined>(
    undefined,
  );
  const nameLength = 50;
  const bioLength = 200;
  const utils = trpc.useContext();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const getUser = trpc.user.getUser.useQuery();

  const editUser = trpc.user.editProfile.useMutation({
    onSuccess: (data) => {
      utils.user.getPublicProfile.setData(
        { profileId: data._id.toString() },
        (oldData) => {
          if (!oldData) {
            return undefined;
          }
          return { ...oldData, ...data };
        },
      );
    },
  });

  useEffect(() => {
    if (getUser.data?.name) {
      setName(getUser.data.name);
    }
  }, [getUser.data?.name]);

  useEffect(() => {
    if (getUser.data?.bio) {
      setBio(getUser.data.bio);
    }
  }, [getUser.data?.bio]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    editUser.mutateAsync({ name, bio }).then(() => {
      handleClose();
    });
  };

  const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedAvatar(file);
    }
  };

  if (getUser.isLoading) {
    return <div>Loading</div>;
  }

  if (!getUser.data) {
    return null;
  }

  return (
    <Dialog
      fullScreen={matches}
      fullWidth
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Edit Profile</DialogTitle>

      <Box>
        <Box height={120} bgcolor="#ccc" />

        <Box
          htmlFor="edit-avatar-input"
          component="label"
          border="4px solid black"
          borderRadius={50}
          overflow="hidden"
          position="relative"
          top={-67}
          height={134}
          ml={2}
          sx={{
            userSelect: 'none',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& img': {
              objectFit: 'cover',
              minWidth: '100%',
              minHeight: '100%',
              cursor: 'pointer',
            },
          }}
        >
          <img
            src={
              selectedAvatar
                ? URL.createObjectURL(selectedAvatar)
                : getUser.data?.image
            }
            alt={`${getUser.data?.name} avatar`}
          />
        </Box>
      </Box>

      <Box component="form" mt={-6} onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
          id="edit-avatar-input"
          //TODO: update disabled logic
          disabled={false}
        />
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={name || ''}
            onChange={(e) => setName(e.target.value)}
            inputProps={{
              maxLength: nameLength,
            }}
          />
          <Typography
            component="p"
            ml="auto"
            textAlign="right"
            gutterBottom
            fontSize={12}
            variant="body2"
            mt={0.5}
          >
            {`${name.length}/50`}
          </Typography>

          <TextField
            fullWidth
            label="Bio"
            value={bio || ''}
            onChange={(e) => setBio(e.target.value)}
            multiline
            inputProps={{
              maxLength: bioLength,
            }}
          />
          <Typography
            component="p"
            ml="auto"
            textAlign="right"
            gutterBottom
            fontSize={12}
            mt={0.5}
            variant="body2"
          >
            {`${bio.length}/200`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="info" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProfileModal;
