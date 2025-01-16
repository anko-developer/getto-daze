import { Button } from '@mui/material';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre className="text-[red]">{error.message}</pre>
      <Button onClick={() => resetErrorBoundary()}>다시 시도</Button>
    </div>
  );
}
