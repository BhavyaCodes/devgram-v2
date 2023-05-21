import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import axios from 'axios';
import { useDebounce } from '~/hooks';
import { GifObject } from '~/components/Gif';
import { Tile } from '~/components/Gif/Tile';
import { getRandomColor } from '~/utils/getRandomColor';
import { useInView } from 'react-intersection-observer';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const Gif: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  return (
    <div>
      <TextField
        sx={{ mb: 2, pr: 1 }}
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

      {searchTerm ? (
        <MySearchGifGrid searchTerm={debouncedSearchTerm} />
      ) : (
        <MyGifGrid />
      )}
    </div>
  );
};

export default Gif;

const MySearchGifGrid = ({ searchTerm }: { searchTerm: string }) => {
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

  console.log(totalCount);
  console.log(gifUrls.length);

  return (
    <>
      <Masonry columns={3} spacing={1}>
        {gifUrls.map((gifObj, index) => (
          <Tile
            gifObj={gifObj}
            key={gifObj.url + index}
            bgcolor={getRandomColor()}
          />
        ))}
      </Masonry>
      {totalCount > gifUrls.length && (
        <Box ref={ref} py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

const MyGifGrid = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  useEffect(() => {
    if (!loading && inView) {
      setOffset((s) => s + 1);
    }
  }, [inView, loading]);

  return (
    <>
      <Masonry columns={3} spacing={2}>
        {gifUrls.map((gifObj, index) => (
          <Tile
            gifObj={gifObj}
            key={gifObj.url + index}
            bgcolor={getRandomColor()}
          />
        ))}
      </Masonry>
      {totalCount > gifUrls.length && (
        <Box ref={ref} py={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </>
  );
};
