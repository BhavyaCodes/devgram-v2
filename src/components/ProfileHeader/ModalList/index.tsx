import { Avatar, Box, Button, Dialog, Typography } from '@mui/material';
import React, { FC } from 'react';
import { getImageUrl } from '~/utils/getImageUrl';
import { trpc } from '~/utils/trpc';

export interface ModalListOptions {
  open: boolean;
  type: 'getFollowing' | 'getFollowers';
}

interface ModalListProps {
  profileId: string;
  handleClose: () => void;
  modalListOptions: ModalListOptions;
}

const ModalList: FC<ModalListProps> = ({
  modalListOptions,
  handleClose,
  profileId,
}) => {
  const followingQuery = trpc.user.getFollowing.useInfiniteQuery(
    {
      followerId: profileId,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      enabled:
        modalListOptions.open && modalListOptions.type === 'getFollowing',
    },
  );

  // console.log(followingQuery.data);

  const followingUsers = followingQuery.data?.pages.flatMap(
    (page) => page.following,
  );

  console.log(followingUsers);

  const onClose = () => {
    handleClose();
    followingQuery.remove();
  };

  return (
    <Dialog open={modalListOptions.open} onClose={onClose}>
      {followingUsers?.map((user) => (
        <Box key={user._id.toString()}>
          <Typography>{user.userId.name}</Typography>
          <Avatar src={getImageUrl(user.userId.image)} alt={user.userId.name} />
        </Box>
      ))}
      {followingQuery.hasNextPage && (
        <Button onClick={() => followingQuery.fetchNextPage()}>
          Load more
        </Button>
      )}
    </Dialog>
  );
};

export default ModalList;
