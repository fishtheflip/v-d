// src/shared/ui/Loading.tsx
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

type LoadingProps = {
  label?: string;        // подпись под спиннером
  fullscreen?: boolean;  // true — занять весь экран
  minHeight?: number;    // высота контейнера (если не fullscreen)
};

export default function Loading({
  label = 'Loading…',
  fullscreen = false,
  minHeight = 160,
}: LoadingProps) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        height: fullscreen ? '100vh' : minHeight,
      }}
    >
      {children}
    </Box>
  );

  return (
    <Wrapper>
      <Stack spacing={1} alignItems="center">
        <CircularProgress size={28} />
        {label && (
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        )}
      </Stack>
    </Wrapper>
  );
}
