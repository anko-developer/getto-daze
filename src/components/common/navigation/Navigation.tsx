import { ROUTES } from '@/routes';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import FaceIcon from '@mui/icons-material/Face';

type menuType = {
  href: string;
  id: string;
  name: string;
};

const iconMap: { [key: string]: JSX.Element } = {
  home: <HomeRoundedIcon />,
  recommend: <ThumbUpRoundedIcon />,
  myInfo: <FaceIcon />,
};

const pages: menuType[] = [
  {
    href: `${ROUTES.MAIN}`,
    id: 'home',
    name: '홈',
  },
  {
    href: `${ROUTES.RECOMMEND}`,
    id: 'recommend',
    name: '추천 입양',
  },
  {
    href: `${ROUTES.MYINFO}`,
    id: 'myInfo',
    name: '내정보',
  },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationPath = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);
  const handleClickRoute = useCallback((href) => navigate(href), [navigate]);
  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={2}
    >
      <BottomNavigation value={locationPath} showLabels>
        {pages.map(({ id, href }) => (
          <BottomNavigationAction
            key={id}
            value={href}
            icon={iconMap[id]}
            onClick={() => {
              handleClickRoute(href);
            }}
            sx={{ fontSize: '12px' }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
