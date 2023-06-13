import { Dialog } from '@mui/material';
import { FC } from 'react';

interface ViewLikesModal {
  open: boolean;
}

export const ViewLikesModal: FC<ViewLikesModal> = ({ open }) => {
  return <Dialog open={open}>ViewLikesModal</Dialog>;
};
