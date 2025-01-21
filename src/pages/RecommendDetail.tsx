import RecommendDetailCont from '@/components/recommend/RecommendDetailCont';
import { abandonmentPublicItem } from '@/services/querys/useQueryAbandonmentPublicGET';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

export default memo(function RecommendDetail() {
  const location = useLocation();
  const { info } = location.state as { info: abandonmentPublicItem };
  return (
    <>
      <RecommendDetailCont info={info} />
    </>
  );
});
