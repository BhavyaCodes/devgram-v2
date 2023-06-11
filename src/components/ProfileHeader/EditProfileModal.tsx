import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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

import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import { getImageUrl } from '~/utils/getImageUrl';
import { uploadImage } from '~/utils';
import { TRPCClientError } from '@trpc/client';
import { IUser } from '~/server/models/User';

interface EditProfileModalProps {
  open: boolean;
  handleClose: () => void;
}

const EditProfileModal = ({ open, handleClose }: EditProfileModalProps) => {
  const [posting, setPosting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | undefined>(
    undefined,
  );
  const [selectedBanner, setSelectedBanner] = useState<File | undefined>(
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

  const editProfile = trpc.user.editProfile.useMutation({
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

      utils.user.getUser.setData(undefined, (oldData) => {
        if (!oldData) {
          return oldData;
        }
        return { ...oldData, ...data };
      });
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

  const handleSubmit: FormEventHandler = async (e) => {
    if (posting) {
      return;
    }

    if (editProfile.isLoading) {
      return;
    }

    setPosting(true);
    e.preventDefault();

    let avatarUploadPromise: Promise<string | void> | undefined;
    let bannerUploadPromise: Promise<string | void> | undefined;

    const promises: Promise<string | void>[] = [];

    // avatar image upload promise

    if (selectedAvatar) {
      avatarUploadPromise = uploadImage(selectedAvatar, 'avatar').catch((err) =>
        console.log(err),
      );
      promises.push(avatarUploadPromise);
    }

    // banner image upload promise

    if (selectedBanner) {
      bannerUploadPromise = uploadImage(selectedBanner, 'banner').catch((err) =>
        console.log(err),
      );
      promises.push(bannerUploadPromise);
    }

    const result = await Promise.all(promises).catch((err) => {
      console.log(err);
      setPosting(false);
      throw new TRPCClientError('Error uploading image');
    });

    const mutationObject: Partial<IUser> = {
      name,
      bio,
    };

    if (result.length === 2) {
      mutationObject.image = result[0] ? result[0] : undefined;
      mutationObject.banner = result[1] ? result[1] : undefined;
    } else if (result.length === 1) {
      if (selectedAvatar) {
        mutationObject.image = result[0] ? result[0] : undefined;
      } else {
        mutationObject.banner = result[0] ? result[0] : undefined;
      }
    }

    editProfile
      .mutateAsync(mutationObject)
      .then(() => {
        handleClose();
        setSelectedBanner(undefined);
        setSelectedAvatar(undefined);
        setPosting(false);
      })
      .catch((err) => {
        setPosting(false);
        console.log(err);
      });
  };

  const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedAvatar(file);
    }
  };

  const handleBannerChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedBanner(file);
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
      onClose={() => {
        handleClose();
        setSelectedBanner(undefined);
        setSelectedAvatar(undefined);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Edit Profile</DialogTitle>

      <Box>
        <Box
          bgcolor="#ccc"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          sx={{
            aspectRatio: 3,
            '& .edit-banner-image-preview': {
              // aspectRatio: 3,
              height: '100%',
              width: '100%',
              objectFit: 'cover',
            },
          }}
        >
          <Box
            position="absolute"
            htmlFor="edit-banner-input"
            component="label"
            onClick={(e) => {
              if (e.target !== e.currentTarget) {
                e.currentTarget.click();
              }
            }}
          >
            <IconButton type="button">
              <AddAPhotoRoundedIcon />
            </IconButton>
          </Box>

          <img
            className="edit-banner-image-preview"
            src={
              selectedBanner
                ? URL.createObjectURL(selectedBanner)
                : getImageUrl(getUser.data?.banner)
            }
            alt={`profile banner`}
          />
        </Box>

        <Box
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
            },
          }}
        >
          <Box
            htmlFor="edit-avatar-input"
            component="label"
            onClick={(e) => {
              if (e.target !== e.currentTarget) {
                e.currentTarget.click();
              }
            }}
            sx={{ position: 'absolute', zIndex: 10000 }}
          >
            <IconButton type="button">
              <AddAPhotoRoundedIcon />
            </IconButton>
          </Box>
          <img
            src={
              selectedAvatar
                ? URL.createObjectURL(selectedAvatar)
                : getImageUrl(getUser.data?.image)
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
          disabled={posting}
          accept="image/png,image/jpeg,image/webp"
        />
        <input
          type="file"
          onChange={handleBannerChange}
          style={{ display: 'none' }}
          id="edit-banner-input"
          disabled={posting}
          accept="image/png,image/jpeg,image/webp"
        />
        <DialogContent>
          <TextField
            fullWidth
            disabled={posting}
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
            disabled={posting}
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
          <Button
            color="info"
            type="button"
            onClick={() => {
              handleClose();
              setSelectedBanner(undefined);
              setSelectedAvatar(undefined);
            }}
          >
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={posting}>
            {posting ? <CircularProgress size={25} /> : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditProfileModal;
