import { Box, Link, Typography } from '@mui/material';
import { memo } from 'react';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';

interface Props {
  title: string;
  href?: string;
}

export default memo(function SubTitle({ title, href }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '6px',
      }}
    >
      <Typography component="strong" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Box>
        <Link
          href={href}
          underline="none"
          sx={{ fontSize: '12px', color: '#616161' }}
        >
          더보기
        </Link>
        <KeyboardArrowRightOutlinedIcon
          sx={{ fontSize: '16px', color: '#616161' }}
        />
      </Box>
    </Box>
  );
});
