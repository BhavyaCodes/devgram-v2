import { Box, Button, TextField, Typography } from '@mui/material';
import { FormEventHandler, useEffect, useState } from 'react';
import { trpc } from '~/utils/trpc';

const EditProfile = () => {
  const [name, setName] = useState('');
  const getUser = trpc.user.getUser.useQuery();
  const editUser = trpc.user.editProfile.useMutation();

  useEffect(() => {
    if (getUser.data?.name) {
      setName(getUser.data.name);
    }
  }, [getUser.data?.name]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    editUser.mutate({ name });
  };

  if (getUser.isLoading) {
    return <div>Loading</div>;
  }

  if (!getUser.data) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h2" component="h1">
        Edit Profile
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="name"
          value={name || ''}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <Button type="submit">Save</Button>
      </Box>
    </Box>
  );
};

export default EditProfile;
