import { Box, useScrollTrigger } from '@mui/material';
import { NextPage } from 'next';
import React from 'react';

const Test: NextPage = () => {
  const trigger = useScrollTrigger();

  return (
    <>
      <Box position="sticky" top={0} zIndex={1100}>
        <Box
          position="relative"
          bgcolor="yellowgreen"
          sx={{
            height: trigger ? 0 : 50,
            transition: (theme) => theme.transitions.create('height'),
          }}
        >
          TOP
        </Box>
        <Box height={50} bgcolor="orange" position="relative">
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
