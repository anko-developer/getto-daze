import { useQueryAbandonmentPublicGET } from '@/services/querys/useQueryAbandonmentPublicGET';
import { memo } from 'react';
import RecommendCard from './RecommendCard';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default memo(function RecommendList() {
  const navigate = useNavigate();

  // apis
  const { data } = useQueryAbandonmentPublicGET(
    {
      // upr_cd: 6110000,
      // bgnde: '20200101',
      // endde: '20241231',
    },
    // { enabled: true },
  );

  // actions
  const handleClick = (id, info) =>
    navigate(`/recommend/${id}`, { state: { info } });

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
      }}
    >
      {data &&
        data?.response?.body?.items?.item?.map((info) => (
          <RecommendCard
            key={info.desertionNo}
            info={info}
            onClick={handleClick}
          />
        ))}
    </Box>
  );
});
