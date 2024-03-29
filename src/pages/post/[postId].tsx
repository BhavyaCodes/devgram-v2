import Head from 'next/head';
import { useRouter } from 'next/router';
import { SinglePost } from '~/components/SinglePost';
import { getImageUrl } from '~/utils/getImageUrl';
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
    <>
      <Head>
        <meta property="og:site_name" content="DevGram" />
        <meta name="title" key="title" content={post.userId.name} />
        <meta property="og:title" key="og:title" content={post.userId.name} />
        <meta
          property="twitter:title"
          key="twitter:title"
          content={post.userId.name}
        />

        <meta
          key="description"
          name="description"
          content={
            post.content ||
            'Log into DevGram to start sharing and connecting with your friends, family, and people you know.'
          }
        />
        <meta
          key="twitter:description"
          property="twitter:description"
          content={post.content}
        />
        <meta
          key="og:description"
          property="og:description"
          content={post.content}
        />
        {post.imageId && (
          <>
            <meta property="og:image" content={getImageUrl(post.imageId)} />
            <meta
              key="twitter:image"
              property="twitter:image"
              content={getImageUrl(post.imageId)}
            />
          </>
        )}

        {post.gifUrl && (
          <>
            <meta property="og:image:type" content="image/gif" />
            <meta property="og:image" content={post.gifUrl} />
            <meta
              key="twitter:image"
              property="twitter:image"
              content={post.gifUrl}
            />
          </>
        )}
      </Head>
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
    </>
  );
};

export default SinglePostPage;
