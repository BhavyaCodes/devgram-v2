import GoogleIcon from '@mui/icons-material/Google';
import { Button } from '@mui/material';
import getGoogleOAuthURL from '~/utils/getGoogleUrl';

export const LoginButton = () => (
  <Button
    href={getGoogleOAuthURL()}
    color="inherit"
    variant="outlined"
    startIcon={<GoogleIcon />}
  >
    Login
  </Button>
);
