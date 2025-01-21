import { abandonmentPublicItem } from '@/services/querys/useQueryAbandonmentPublicGET';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Typography,
} from '@mui/material';
import { memo, useEffect, useState } from 'react';

interface Props {
  info: abandonmentPublicItem;
  onClick: (id: string, info: abandonmentPublicItem) => void;
}

export default memo(function RecommendCard({ info, onClick }: Props) {
  // states
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // actions
  const handleClick = (id, info) => onClick(id, info);

  useEffect(() => {
    setIsImageLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = info.popfile;

    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => setHasError(true);
  }, [info.popfile]);
  return (
    <Card
      variant="outlined"
      sx={{ flex: 'none', width: 200 }}
      onClick={() => handleClick(info.desertionNo, info)}
    >
      <CardActionArea>
        {!isImageLoaded && !hasError && (
          <Skeleton variant="rectangular" width={200} height={200} />
        )}
        {isImageLoaded && !hasError && (
          <Box
            component="img"
            src={info.popfile}
            alt="유기동물 이미지"
            loading="lazy"
            sx={{
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px 4px 0 0',
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        )}
        {hasError && (
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ height: '200px', lineHeight: '200px' }}
          >
            이미지 불러오기 실패
          </Typography>
        )}
        <CardContent>
          <Typography gutterBottom variant="body1" component="div">
            {info.noticeNo}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
            className="line-clamp-2"
          >
            {info.age}/
            {info.sexCd === 'M' ? '수컷' : info.sexCd === 'F' ? '암컷' : '미상'}
            /{info.weight}/{info.processState}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});
