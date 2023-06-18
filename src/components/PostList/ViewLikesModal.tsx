import { Dialog } from '@mui/material';
import { FC } from 'react';
import { trpc } from '~/utils/trpc';
import UsersListItem from '../UsersListItem';
export interface ViewLikesModalProps {
  postId: string | null;
  onClose: () => void;
}

export const ViewLikesModal: FC<ViewLikesModalProps> = ({
  postId,
  onClose,
}) => {
  const viewLikesQuery = trpc.post.viewLikes.useInfiniteQuery(
    {
      postId: postId || '',
    },
    {
      enabled: !!postId,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  console.log(viewLikesQuery.data);
  console.log(postId);

  const likes = viewLikesQuery.data?.pages.flatMap((page) => page.likes);

  return (
    <Dialog onClose={onClose} open={!!postId} fullWidth maxWidth="sm">
      ViewLikesModal
      {likes?.map(({ userId }) => (
        <UsersListItem
          key={userId._id.toString()}
          _id={userId._id.toString()}
          name={userId.name}
          bio={userId.bio}
          developer={userId.tags?.developer}
          verified={userId.tags?.verified}
          followed={userId.followed}
          image={userId.image}
        />
      ))}
    </Dialog>
  );
};
