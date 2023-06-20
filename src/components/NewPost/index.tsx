import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  IconButton,
  Popper,
  useMediaQuery,
  useTheme,
} from '@mui/material';

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
import GifOutlinedIcon from '@mui/icons-material/GifOutlined';
import { Theme } from 'emoji-picker-react';
import dynamic from 'next/dynamic';
import { TextRemaining } from './TextRemaining';
import Gif from '../Gif';
import { useRouter } from 'next/router';
import Link from '../common/Link';
import { getImageUrl } from '~/utils/getImageUrl';
import { uploadImage } from '~/utils';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
});

const NewPost: FC = () => {
  const router = useRouter();
  const profileId = router.query.id as string | undefined;
  const utils = trpc.useContext();
  const fileInputRef = useRef<null | HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const theme = useTheme();
  const maxInputSize = 280;
  const user = trpc.user.getUser.useQuery();
  const [imageUploadProgress, setImageUploadProgress] = useState<
    number | undefined
  >();
  const [selectedGifUrl, setSelectedGifUrl] = useState<undefined | string>(
    undefined,
  );
  const matchesSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [gifModalOpen, setGifModalOpen] = useState(false);

  const resetFileInput = () => {
    setFileInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectGifUrl = (url: string) => {
    setGifModalOpen(false);
    setSelectedGifUrl(url);
    resetFileInput();
  };

  const [posting, setPosting] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  // const [imageUploadError, setImageUploadError] = useState<
  //   string | undefined
  // >();
  const [fileInput, setFileInput] = useState<File | null>(null);

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
  useEffect(() => {
    if (prevOpen.current === true && emojiPickerOpen === false) {
      anchorRef.current?.focus();
    }

    prevOpen.current = emojiPickerOpen;
  }, [emojiPickerOpen]);

  const createPost = trpc.post.create.useMutation({
    onSuccess(data) {
      utils.post.getAll.setInfiniteData(
        {
          //TODO: update following only
          followingOnly: false,
          profileId,
        },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [{ posts: [], nextCursor: null }],
              pageParams: [],
            };
          }
          const newPage = {
            posts: [data.post],
            nextCursor: {
              createdAt: data.post.createdAt,
              _id: data.post._id.toString(),
              exclude: true,
            },
          };
          const newPages = [newPage, ...oldData.pages];
          return { pages: newPages, pageParams: oldData.pageParams };
        },
      );
    },
  });

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setFileInput(file);
      setSelectedGifUrl(undefined);
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
      const result = await uploadImage(fileInput, 'post');
      if (result) {
        imageId = result;
      }
    }
    const text = input;
    createPost
      .mutateAsync({ content: text, imageId, gifUrl: selectedGifUrl })
      .then(() => {
        setInput('');
        setImageUploadProgress(undefined);
        setPosting(false);
        setSelectedGifUrl(undefined);
        resetFileInput();
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
        p={2}
        pb={0.5}
        borderBottom="1px solid rgb(56, 68, 77)"
        sx={{
          borderLeft: {
            md: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            md: '1px solid rgb(56, 68, 77)',
          },
        }}
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        position="relative"
      >
        <ProgressBar progress={imageUploadProgress} />
        {!!user.data?.image && (
          <Link
            href={`/${user.data._id.toString()}`}
            flexShrink={0}
            flexBasis="8%"
            sx={{
              '& img': {
                opacity: posting ? 0.5 : 1,
              },
              [theme.breakpoints.down('md')]: {
                flexBasis: '20%',
              },
              pr: 2,
            }}
          >
            <Avatar src={getImageUrl(user.data.image)} alt={user.data.name} />
          </Link>
        )}
        <Box flexGrow={1}>
          <Box
            sx={{
              opacity: posting ? 0.5 : 1,
            }}
          >
            <TextInput
              maxInputSize={maxInputSize}
              input={input}
              setInput={setInput}
            />
            {!!fileInput && (
              <Box
                sx={{
                  '& img': {
                    maxWidth: '100%',
                    display: 'block',
                    marginBottom: posting ? 2 : 0,
                    borderRadius: 5,
                    maxHeight: 400,
                  },
                  maxWidth: '100%',
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
                  onClick={resetFileInput}
                >
                  <CloseRoundedIcon />
                </Box>
                <img src={URL.createObjectURL(fileInput)} />
              </Box>
            )}
            {!!selectedGifUrl && (
              <Box
                sx={{
                  '& img': {
                    display: 'block',
                    marginBottom: posting ? 2 : 0,
                    borderRadius: 5,
                    maxHeight: 400,
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
                  onClick={() => setSelectedGifUrl(undefined)}
                >
                  <CloseRoundedIcon />
                </Box>
                <img src={selectedGifUrl} />
              </Box>
            )}
          </Box>
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
                disabled={posting}
                onClick={(e) => {
                  if (posting) {
                    return;
                  }
                  document.getElementById('file-input-button')?.click();
                  e.preventDefault();
                }}
              >
                <ImageOutlinedIcon
                  sx={{
                    width: '90%',
                    opacity: posting ? 0.2 : 1,
                    fill: (theme) => theme.palette.primary.dark,
                  }}
                />
              </IconButton>
              <input
                accept="image/*"
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                id="file-input-button"
                disabled={posting}
                onChange={handleFileChange}
              />
            </label>
            <IconButton
              type="button"
              size="small"
              aria-haspopup="true"
              aria-expanded={emojiPickerOpen ? 'true' : undefined}
              ref={anchorRef}
              disabled={posting}
              onClick={() => {
                setEmojiPickerOpen(true);
              }}
              aria-describedby="emoji-popper"
            >
              <SentimentSatisfiedOutlinedIcon
                sx={{
                  width: '90%',
                  opacity: posting ? 0.2 : 1,

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
            <IconButton
              type="button"
              size="small"
              aria-haspopup="true"
              onClick={() => setGifModalOpen(true)}
              aria-describedby="gif-popper"
              disabled={posting}
            >
              <GifOutlinedIcon
                aria-describedby="gif-popper"
                sx={{
                  width: '100%',
                  opacity: posting ? 0.2 : 1,

                  fill: (theme) => theme.palette.primary.dark,
                }}
              />
            </IconButton>
            <Dialog
              maxWidth="sm"
              fullWidth
              fullScreen={!!matchesSmallScreen}
              open={gifModalOpen}
              onClose={() => setGifModalOpen(false)}
            >
              <Gif
                handleSelectGifUrl={handleSelectGifUrl}
                handleModalClose={() => setGifModalOpen(false)}
              />
            </Dialog>

            <Box marginLeft="auto" display="flex" alignItems="center">
              {!!input.length && (
                <>
                  <Box mr={1.5}>
                    <TextRemaining
                      percent={(input.length / maxInputSize) * 100}
                    />
                  </Box>
                  <Box
                    width={0}
                    borderRight="1px solid rgb(56, 68, 77)"
                    alignSelf="stretch"
                    mr={2}
                  />
                </>
              )}
              <Button
                size="small"
                variant="contained"
                data-cy="submit-post-button"
                type="submit"
                disabled={createPost.isLoading || !input.length}
              >
                Post
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NewPost;
