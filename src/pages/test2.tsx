import { Box, Typography, useScrollTrigger } from '@mui/material';
import { NextPage } from 'next';
import React from 'react';

const Test: NextPage = () => {
  const trigger = useScrollTrigger({
    threshold: 30,
  });

  return (
    <>
      <Box
        component="header"
        position="sticky"
        top={0}
        sx={{
          height: 100,
          background: 'linear-gradient(orange, lime)',
          transition: (theme) => theme.transitions.create('top'),
          top: trigger ? -51.5 : -1.5,
        }}
        display="flex"
        flexDirection="column"
      >
        <Typography>hi</Typography>
        <Box
          mt="auto"
          height={50}
          zIndex={10000}
          // position="sticky"
          sx={{
            background: 'linear-gradient(#e66465, #9198e5)',
            // top: trigger ? -1.5 : 50,
            // transition: (theme) => theme.transitions.create('top'),
          }}
        >
          Bottom
        </Box>
      </Box>

      <Box bgcolor="rgba(200,0,0,0.2)" height={10000}>
        Test Test Test Test Test Test Test Test Test Test Test Lorem ipsum dolor
        sit amet, consectetur adipisicing elit. Dolor vitae vel neque voluptas
        deleniti? Facilis, itaque, dicta, ut aut accusamus facere quaerat
        commodi ratione laudantium veritatis debitis praesentium atque eos.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero itaque
        officiis, eum delectus molestiae alias eaque quod quis ullam omnis enim
        incidunt modi dolorem quos mollitia ipsam quia maiores autem! Lorem
        ipsum dolor sit amet consectetur adipisicing elit. Numquam, blanditiis
        officia praesentium quas aperiam quisquam at beatae doloribus incidunt!
        Cupiditate sapiente assumenda provident impedit, aliquid saepe.
        Dignissimos officiis reiciendis delectus.
      </Box>
    </>
  );
};

export default Test;
