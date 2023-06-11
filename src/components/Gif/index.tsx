import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import axios from 'axios';
import { useDebounce } from '~/hooks';
import { Tile } from './Tile';
import { getRandomColor } from '~/utils/getRandomColor';
import { useInView } from 'react-intersection-observer';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export interface GifObject {
  url: string;
  height: number;
  width: number;
  size?: string;
}

const Gif: FC<{
  handleSelectGifUrl: (url: string) => void;
  handleModalClose: () => void;
}> = ({ handleSelectGifUrl, handleModalClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  return (
    <Box display="flex" alignItems="stretch">
      <Box
        flexGrow={1}
        px={2}
        // sx={{ height: '100%' }}

        // minHeight="calc(100vh - 64px)"
        bgcolor="#111"
        // sx={{ bgcolor: (theme) => theme.components?.MuiDialog?.styleOverrides }}
      >
        <Box
          pt={2}
          display="flex"
          alignItems="center"
          pb={2}
          pr={1}
          position="sticky"
          top={0}
          bgcolor="inherit"
        >
          <IconButton
            sx={{ flexShrink: 0, mr: 1 }}
            type="button"
            onClick={handleModalClose}
          >
            <CloseRoundedIcon />
          </IconButton>
          <TextField
            fullWidth
            value={searchTerm}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchRoundedIcon
                    sx={{
                      fill: '#71767B',
                    }}
                  />
                </InputAdornment>
              ),
            }}
            placeholder="Powered by GIPHY"
            onChange={(e) => {
              setSearchTerm(e.currentTarget.value);
            }}
          />
        </Box>

        <Box minHeight={500}>
          {searchTerm ? (
            <MySearchGifGrid
              searchTerm={debouncedSearchTerm}
              handleSelectGifUrl={handleSelectGifUrl}
            />
          ) : (
            <MyGifGrid handleSelectGifUrl={handleSelectGifUrl} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Gif;

const MySearchGifGrid = ({
  searchTerm,
  handleSelectGifUrl,
}: {
  searchTerm: string;

  handleSelectGifUrl: (url: string) => void;
}) => {
  const [offset, setOffset] = useState(0);
  const [gifUrls, setGifUrls] = useState<GifObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(Infinity);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const api_key = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;
  const limit = 10;

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    setLoading(true);

    const controller = new AbortController();

    axios
      .get<{
        data: {
          images: { downsized: GifObject };
        }[];
        pagination: { total_count: number };
      }>('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key,
          limit,
          offset: offset * limit,
          q: searchTerm,
        },
        signal: controller.signal,
      })
      .then((res) => {
        setTotalCount(res.data.pagination.total_count);
        setLoading(false);
        const newData = res.data.data.map((gif) => gif.images.downsized);
        setGifUrls((prev) => [...prev, ...newData]);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, searchTerm]);

  useEffect(() => {
    if (!loading && inView) {
      setOffset((s) => s + 1);
    }
  }, [inView, loading]);

  useEffect(() => {
    setOffset(0);
    setGifUrls([]);
  }, [searchTerm]);

  return (
    <>
      <Masonry columns={3} spacing={1}>
        {gifUrls.map((gifObj, index) => {
          if (gifObj.url) {
            return (
              <Tile
                handleSelectGifUrl={handleSelectGifUrl}
                gifObj={gifObj}
                key={gifObj.url + index}
                bgcolor={getRandomColor()}
              />
            );
          } else {
            return null;
          }
        })}
      </Masonry>
      {totalCount > gifUrls.length && (
        <Box ref={ref} py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

const MyGifGrid = ({
  handleSelectGifUrl,
}: {
  handleSelectGifUrl: (url: string) => void;
}) => {
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(Infinity);
  const [gifUrls, setGifUrls] = useState<GifObject[]>([]);
  const [loading, setLoading] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const api_key = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;

  const limit = 10;
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    axios
      .get<{
        data: {
          images: { downsized: GifObject };
        }[];
        pagination: { total_count: number };
      }>('https://api.giphy.com/v1/gifs/trending', {
        params: {
          api_key,
          limit,
          offset: offset * limit,
        },
        signal: controller.signal,
      })
      .then((res) => {
        setTotalCount(res.data.pagination.total_count);
        setLoading(false);
        const newData = res.data.data.map((gif) => gif.images.downsized);
        setGifUrls((prev) => [...prev, ...newData]);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  useEffect(() => {
    if (!loading && inView) {
      setOffset((s) => s + 1);
    }
  }, [inView, loading]);

  return (
    <>
      <Masonry columns={3} spacing={1}>
        {gifUrls.map((gifObj, index) => {
          if (gifObj.url) {
            return (
              <Tile
                handleSelectGifUrl={handleSelectGifUrl}
                gifObj={gifObj}
                key={gifObj.url + index}
                bgcolor={getRandomColor()}
              />
            );
          } else {
            return null;
          }
        })}
      </Masonry>
      {totalCount > gifUrls.length && (
        <Box ref={ref} py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </>
  );
};
