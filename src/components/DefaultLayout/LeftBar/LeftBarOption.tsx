import { Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import Link from '../../common/Link';

export const LeftBarOption: FC<{
  children: ReactNode;
  href: string;
  text: string;
  isActive?: boolean;
}> = ({ children, href, text, isActive }) => {
  return (
    <Link
      href={href}
      color="inherit"
      sx={{
        textDecoration: 'none',
        p: 1.5,
        ml: -1.5,
        borderRadius: 200,
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.08)',
          transition: (theme) => theme.transitions.create('background-color'),
        },
      }}
      display="inline-flex"
      alignItems="center"
      justifyContent="flex-start"
    >
      {children}
      <Typography
        fontSize={20}
        fontWeight={isActive ? 700 : 400}
        component="h4"
        ml={2}
      >
        {text}
      </Typography>
    </Link>
  );
};
