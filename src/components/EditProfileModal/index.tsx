import {
  Box,
  Button,
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
import axios from 'axios';
import { getImageUrl } from '~/utils/getImageUrl';
import { CloudinaryFolderName, transformations } from '~/types';
import { uploadImage } from '~/utils';

interface EditProfileModalProps {
  open: boolean;
  handleClose: () => void;
}

const EditProfileModal = ({ open, handleClose }: EditProfileModalProps) => {
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
    e.preventDefault();

    // avatar image upload
    let avatarImageId: string | undefined;

    // if (selectedAvatar) {
    //   const folderName: CloudinaryFolderName = 'avatar';

    //   const { signature, timestamp } = (
    //     await axios.get('/api/upload-image', {
    //       params: {
    //         type: folderName,
    //       },
    //     })
    //   ).data;

    //   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

    //   const uploadEndpoint =
    //     'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';

    //   const formData = new FormData();

    //   formData.append('file', selectedAvatar);
    //   formData.append(
    //     'api_key',
    //     process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
    //   );
    //   formData.append('signature', signature);
    //   formData.append(
    //     'folder',
    //     `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER}/${folderName}`,
    //   );
    //   formData.append('timestamp', timestamp.toString());
    //   formData.append('transformation', transformations[folderName]);

    //   await axios
    //     .post(uploadEndpoint, formData, {
    //       onUploadProgress: (e) => {
    //         // setImageUploadProgress(e.progress);
    //         console.log(e.progress);
    //       },
    //     })
    //     .then((res) => {
    //       avatarImageId = res.data.public_id as string;
    //     })
    //     .catch((err) => {
    //       // setImageUploadError('Error uploading image, please try again');
    //       console.log(err);
    //     });
    // }

    if (selectedAvatar) {
      const result = await uploadImage(selectedAvatar, 'avatar');
      if (result) {
        avatarImageId = result;
      }
    }

    // banner image upload
    let bannerImageId: string | undefined;

    if (selectedBanner) {
      const folderName: CloudinaryFolderName = 'banner';

      const { signature, timestamp } = (
        await axios.get('/api/upload-image', {
          params: {
            type: folderName,
          },
        })
      ).data;

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

      const uploadEndpoint =
        'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';

      const formData = new FormData();

      formData.append('file', selectedBanner);
      formData.append(
        'api_key',
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
      );
      formData.append('signature', signature);
      formData.append(
        'folder',
        `${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER}/${folderName}`,
      );
      formData.append('timestamp', timestamp.toString());
      formData.append('transformation', transformations[folderName]);

      await axios
        .post(uploadEndpoint, formData, {
          onUploadProgress: (e) => {
            // setImageUploadProgress(e.progress);
            console.log(e.progress);
          },
        })
        .then((res) => {
          bannerImageId = res.data.public_id as string;
        })
        .catch((err) => {
          // setImageUploadError('Error uploading image, please try again');
          console.log(err);
        });
    }

    editProfile
      .mutateAsync({ name, bio, image: avatarImageId, banner: bannerImageId })
      .then(() => {
        handleClose();
        setSelectedAvatar(undefined);
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
          //TODO: update disabled logic
          disabled={false}
        />
        <input
          type="file"
          onChange={handleBannerChange}
          style={{ display: 'none' }}
          id="edit-banner-input"
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
          <Button
            color="info"
            type="button"
            onClick={() => {
              handleClose();
              setSelectedAvatar(undefined);
            }}
          >
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
