import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';

interface EditProfileModalProps {
  open: boolean;
  handleClose: () => void;
}

const EditProfileModal = ({ open, handleClose }: EditProfileModalProps) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
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
      <DialogContent></DialogContent>
      <DialogActions>
        <Button color="info" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
