import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useRef,
  useState,
} from 'react';
import { trpc } from '~/utils/trpc';
import { TextInput } from './PostList/TextInput';
import { ImageOutlined } from '@mui/icons-material';

const NewPost: FC = () => {
  const utils = trpc.useContext();
  const inputRef = useRef<null | HTMLInputElement>(null);
  const [input, setInput] = useState('');

  const user = trpc.user.getUser.useQuery();

  const [imageUploadError, setImageUploadError] = useState<
    string | undefined
  >();
  const [fileInput, setFileInput] = useState<File | undefined>();

  const createPost = trpc.post.create.useMutation({
    onSuccess(data) {
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPage = {
          posts: [data.post],
        };

        const newPages = [newPage, ...oldData.pages];

        return { pages: newPages, pageParams: oldData.pageParams };
      });

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
  });

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileInput(file);
    }
  };
  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (createPost.isLoading) {
      return;
    }
    if (!inputRef.current) {
      return;
    }

    let imageId: string | undefined;

    if (fileInput) {
      const { signature, timestamp } = (await axios.get('/api/upload-image'))
        .data;

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;

      const uploadEndpoint =
        'https://api.cloudinary.com/v1_1/' + cloudName + '/image/upload';

      const formData = new FormData();

      formData.append('file', fileInput);
      formData.append(
        'api_key',
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string,
      );
      formData.append('signature', signature);
      formData.append(
        'folder',
        process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER as string,
      );
      formData.append('timestamp', timestamp.toString());
      formData.append('transformation', 'c_scale,h_100');

      await axios
        .post(uploadEndpoint, formData)
        .then((res) => {
          imageId = res.data.public_id as string;
        })
        .catch((err) => {
          setImageUploadError('Error uploading image, please try again');
          console.log(err);
        });
    }
    const text = inputRef.current.value;
    createPost.mutate({ content: text, imageId });
  };
  return (
    <>
      <Box
        sx={{
          border: '1px solid rgb(56, 68, 77)',
          p: 2,
          pb: 0.5,
        }}
        component="form"
        onSubmit={handleSubmit}
        display="flex"
      >
        {!!user.data?.image && (
          <Box
            flexBasis="8%"
            sx={{
              '& img': {
                width: '100%',
                borderRadius: 200,
              },
              pr: 2,
            }}
          >
            <img src={user.data.image} alt={`${user.data.name} avatar`} />
          </Box>
        )}
        {/* <Box flexGrow={1}>
          <TextInput input={input} setInput={setInput} />
          {!!fileInput && (
            <Box
              sx={{
                '& img': {
                  width: '100%',
                  display: 'block',
                },
                overflow: 'hidden',
                borderRadius: 5,
                mt: 2,
              }}
            >
              <img src={URL.createObjectURL(fileInput)} />
            </Box>
          )}
          <Box borderTop="1px solid rgb(56, 68, 77)" mt={3} display="flex">
            <label htmlFor="file-input-button">
              <IconButton
                size="small"
                type="button"
                // onClick={(e) => {
                //   document.getElementById('file-input-button')?.click();
                //   e.preventDefault();
                //   // console.log(e);
                //   // e.persist();
                // }}
              >
                <ImageOutlined color="primary" sx={{ width: '90%' }} />
              </IconButton>
              <input
                type="file"
                style={{ display: 'none' }}
                id="file-input-button"
                placeholder="asdfasdf"
                onChange={handleFileChange}
              />
            </label>
          </Box>
        </Box> */}
        <>
          <TextField
            inputRef={inputRef}
            type="text"
            required
            disabled={createPost.isLoading}
            inputProps={{
              'data-cy': 'post-input',
            }}
          />
          <input type="file" onChange={handleFileChange} />
          <Typography color="red">{imageUploadError}</Typography>
          <Button
            variant="contained"
            data-cy="submit-post-button"
            type="submit"
            disabled={createPost.isLoading}
          >
            Submit
          </Button>
        </>
      </Box>
    </>
  );
};

export default NewPost;
