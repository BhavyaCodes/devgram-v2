import {
  pink,
  cyan,
  teal,
  lime,
  yellow,
  lightGreen,
  deepPurple,
} from '@mui/material/colors';
export function getRandomColor(): string {
  const colors = [
    pink['A200'],
    cyan['A200'],
    teal['A200'],
    lime['A200'],
    yellow['A200'],
    lightGreen['A200'],
    deepPurple['A200'],
  ];

  const index = Math.floor(Math.random() * colors.length);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return colors[index]!;
}
