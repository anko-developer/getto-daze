import { memo } from 'react';
import RecommendList from './RecommendList';
import { Box } from '@mui/material';

export default memo(function RecommendCont() {
  return (
    <>
      <Box
        sx={{
          overflowX: 'auto',
          paddingBottom: '10px',
        }}
      >
        <RecommendList />
      </Box>
    </>
  );
});
