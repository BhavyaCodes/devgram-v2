import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import {
  loginModalMessage,
  useLoginModalStateContext,
} from '~/context/loginModalStateContext';
import { LoginButton } from '../LoginButton';
import { useEffect, useState } from 'react';

export const LoginModal = () => {
  const { message, setMessage } = useLoginModalStateContext();
  const [messageTextInternal, setMessageTextInternal] =
    useState<loginModalMessage | null>(message);

  useEffect(() => {
    let timeoutId: any;
    if (message) {
      setMessageTextInternal(message);
    } else {
      timeoutId = setTimeout(() => {
        setMessageTextInternal(null);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [message]);

  const handleClose = () => setMessage(null);

  return (
    <Dialog open={!!message} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Login/Signup</DialogTitle>
      <DialogContent>
        <DialogContentText>{messageTextInternal}</DialogContentText>
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
