import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import axios from 'axios';

const Gif: NextPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [searchTerm, setSearchTerm] = useState('hi');

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
      <MyGifGrid />
    </div>
  );
};

export default Gif;

// const GridComponent = () => (
//   <Grid
//     width={800}
//     columns={3}
//     fetchGifs={fetchGifs}
//     onGifClick={(gif, e) => {
//       e.preventDefault();
//       console.log(gif);

//       // if (gif.id) {
//       //   setImageUrl(gif.images.downsized.url);
//       // }
//     }}
//   />
// );

interface GifObject {
  url: string;
  height: number;
  width: number;
  size?: string;
}

const MyGifGrid = () => {
  const [offset, setOffset] = useState(0);
  const [gifUrls, setGifUrls] = useState<GifObject[]>([]);

  const api_key = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;

  // const gf = new GiphyFetch(apiKey);

  // const fetchTrendingGifs = (offset: number) =>
  //   gf.trending({ offset, limit: 10 });
  const limit = 2;
  useEffect(() => {
    console.log(offset);

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
    // fetchTrendingGifs(offset).then((value) => {
    //   const urls = value.data.map((gif) => gif.images.downsized);
    //   setGifUrls((prev) => [...prev, ...urls]);
    //   console.log(value);
    // });
  }, [offset]);

  console.log(gifUrls);

  return (
    <>
      <Masonry columns={4} spacing={2}>
        {gifUrls.map((gifObj) => (
          <Box
            key={gifObj.url}
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
