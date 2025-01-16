import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import ErrorFallback from '@/components/common/error/ErrorFallback';
import { Box, CircularProgress } from '@mui/material';

const RootErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary onReset={() => reset} FallbackComponent={ErrorFallback}>
      <Suspense
        fallback={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress size="3rem" />
          </Box>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default RootErrorBoundary;
