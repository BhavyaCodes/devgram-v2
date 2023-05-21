import { Box } from '@mui/material';
import { GifObject } from '.';
import { memo, useState } from 'react';

export const Tile = memo(
  function Tile({ gifObj, bgcolor }: { gifObj: GifObject; bgcolor: string }) {
    const [hasLoaded, setHasLoaded] = useState(false);

    return (
      <Box
        sx={{
          '& img': {
            ...(!hasLoaded ? { visibility: 'hidden' } : {}),
            width: '100%',
            display: 'block',
            aspectRatio: (gifObj.width / gifObj.height).toString(),
          },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: bgcolor,
          // ...(!hasLoaded ? { visibility: 'hidden' } : {}),
        }}
      >
        <img src={gifObj.url} onLoad={() => setHasLoaded(true)} />
      </Box>
    );
  },
  (prevProps, newProps) => prevProps.gifObj.url === newProps.gifObj.url,
);
