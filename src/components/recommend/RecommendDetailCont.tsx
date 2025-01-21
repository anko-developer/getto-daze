import { abandonmentPublicItem } from '@/services/querys/useQueryAbandonmentPublicGET';
import { Box, Divider, Typography } from '@mui/material';
import { memo } from 'react';

interface Props {
  info: abandonmentPublicItem;
}

export default memo(function RecommendDetailCont({ info }: Props) {
  return (
    <>
      {info && (
        <>
          <Box
            component="img"
            src={info.popfile}
            alt="유기동물 이미지"
            loading="lazy"
            sx={{
              width: '100%',
              maxHeight: '300px',
              marginBottom: '14px',
              objectFit: 'cover',
              borderRadius: '4px 4px 0 0',
            }}
          />
          <Typography component="strong" sx={{ fontWeight: 600 }}>
            {info.kindCd}
          </Typography>

          <Box>
            <Typography
              component="span"
              sx={{ fontSize: '14px', color: '#757575' }}
            >
              {info.sexCd === 'M'
                ? '수컷'
                : info.sexCd === 'F'
                ? '암컷'
                : '미상'}
              (중성화{' '}
              {info.neuterYn === 'Y' ? 'O' : info.neuterYn === 'N' ? 'X' : '?'}
              )/
              {info.colorCd}/{info.age}/{info.weight}
            </Typography>
          </Box>
          <Divider sx={{ margin: '6px 0' }} />
          <Box
            component="ul"
            sx={{
              '& li': {
                position: 'relative',
                paddingLeft: '60px',
                lineHeight: '1',
              },
              '& li strong': {
                position: 'absolute',
                top: '0',
                left: '0',
                fontSize: '12px',
              },
              '& li span': {
                fontSize: '12px',
                verticalAlign: 'top',
              },
            }}
          >
            <li>
              <Typography component="strong">공고번호</Typography>
              <Typography component="span" sx={{ color: '#f29700' }}>
                {info.noticeNo}
              </Typography>
            </li>
            <li>
              <Typography component="strong">공고기간</Typography>
              <Typography component="span">
                {info.noticeSdt} ~ {info.noticeEdt}
              </Typography>
            </li>
            <li>
              <Typography component="strong">발견장소</Typography>
              <Typography component="span">{info.careAddr}</Typography>
            </li>
            <li>
              <Typography component="strong">특이장소</Typography>
              <Typography component="span">{info.specialMark}</Typography>
            </li>
            <li>
              <Typography component="strong">보호센터</Typography>
              <Typography component="span">
                {info.careNm} (Tel: {info.careTel})
              </Typography>
            </li>
            <li>
              <Typography component="strong">관할기관</Typography>
              <Typography component="span">
                {info.orgNm} (Tel: {info.officetel})
              </Typography>
            </li>
          </Box>
        </>
      )}
    </>
  );
});
