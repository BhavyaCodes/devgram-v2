import { Button, TextField } from '@mui/material';
import React, { FC, useRef } from 'react';
import { trpc } from '~/utils/trpc';

const NewPost: FC = () => {
  const utils = trpc.useContext();

  const createPost = trpc.post.create.useMutation({
    onSuccess() {
      utils.post.getAll.invalidate();
    },
  });
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
      <TextField inputRef={inputRef} type="text" required />
      <Button variant="contained" onClick={handleClick}>
        Submit
      </Button>
    </div>
  );
};

export default NewPost;
