// src/pages/HomePageWeb.tsx
import {
    Box, Container, Typography, Stack, Chip, Button,
    Card, CardActionArea, CardMedia, CardContent,
    IconButton, Paper, Divider, ListItemButton, ListItemText, ListItemAvatar, Avatar,
    BottomNavigation, BottomNavigationAction
  } from '@mui/material';
  import Grid from '@mui/material/Grid'; // ✅ Grid v1
  
  import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
  import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
  import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
  import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
  import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
  
  const categories = [
    { emoji: '🔥', label: 'Waacking' },
    { emoji: '🎵', label: 'Afro' },
    { emoji: '💥', label: 'Kpop' },
    { emoji: '🧢', label: 'Krump' },
  ];
  
  const popular = [
    {
      id: 'afro',
      title: 'Afro',
      teacher: 'Sofia',
      seasons: 1,
      image: 'https://images.unsplash.com/photo-1549572189-bc3d3f7d8c5b?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 'waacking',
      title: 'Waacking',
      teacher: 'Nadi',
      seasons: 1,
      image: 'https://images.unsplash.com/photo-1549068106-b024baf5062d?q=80&w=1200&auto=format&fit=crop',
    },
  ];
  
  const choreos = [
    { id: 'mukaji', title: 'Mukaji Internationale', thumb: 'https://images.unsplash.com/photo-1514516430031-43c1a46a7f7a?q=80&w=400&auto=format&fit=crop' },
  ];
  
  export default function HomePageWeb() {
    return (
      <Box sx={{ bgcolor: '#f7f9fc', minHeight: '100dvh', pb: 10 }}>
        <Container maxWidth={false} sx={{ pt: 2, pb: 4 }}>
          {/* Hero */}
          <Paper elevation={0} sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4, p: 2.5, bgcolor: '#f8d7e2', minHeight: 160, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ maxWidth: '65%' }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: 24 }}>
                Выбирай не просто
                <br />движения —<br />выбирай стиль
              </Typography>
            </Box>
            <Box component="img" alt="hero" src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop"
                 sx={{ position: 'absolute', right: -12, bottom: -4, height: 200, objectFit: 'cover', userSelect: 'none' }} />
          </Paper>
  
          {/* Категории */}
          <SectionHeader title="Категории" actionLabel="Посмотреть все" />
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <Chip
                key={c.label}
                label={<Stack direction="row" spacing={1} alignItems="center"><span style={{ fontSize: 18 }}>{c.emoji}</span><span>{c.label}</span></Stack>}
                sx={{ px: 1, py: 0.25, height: 44, borderRadius: 3, bgcolor: '#fff', border: '1px solid #E5E9EF', boxShadow: '0 1px 0 rgba(16,24,40,0.02)', fontWeight: 600 }}
                clickable
              />
            ))}
          </Stack>
  
          {/* Популярное */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1.5, fontWeight: 800 }}>
            Популярное
          </Typography>
          <Grid container spacing={2}>
            {popular.map((c) => (
            //   <Grid item xs={12} sm={6} key={c.id}>
                <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#fff' }}>
                  <CardActionArea sx={{ borderRadius: 3 }}>
                    <CardMedia component="img" height="160" image={c.image} alt={c.title} sx={{ borderRadius: 3 }} />
                    <CardContent sx={{ px: 0.5 }}>
                      <Typography sx={{ mt: 1, fontWeight: 800 }}>{c.title}</Typography>
                      <Typography sx={{ color: '#f97316', fontWeight: 700, display: 'inline' }}>{c.teacher}</Typography>
                      <Typography component="span" sx={{ color: '#64748b', ml: 1 }}>• {c.seasons} сезон</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
            //   </Grid>
            ))}
          </Grid>
  
          {/* Хореография */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1.5, fontWeight: 800 }}>
            Хореография
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {choreos.map((ch, i) => (
              <Box key={ch.id}>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={ch.thumb} sx={{ width: 56, height: 56, borderRadius: 2 }} />
                  </ListItemAvatar>
                  <ListItemText primary={ch.title} primaryTypographyProps={{ fontWeight: 800 }} />
                  <IconButton edge="end"><ChevronRightRoundedIcon /></IconButton>
                </ListItemButton>
                {i < choreos.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Container>
  
        {/* Нижняя навигация */}
        <Paper elevation={8} sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <BottomNavigation showLabels value={0}>
            <BottomNavigationAction icon={<HomeRoundedIcon />} />
            <BottomNavigationAction icon={<PlayCircleOutlineRoundedIcon />} />
            <BottomNavigationAction icon={<EditNoteRoundedIcon />} />
            <BottomNavigationAction icon={<PersonOutlineRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    );
  }
  
  function SectionHeader({ title, actionLabel }: { title: string; actionLabel?: string }) {
    return (
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
        {actionLabel && <Button size="small" color="inherit" sx={{ opacity: 0.6, fontWeight: 600 }}>{actionLabel}</Button>}
      </Stack>
    );
  }
  