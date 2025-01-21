import { memo } from 'react';
import RecommendList from './RecommendList';
import { Box } from '@mui/material';
import SubTitle from '../common/subTitle/SubTitle';

export default memo(function RecommendCont() {
  return (
    <>
      <SubTitle title="이달의 추천 입양 동물" href="/recommend" />
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
