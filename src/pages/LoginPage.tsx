// src/pages/LoginPageWeb.tsx
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Link,
    Checkbox,
    FormControlLabel,
    Alert,
  } from '@mui/material';
  import VisibilityOff from '@mui/icons-material/VisibilityOff';
  import Visibility from '@mui/icons-material/Visibility';
  import { useState } from 'react';
  import { useNavigate, Link as RouterLink } from 'react-router-dom';
  import { useAuth } from '../auth/AuthProvider'; // ВАЖНО: тот же путь, что и в main.tsx
  
  type Props = {
    onLogin?: (email: string, password: string, remember: boolean) => Promise<void> | void;
    onForgotPassword?: () => void;
  };
  
  function mapAuthError(e: any): string {
    const code = e?.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/user-not-found':
        return 'Неверный email или пароль.';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Попробуйте позже.';
      case 'auth/network-request-failed':
        return 'Проблема с сетью. Проверьте подключение.';
      default:
        return e?.message || 'Не удалось войти. Попробуйте ещё раз.';
    }
  }
  
  export default function LoginPageWeb({ onLogin, onForgotPassword }: Props) {
    const navigate = useNavigate();
    const { login, resetPassword } = useAuth();
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
  
    const emailError =
      email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Введите корректный email' : '';
    const pwdError = password.length > 0 && password.length < 6 ? 'Минимум 6 символов' : '';
  
    const canSubmit = email && password && !emailError && !pwdError && !loading;
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      try {
        setLoading(true);
        setErr(null);
        if (onLogin) {
          await onLogin(email.trim(), password, remember);
        } else {
          // Firebase через контекст
          await login(email.trim(), password, remember);
        }
        navigate('/', { replace: true });
      } catch (error: any) {
        setErr(mapAuthError(error));
      } finally {
        setLoading(false);
      }
    };
  
    const handleForgot = async () => {
      if (onForgotPassword) return onForgotPassword();
      if (!email) return setErr('Введите email, чтобы восстановить пароль.');
      try {
        setLoading(true);
        setErr(null);
        await resetPassword(email.trim());
        setErr('Мы отправили письмо для восстановления пароля.');
      } catch (e: any) {
        setErr(mapAuthError(e));
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, bgcolor: 'transparent' }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mb: 3 }}>
              Авторизация
            </Typography>
  
            {err && (
              <Alert severity={err.includes('отправили письмо') ? 'info' : 'error'} sx={{ mb: 2, borderRadius: 3 }}>
                {err}
              </Alert>
            )}
  
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError || ' '}
                variant="filled"
                InputProps={{ disableUnderline: true, sx: { borderRadius: 3, bgcolor: '#F3F6FB' } }}
                sx={{ mb: 1 }}
              />
  
              <TextField
                fullWidth
                label="Пароль"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!pwdError}
                helperText={pwdError || ' '}
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  sx: { borderRadius: 3, bgcolor: '#F3F6FB' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
  
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -1, mb: 2 }}>
                <FormControlLabel
                  control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                  label="Запомнить меня"
                />
                <Button variant="text" onClick={handleForgot} sx={{ textTransform: 'none' }}>
                  Забыли пароль?
                </Button>
              </Box>
  
              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={!canSubmit}
                sx={{
                  py: 1.6,
                  borderRadius: 999,
                  bgcolor: '#E86635',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#db5e2d' },
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {loading ? 'Входим…' : 'Войти'}
              </Button>
            </Box>
  
            <Typography align="center" sx={{ mt: 3, color: 'text.secondary', fontSize: 16 }}>
              Ещё нет аккаунта?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: '#F97316', fontWeight: 700 }}>
                Зарегистрироваться
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }
  