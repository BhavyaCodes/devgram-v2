import { Button, Typography } from '@mui/material';
import { trpc } from '~/utils/trpc';
import { AddComment } from './AddComment';
import DeleteIcon from '@mui/icons-material/Delete';
import { CommentListInfinite } from './CommentListInfinite';
interface PostBoxProps {
  /**
   * postId
   */
  _id: string;
  /**
   * name of post author
   */
  name: string;
  /**
   * image of post author
   */
  image?: string;
  /**
   * _id of author
   */
  userId: string;
  content: string;
  likeCount: number;
  commentCount: number;
  /**
   * Logged in user has liked the post
   */
  hasLiked?: boolean | null;
}

export const PostBox = ({
  _id,
  userId,
  name,
  image,
  content,
  likeCount,
  commentCount,
  hasLiked,
}: PostBoxProps) => {
  const utils = trpc.useContext();

  const likeMutation = trpc.post.likePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.map((post) => {
            if (post._id.toString() === variables) {
              return {
                ...post,
                hasLiked: true,
                likeCount: post.likeCount + 1,
              };
            }
            return post;
          });
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });
  const unlikeMutation = trpc.post.unlikePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.map((post) => {
            if (post._id.toString() === variables) {
              return {
                ...post,
                hasLiked: undefined,
                likeCount: post.likeCount - 1,
              };
            }
            return post;
          });
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.filter(
            (post) => post._id.toString() !== variables,
          );
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });

  const getUser = trpc.user.getUser.useQuery(undefined, {
    retry: false,
    onError: ({ data }) => {
      if (data?.code === 'UNAUTHORIZED') {
        console.log('not logged in');
      }
    },
  });

  return (
    <div style={{ border: '1px solid #222222' }}>
      <p>{name}</p>
      <img src={image?.split('=')[0]} style={{ maxHeight: 100 }} />
      <p data-cy="post-content">{content}</p>
      {getUser.data?._id?.toString() === userId ? (
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          type="button"
          onClick={() => {
            deletePostMutation.mutate(_id);
          }}
        >
          Delete Post
        </Button>
      ) : null}
      <Typography>Like Count: {likeCount}</Typography>
      {hasLiked ? (
        <>
          <Typography variant="subtitle1">You liked this</Typography>
          <Button
            type="button"
            color="error"
            onClick={() => unlikeMutation.mutate(_id)}
            disabled={unlikeMutation.isLoading}
          >
            Unlike This Post
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={() => likeMutation.mutate(_id)}
          disabled={likeMutation.isLoading}
        >
          Like This Post
        </Button>
      )}
      <AddComment postId={_id} />
      <Typography>Comment count: {commentCount}</Typography>
      {/* <CommentList postId={_id} /> */}
      <CommentListInfinite postId={_id} />
    </div>
  );
};
