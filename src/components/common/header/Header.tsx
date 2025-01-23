import { Typography } from '@mui/material';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

export default memo(function Header() {
  const navigate = useNavigate();
  return (
    <header className="z-10 fixed top-0 right-0 left-0 px-4 py-2 border-b-[1px] bg-white">
      <Typography
        onClick={() => navigate('/')}
        variant="h6"
        component="h1"
        sx={{ fontWeight: 'bold', color: '#f29700' }}
      >
        GETTODAZE
      </Typography>
    </header>
  );
});
