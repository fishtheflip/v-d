// src/pages/ProfilePageWeb.tsx
import {
    Box,
    Container,
    Paper,
    Avatar,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Alert,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
  } from '@mui/material';
  import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
  import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
  import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
  import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
  import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
  import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../auth/AuthProvider';
  
  type Props = {
    userName?: string;
    avatarUrl?: string;
    offline?: boolean;
    onMyCourses?: () => void;
    onCertificates?: () => void;
    onSupport?: () => void;
    onDeleteAccount?: () => void;
    onLogout?: () => void;
  };
  
  export default function ProfilePageWeb({
    userName = 'Евы',
    avatarUrl,
    onMyCourses,
    onCertificates,
    onSupport,
    onLogout,
  }: Props) {
    const [loggingOut, setLoggingOut] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
  
    const nav = useNavigate();
    const { logout, user } = useAuth();
  
    const resetLocalStores = () => {
      // при желании очисти zustand-сторы здесь
    };
  
    const handleLogoutConfirmed = async () => {
      if (loggingOut) return;
      try {
        setErr(null);
        setLoggingOut(true);
        if (onLogout) await onLogout();
        else await logout();
        resetLocalStores();
        nav('/landing', { replace: true });
      } catch (e: any) {
        setErr(e?.message || 'Не удалось выйти. Попробуйте ещё раз.');
        setLoggingOut(false);
      } finally {
        setConfirmOpen(false);
      }
    };
  
    const goMyCourses = onMyCourses ?? (() => nav('/my-course'));
    const goMyCertificates = onCertificates ?? (() => nav('/my-cert'));
    const goSupport = onSupport ?? (() => nav('/support'));
  
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', pb: 9 }}>
        <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
          <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
            {err && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {err}
              </Alert>
            )}
  
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, mb: 2 }}>
              <Avatar
                src={avatarUrl}
                sx={{ width: 112, height: 112, bgcolor: '#F6EDE3', color: 'text.primary', fontSize: 40 }}
              />
              <Typography sx={{ mt: 1.5, fontWeight: 800, fontSize: 28, color: '#111827' }}>
                {user?.displayName || userName}
              </Typography>
            </Box>
  
            <Paper elevation={0} sx={{ borderRadius: 3, p: 0.5, bgcolor: '#FFFFFF' }}>
              <List disablePadding>
                <Item title="Мои курсы" icon={<RocketLaunchRoundedIcon />} onClick={goMyCourses} />
                <Divider />
                <Item title="Мои сертификаты" icon={<WorkspacePremiumRoundedIcon />} onClick={goMyCertificates} />
                <Divider />
                <Item title="Поддержка" icon={<SupportAgentRoundedIcon />} onClick={goSupport} />
                <Divider />
                <Item
                  title={loggingOut ? 'Выходим…' : 'Выход'}
                  icon={<LogoutRoundedIcon />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={loggingOut}
                />
              </List>
            </Paper>
          </Box>
        </Container>
  
        {/* Красивый, крупный диалог */}
        <Dialog
          open={confirmOpen}
          onClose={() => (!loggingOut ? setConfirmOpen(false) : null)}
          fullWidth
          maxWidth="sm"
          slotProps={{
            backdrop: { sx: { backdropFilter: 'blur(4px)' } },
          }}
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 4,
              p: { xs: 2.5, sm: 3 },
              boxShadow:
                '0 20px 60px -10px rgba(15, 23, 42, 0.25), 0 8px 24px -6px rgba(15, 23, 42, 0.18)',
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <WarningAmberRoundedIcon sx={{ color: '#F59E0B', fontSize: 34 }} />
            <DialogTitle
              sx={{
                p: 0,
                fontWeight: 900,
                fontSize: { xs: 24, sm: 28 },
                lineHeight: 1.2,
                fontFamily: '"Manrope Variable", "Inter Variable", system-ui, -apple-system',
              }}
            >
              Выйти из аккаунта?
            </DialogTitle>
          </Stack>
  
          <DialogContent
            sx={{
              p: 0,
              mt: 1,
              color: '#475569',
              fontSize: { xs: 16, sm: 18 },
              fontFamily: '"Inter Variable", system-ui, -apple-system',
            }}
          >
            Вам нужно будет войти снова.
          </DialogContent>
  
          <DialogActions sx={{ p: 0, mt: 3, gap: 1.25 }}>
            <Button
              onClick={() => setConfirmOpen(false)}
              disabled={loggingOut}
              size="large"
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 999,
                px: 2.5,
                py: 1,
              }}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleLogoutConfirmed}
              disabled={loggingOut}
              size="large"
              sx={{
                textTransform: 'none',
                fontWeight: 900,
                borderRadius: 999,
                px: 2.75,
                py: 1,
                boxShadow: '0 8px 22px rgba(239,68,68,0.35)',
              }}
            >
              {loggingOut ? 'Выходим…' : 'Выйти'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  function Item({
    title,
    icon,
    onClick,
    color,
    disabled = false,
  }: {
    title: string;
    icon: React.ReactNode;
    onClick?: () => void;
    color?: 'error';
    disabled?: boolean;
  }) {
    return (
      <ListItemButton onClick={onClick} sx={{ py: 2, borderRadius: 2 }} disabled={disabled}>
        <Box sx={{ mr: 1.5, color: color === 'error' ? 'error.main' : 'text.secondary' }}>{icon}</Box>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            sx: { fontSize: 18, fontWeight: 700, color: color === 'error' ? 'error.main' : 'text.primary' },
          }}
        />
        <IconButton edge="end" disableRipple>
          <ChevronRightRoundedIcon />
        </IconButton>
      </ListItemButton>
    );
  }
  