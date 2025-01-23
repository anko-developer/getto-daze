import { Box, Button } from '@mui/material';
import { green } from '@mui/material/colors';
import { memo } from 'react';

export default memo(function DetailButtons() {
  return (
    <Box
      sx={{
        zIndex: '1',
        display: 'flex',
        gap: 1,
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        padding: '16px',
      }}
    >
      <Button
        fullWidth
        variant="contained"
        size="medium"
        sx={{ fontWeight: '600', color: 'white', background: green['A700'] }}
      >
        전화문의
      </Button>
      <Button
        fullWidth
        variant="contained"
        sx={{ fontWeight: '600', color: 'white' }}
      >
        입양신청
      </Button>
    </Box>
  );
});
