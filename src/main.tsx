import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Main = React.lazy(() => import('./pages/Main.tsx'));
const Recommend = React.lazy(() => import('./pages/Recommend.tsx'));
const RecommendDetail = React.lazy(() => import('./pages/RecommendDetail.tsx'));
const MyInfo = React.lazy(() => import('./pages/MyInfo.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Main />,
      },
      {
        path: '/recommend',
        element: <Recommend />,
      },
      {
        path: '/recommend/:id',
        element: <RecommendDetail />,
      },
      {
        path: '/myInfo',
        element: <MyInfo />,
      },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
