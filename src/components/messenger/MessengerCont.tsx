import { Box } from '@mui/material';
import { memo } from 'react';
import MessengerProfile from './MessengerProfile';

export default memo(function MessengerCont() {
  return (
    <Box>
      <MessengerProfile />
    </Box>
  );
});
