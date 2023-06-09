import { useRouter } from 'next/router';
import { SinglePost } from '~/components/SinglePost';
import { trpc } from '~/utils/trpc';

const SinglePostPage = () => {
  const router = useRouter();
  const postId = router.query.postId as string;

  const { data } = trpc.post.getPostById.useQuery({ postId });

  const post = data?.post;

  if (!post) {
    return null;
  }

  return (
    <SinglePost
      _id={post._id.toString()}
      commentCount={post.commentCount}
      content={post.content}
      createdAt={post.createdAt}
      likeCount={post.likeCount}
      name={post.userId.name}
      developer={post.userId.tags?.developer}
      userId={post.userId._id.toString()}
      gifUrl={post.gifUrl}
      image={post.userId.image}
      imageId={post.imageId}
      hasLiked={post.hasLiked}
      verified={post.userId.tags?.verified}
    />
  );
};

export default SinglePostPage;
