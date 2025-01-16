import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MyInfo from './pages/MyInfo.tsx';

// const NotFound = React.lazy(() => import('./pages/NotFound.tsx'));
const Main = React.lazy(() => import('./pages/Main.tsx'));
const Recommend = React.lazy(() => import('./pages/Recommend.tsx'));

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
