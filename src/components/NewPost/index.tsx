import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Popper,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import React, {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { trpc } from '~/utils/trpc';
import { TextInput } from './TextInput';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { ProgressBar } from './ProgressBar';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import { Theme } from 'emoji-picker-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

const NewPost: FC = () => {
  const utils = trpc.useContext();
  const inputRef = useRef<null | HTMLInputElement>(null);
  const [input, setInput] = useState('');
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  const user = trpc.user.getUser.useQuery();
  const [imageUploadProgress, setImageUploadProgress] = useState<
    number | undefined
  >();
  const [posting, setPosting] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<
    string | undefined
  >();
  const [fileInput, setFileInput] = useState<File | undefined>();

  const handleEmojiClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setEmojiPickerOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(emojiPickerOpen);
  React.useEffect(() => {
    if (prevOpen.current === true && emojiPickerOpen === false) {
      anchorRef.current?.focus();
    }

    prevOpen.current = emojiPickerOpen;
  }, [emojiPickerOpen]);

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
    if (posting) {
      return;
    }
    setPosting(true);

    e.preventDefault();
    if (createPost.isLoading) {
      return;
    }
    if (!input) {
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
        .post(uploadEndpoint, formData, {
          onUploadProgress: (e) => {
            setImageUploadProgress(e.progress);
            console.log(e.progress);
          },
        })
        .then((res) => {
          imageId = res.data.public_id as string;
        })
        .catch((err) => {
          setImageUploadError('Error uploading image, please try again');
          console.log(err);
        });
    }
    const text = input;
    createPost
      .mutateAsync({ content: text, imageId })
      .then(() => {
        setInput('');
        setFileInput(undefined);
        setImageUploadProgress(undefined);
        setPosting(false);
      })
      .catch((err) => {
        console.log(err);
        setImageUploadProgress(undefined);
        setPosting(false);
      });
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
        position="relative"
      >
        <ProgressBar progress={imageUploadProgress} />
        {!!user.data?.image && (
          <Box
            flexBasis="8%"
            sx={{
              '& img': {
                width: '100%',
                borderRadius: 200,
                opacity: posting ? 0.5 : 1,
              },
              pr: 2,
            }}
          >
            <img src={user.data.image} alt={`${user.data.name} avatar`} />
          </Box>
        )}
        <Box flexGrow={1}>
          <Box
            sx={{
              opacity: posting ? 0.5 : 1,
            }}
          >
            <TextInput input={input} setInput={setInput} />
            {!!fileInput && (
              <Box
                sx={{
                  '& img': {
                    width: '100%',
                    display: 'block',
                    marginBottom: posting ? 2 : 0,
                    borderRadius: 5,
                  },
                  overflow: 'hidden',
                  mt: 2,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    cursor: 'pointer',
                    display: posting ? 'none' : 'flex',

                    '&:hover': {
                      bgcolor: 'rgba(15,20,25,0.9)',
                    },
                  }}
                  position="absolute"
                  height={36}
                  width={36}
                  bgcolor="rgba(15,20,25,0.75)"
                  left={6}
                  top={6}
                  borderRadius={200}
                  alignItems="center"
                  justifyContent="center"
                  onClick={() => setFileInput(undefined)}
                >
                  <CloseRoundedIcon />
                </Box>
                <img src={URL.createObjectURL(fileInput)} />
              </Box>
            )}
          </Box>
          {!posting && (
            <Box
              borderTop="1px solid rgb(56, 68, 77)"
              mt={3}
              pt={1}
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
            >
              <label htmlFor="file-input-button">
                <IconButton
                  size="small"
                  type="button"
                  onClick={(e) => {
                    document.getElementById('file-input-button')?.click();
                    e.preventDefault();
                    // console.log(e);
                    // e.persist();
                  }}
                >
                  <ImageOutlinedIcon
                    sx={{
                      width: '90%',
                      fill: (theme) => theme.palette.primary.dark,
                    }}
                  />
                </IconButton>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  id="file-input-button"
                  placeholder="asdfasdf"
                  onChange={handleFileChange}
                />
              </label>
              <IconButton
                type="button"
                size="small"
                aria-haspopup="true"
                aria-expanded={emojiPickerOpen ? 'true' : undefined}
                ref={anchorRef}
                onClick={() => {
                  setEmojiPickerOpen(true);
                  // setAnchorEl(e.currentTarget);
                }}
                aria-describedby="emoji-popper"
              >
                <SentimentSatisfiedOutlinedIcon
                  sx={{
                    width: '90%',
                    fill: (theme) => theme.palette.primary.dark,
                  }}
                />
              </IconButton>
              <ClickAwayListener onClickAway={handleEmojiClose}>
                <Popper
                  open={!!anchorRef.current && emojiPickerOpen}
                  id="emoji-popper"
                  anchorEl={anchorRef.current}
                >
                  <Box width={350}>
                    <EmojiPicker
                      searchDisabled
                      onEmojiClick={(data) =>
                        setInput((input) => input + data.emoji)
                      }
                      theme={theme.palette.mode as Theme}
                      skinTonesDisabled
                      width={350}
                    />
                  </Box>
                </Popper>
              </ClickAwayListener>

              <Box marginLeft="auto">
                <Button
                  size="small"
                  variant="contained"
                  data-cy="submit-post-button"
                  type="submit"
                  disabled={createPost.isLoading}
                >
                  Post
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <>
          {/* <TextField
            inputRef={inputRef}
            type="text"
            required
            disabled={createPost.isLoading}
            inputProps={{
              'data-cy': 'post-input',
            }}
          /> */}
          {/* <input type="file" onChange={handleFileChange} /> */}
          {/* <Typography color="red">{imageUploadError}</Typography> */}
        </>
      </Box>
    </>
  );
};

export default NewPost;
