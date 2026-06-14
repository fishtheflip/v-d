import { Box, Skeleton } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

type Props = {
  src?: string;
  alt: string;
  sx?: SxProps<Theme>;
  objectFit?: 'cover' | 'contain';
  eager?: boolean;
};

export default function ImageWithSkeleton({
  src,
  alt,
  sx,
  objectFit = 'cover',
  eager = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Box
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#E9EEF5',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      )}
      {src && (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 220ms ease',
          }}
        />
      )}
    </Box>
  );
}
