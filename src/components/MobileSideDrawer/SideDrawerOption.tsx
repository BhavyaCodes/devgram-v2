import { Typography } from '@mui/material';
import { FC, ReactNode } from 'react';
import Link from '../common/Link';

export const SideDrawerOption: FC<{
  children: ReactNode;
  href: string;
  text: string;
  target?: '_blank';
}> = ({ children, href, text, target }) => {
  return (
    <Link
      href={href}
      target={target}
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      pl={2}
      py={1.5}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.2)',
        },
        transition: (theme) => theme.transitions.create('background-color'),
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
      <Typography fontSize={20} fontWeight={700} component="h4" ml={2}>
        {text}
      </Typography>
    </Link>
  );
};
