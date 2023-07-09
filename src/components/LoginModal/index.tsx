import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import { useLoginModalStateContext } from '~/context/loginModalStateContext';
import { LoginButton } from '../LoginButton';

export const LoginModal = () => {
  const { open, setOpen, message } = useLoginModalStateContext();

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Login/Signup</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="error" sx={{ mr: 1 }} onClick={handleClose}>
          Close
        </Button>
        <LoginButton />
      </DialogActions>
    </Dialog>
  );
};
