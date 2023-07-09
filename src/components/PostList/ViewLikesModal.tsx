import { Dialog, DialogContent, DialogTitle } from '@mui/material';
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
  const getUserQuery = trpc.user.getUser.useQuery(undefined, {
    staleTime: 2000,
  });

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

  const likes = viewLikesQuery.data?.pages.flatMap((page) => page.likes);

  return (
    <Dialog onClose={onClose} open={!!postId} fullWidth maxWidth="sm">
      <DialogTitle>Users who liked this post</DialogTitle>
      {likes?.length === 0 && (
        <DialogContent>No one likes this post 🥲</DialogContent>
      )}
      {postId &&
        likes?.map(({ userId }) => (
          <UsersListItem
            key={userId._id.toString()}
            _id={userId._id.toString()}
            name={userId.name}
            bio={userId.bio}
            developer={userId.tags?.developer}
            verified={userId.tags?.verified}
            followed={userId.followed}
            image={userId.image}
            type="like"
            postId={postId}
            profileId={undefined}
            hideFollowButton={
              userId._id.toString() === getUserQuery.data?._id.toString()
            }
          />
        ))}
    </Dialog>
  );
};
