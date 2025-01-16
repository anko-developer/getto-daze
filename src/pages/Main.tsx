import SubTitle from '@/components/common/subTitle/SubTitle';
import RecommendCont from '@/components/main/RecommendCont';
import { Box } from '@mui/material';

export default function Main() {
  return (
    <>
      <Box
        sx={{
          height: '140px',
          marginBottom: '14px',
          backgroundColor: '#888',
        }}
      />
      <SubTitle title="이달의 추천 입양 동물" href="/recommend" />
      <RecommendCont />
    </>
  );
}
