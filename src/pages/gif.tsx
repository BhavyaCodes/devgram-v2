import { NextPage } from 'next';
import React, { useState } from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';

const Gif: NextPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY!;

  const gf = new GiphyFetch(apiKey);

  const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 });
  const [imageUrl, setImageUrl] = useState<null | string>(null);
  return (
    <div>
      {imageUrl && <img src={imageUrl} />}
      <Grid
        width={800}
        columns={3}
        fetchGifs={fetchGifs}
        onGifClick={(gif, e) => {
          e.preventDefault();
          console.log(gif);
          if (gif.id) {
            setImageUrl(gif.images.downsized.url);
          }
        }}
      />
    </div>
  );
};

export default Gif;
