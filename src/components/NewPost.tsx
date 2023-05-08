import { Button, TextField } from '@mui/material';
import React, { FC, FormEventHandler, useRef } from 'react';
import { trpc } from '~/utils/trpc';

const NewPost: FC = () => {
  const utils = trpc.useContext();

  const createPost = trpc.post.create.useMutation({
    onSuccess() {
      utils.post.getAll.invalidate();
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
  });
  const inputRef = useRef<null | HTMLInputElement>(null);
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (createPost.isLoading) {
      return;
    }
    if (!inputRef.current) {
      console.log('there');
      return;
    }
    const text = inputRef.current.value;
    console.log(text);
    createPost.mutate(text);
  };
  return (
    <form onSubmit={handleSubmit}>
      <h3>NewPost Component</h3>
      <TextField
        inputRef={inputRef}
        type="text"
        required
        disabled={createPost.isLoading}
        inputProps={{
          'data-cy': 'post-input',
        }}
      />
      <Button
        variant="contained"
        data-cy="submit-post-button"
        type="submit"
        disabled={createPost.isLoading}
      >
        Submit
      </Button>
    </form>
  );
};

export default NewPost;
