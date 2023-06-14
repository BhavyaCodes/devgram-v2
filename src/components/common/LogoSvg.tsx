import { Box, BoxProps, Tooltip } from '@mui/material';

export const LogoSvg = ({
  width = 20,
  title,
  sx,
  ...otherProps
}: { width?: number; title: string } & BoxProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      {...otherProps}
      sx={{
        '& svg': {
          mt: 0.5,
        },
        ...sx,
      }}
    >
      <Tooltip title={title}>
        <svg
          width={width.toString()}
          // height="20"
          viewBox="0 0 93 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M30.1555 52.2257L0 0H27.9703L39.8795 42.611L30.1555 52.2257Z"
            fill="#0EA47A"
          />
          <path
            d="M34.7444 11.4722L31.7943 0H92.1053L78.5572 23.3814L34.7444 11.4722Z"
            fill="#0EA47A"
          />
          <path
            d="M42.8295 39.2239L36.3832 15.8425L59.8738 21.9611L42.8295 39.2239Z"
            fill="#0EA47A"
          />
          <path
            d="M64.2442 22.9443L32.3406 55.3943L46.3258 79.8683L76.9182 26.3314L64.2442 22.9443Z"
            fill="#0EA47A"
          />
        </svg>
      </Tooltip>
    </Box>
  );
};
