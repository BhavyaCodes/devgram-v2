import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import Link from './Link';

interface OptionProps {
  selected: boolean;
  children: string;
  href?: string;
  onClick?: () => void;
}
export const Option: FC<OptionProps> = ({
  selected,
  children,
  href,
  onClick,
}) => {
  if (href) {
    return (
      <Link
        href={href}
        py={2}
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          transition: (theme) => theme.transitions.create('background-color'),
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(231, 233, 234, 0.1)',
          },
          textDecoration: 'none',
        }}
      >
        <Typography
          fontWeight={selected ? 700 : 400}
          fontSize={14}
          variant={selected ? 'body1' : 'body2'}
        >
          {children}
        </Typography>
        {selected && (
          <Box
            height={4}
            borderRadius={50}
            position="absolute"
            sx={{ bgcolor: (theme) => theme.palette.primary.main }}
            width={70}
            bottom={0}
          />
        )}
      </Link>
    );
  }

  return (
    <Box
      onClick={onClick}
      py={2}
      flexGrow={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        transition: (theme) => theme.transitions.create('background-color'),
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(231, 233, 234, 0.1)',
        },
        textDecoration: 'none',
      }}
    >
      <Typography
        fontWeight={selected ? 700 : 400}
        fontSize={14}
        variant={selected ? 'body1' : 'body2'}
      >
        {children}
      </Typography>
      {selected && (
        <Box
          height={4}
          borderRadius={50}
          position="absolute"
          sx={{ bgcolor: (theme) => theme.palette.primary.main }}
          width={70}
          bottom={0}
        />
      )}
    </Box>
  );
};
