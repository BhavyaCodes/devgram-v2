import { Box, SvgIconTypeMap, Tooltip, Typography } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import React, { FC } from 'react';

interface ActionButtonProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
    muiName: string;
  };
  color: string;
  hoverBgColor: string;
  number?: number;
  onClick: () => void;
  toolTip: string;
  iconAlwaysColored?: boolean;
  text?: string;
  iconInverted?: boolean;
}

export const ActionButton: FC<ActionButtonProps> = ({
  Icon,
  color,
  number,
  hoverBgColor,
  onClick,
  toolTip,
  iconAlwaysColored,
  text,
  iconInverted,
}) => {
  return (
    <Tooltip title={toolTip} enterDelay={500} leaveDelay={200}>
      <Box
        display="flex"
        alignItems="center"
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            '& div': {
              bgcolor: hoverBgColor,
              opacity: 1,
            },
            '& span': {
              opacity: 1,
              color,
            },
            '& svg': {
              fill: color,
            },
          },
          '& svg': {
            fill: iconAlwaysColored ? color : undefined,
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          sx={{
            transition: (theme) => theme.transitions.create('all'),
            opacity: 0.4,
            transform: iconInverted ? 'scale(-1,1)' : undefined,
          }}
          borderRadius={50}
          p={1}
          mr={0.5}
          ml={-1}
        >
          <Icon sx={{ fontSize: 15 }} />
        </Box>
        {typeof number !== 'undefined' && (
          <Typography
            component="span"
            variant="body2"
            fontSize={13}
            sx={{
              userSelect: 'none',
              transition: (theme) => theme.transitions.create('all'),
            }}
          >
            {number.toLocaleString()}
          </Typography>
        )}
        {typeof text !== 'undefined' && (
          <Typography
            component="span"
            variant="body2"
            fontSize={13}
            sx={{
              userSelect: 'none',
              transition: (theme) => theme.transitions.create('all'),
            }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};
