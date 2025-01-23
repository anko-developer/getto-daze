import DetailButtons from '@/components/detail/DetailButtons';
import DetailCont from '@/components/detail/DetailCont';
import { abandonmentPublicItem } from '@/services/querys/useQueryAbandonmentPublicGET';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

export default memo(function Detail() {
  const location = useLocation();
  const { info } = location.state as { info: abandonmentPublicItem };
  return (
    <>
      <DetailCont info={info} />
      <DetailButtons />
    </>
  );
});
