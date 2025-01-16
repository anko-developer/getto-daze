import { Outlet } from 'react-router-dom';
import Navigation from '@/components/common/navigation/Navigation';
import RootErrorBoundary from '@/components/common/error/RootErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, Container, createTheme, ThemeProvider } from '@mui/material';
import Header from './components/common/header/Header';

const queryClient = new QueryClient();
const outerTheme = createTheme({
  palette: {
    primary: {
      main: '#f29700',
      contrastText: '#333',
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#333',
        },
      },
    },
  },
  // MuiOutlinedInput: {
  //   styleOverrides: {
  //     root: {
  //       color: '#fff',
  //       '& .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#fff', // 기본 border 색상
  //       },
  //       '&:hover .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#0173e6', // hover 시 border 색상
  //       },
  //       '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#0173e6', // focus 시 border 색상
  //       },
  //     },
  //   },
  // },
  // MuiSelect: {
  //   styleOverrides: {
  //     root: {
  //       color: '#fff',
  //       '& .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#fff', // 기본 border 색상
  //       },
  //       '&:hover .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#0173e6', // hover 시 border 색상
  //       },
  //       '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
  //         borderColor: '#0173e6', // focus 시 border 색상
  //       },
  //     },
  //     icon: {
  //       color: '#fff',
  //     },
  //   },
  // },
  // },
  // typography: {
  //   body1: {
  //     color: '#fff',
  //   },
  // },
});

export default function App() {
  return (
    <>
      <ThemeProvider theme={outerTheme}>
        <QueryClientProvider client={queryClient}>
          <Box>
            <Header />

            <RootErrorBoundary>
              <Container
                maxWidth="md"
                sx={{ paddingTop: '16px', paddingBottom: '16px' }}
              >
                <Outlet />
              </Container>
            </RootErrorBoundary>

            <Navigation />
          </Box>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
