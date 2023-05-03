import React, { FC, useRef } from 'react';
import { trpc } from '~/utils/trpc';

const NewPost: FC = () => {
  const createPost = trpc.post.create.useMutation({});
  const inputRef = useRef<null | HTMLInputElement>(null);
  const handleClick = () => {
    if (!inputRef.current) {
      console.log('there');
      return;
    }
    const text = inputRef.current.value;
    console.log(text);
    createPost.mutate(text);
  };
  return (
    <div>
      <h3>NewPost Component</h3>
      <input ref={inputRef} type="text" required />
      <button onClick={handleClick}>Submit</button>
    </div>
  );
};

export default NewPost;
