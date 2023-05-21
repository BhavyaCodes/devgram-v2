import { NextPage } from 'next';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import axios from 'axios';
// import { useDebounce } from '~/assets/hooks/useDebounce';
import { useDebounce } from '~/hooks';
import { GifObject } from '~/components/Gif';
import { Tile } from '~/components/Gif/Tile';
import { getRandomColor } from '~/utils/getRandomColor';
import { useInView } from 'react-intersection-observer';

const Gif: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState('hi');

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  // console.log(debouncedSearchTerm);

  const [imageUrl, setImageUrl] = useState<null | string>(null);
  return (
    <div>
      <TextField
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.currentTarget.value);
        }}
      />
      {imageUrl && <img src={imageUrl} />}
      <h2>Search Result</h2>

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
  // const infiniteRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const api_key = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;
  const limit = 10;

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // const decouncedInView = useDebounce(inView, 4000);
  // console.log(decouncedInView);
  useEffect(() => {
    setLoading(true);
    axios
      .get<{ data: { images: { downsized: GifObject } }[] }>(
        'https://api.giphy.com/v1/gifs/search',
        {
          params: {
            api_key,
            limit,
            offset: offset * limit,
            q: searchTerm,
          },
        },
      )
      .then((res) => {
        setLoading(false);
        const newData = res.data.data.map((gif) => gif.images.downsized);
        setGifUrls((prev) => [...prev, ...newData]);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
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
      <Masonry columns={4} spacing={2}>
        {gifUrls.map((gifObj, index) => (
          <Tile
            gifObj={gifObj}
            key={gifObj.url + index}
            bgcolor={getRandomColor()}
          />
        ))}
      </Masonry>
      <Box ref={ref} bgcolor="red" height={50} />
      <Button onClick={() => setOffset((s) => s + 1)}>Load More</Button>
    </>
  );
};

const MyGifGrid = () => {
  const [offset, setOffset] = useState(0);
  const [gifUrls, setGifUrls] = useState<GifObject[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const api_key = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;

  const limit = 10;
  useEffect(() => {
    axios
      .get<{ data: { images: { downsized: GifObject } }[] }>(
        'https://api.giphy.com/v1/gifs/trending',
        {
          params: {
            api_key,
            limit,
            offset: offset * limit,
          },
        },
      )
      .then((res) => {
        const newData = res.data.data.map((gif) => gif.images.downsized);
        setGifUrls((prev) => [...prev, ...newData]);
      })
      .catch((err) => console.log(err));
  }, [offset]);

  // console.log(gifUrls);

  return (
    <>
      <Masonry columns={4} spacing={2}>
        {gifUrls.map((gifObj, index) => (
          <Box
            key={gifObj.url + index}
            sx={{
              '& img': {
                width: '100%',
                display: 'block',
                aspectRatio: (gifObj.width / gifObj.height).toString(),
              },
            }}
          >
            <img src={gifObj.url} />
          </Box>
        ))}
      </Masonry>
      <Button onClick={() => setOffset((s) => s + 1)}>Load More</Button>
    </>
  );
};
