// src/pages/RegisterPage.tsx
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
    Alert,
  } from '@mui/material';
  import VisibilityOff from '@mui/icons-material/VisibilityOff';
  import Visibility from '@mui/icons-material/Visibility';
  import { useState } from 'react';
  import { Link as RouterLink, useNavigate } from 'react-router-dom';
  import { useAuth } from '../auth/AuthProvider'; // проверь путь-алиас
  
  type Props = {
    offline?: boolean;
    onRegister?: (p: { name: string; email: string; phone: string; password: string }) => Promise<void> | void;
  };
  
  function mapRegisterError(e: any): string {
    const code = e?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Этот email уже используется.';
      case 'auth/invalid-email':
        return 'Некорректный email.';
      case 'auth/weak-password':
        return 'Слабый пароль. Минимум 6 символов.';
      case 'auth/network-request-failed':
        return 'Проблема с сетью. Проверьте подключение.';
      default:
        return e?.message || 'Не удалось создать аккаунт. Попробуйте ещё раз.';
    }
  }
  
  export default function RegisterPage({ offline, onRegister }: Props) {
    const nav = useNavigate();
    const { register } = useAuth();
  
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
  
    // простая валидация
    const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Введите корректный email' : '';
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneError = phone && phoneDigits.length < 7 ? 'Укажите телефон (минимум 7 цифр)' : '';
    const pwdError = password && password.length < 6 ? 'Минимум 6 символов' : '';
    const nameError = name && name.trim().length < 2 ? 'Минимум 2 символа' : '';
  
    const canSubmit =
      name && email && phone && password && !emailError && !phoneError && !pwdError && !nameError && !loading;
  
    const fieldSx = {
      mb: 1,
      '& .MuiFilledInput-root': {
        borderRadius: 3,
        bgcolor: '#F3F6FB',
        '&:before, &:after': { display: 'none' },
      },
    } as const;
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
  
      try {
        setLoading(true);
        setErr(null);
        const payload = { name: name.trim(), email: email.trim(), phone: phoneDigits, password };
  
        if (onRegister) {
          await onRegister(payload);
        } else {
          // Регистрация + полный профиль (телефон, статусы и т.д.) — внутри AuthProvider.register
          await register(payload.email, payload.password, payload.name, payload.phone);
        }
  
        nav('/', { replace: true });
      } catch (error: any) {
        setErr(mapRegisterError(error));
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
        <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          {offline && (
            <Alert severity="error" variant="filled" sx={{ mb: 2, borderRadius: 3, bgcolor: '#991B1B' }}>
              Нет соединения
            </Alert>
          )}
  
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, bgcolor: 'transparent' }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 900, textAlign: 'center', mb: 3 }}>
              Регистрация
            </Typography>
  
            {err && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                {err}
              </Alert>
            )}
  
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Имя"
                variant="filled"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!nameError}
                helperText={nameError || ' '}
                sx={fieldSx}
              />
  
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="filled"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError || ' '}
                sx={fieldSx}
              />
  
              <TextField
                fullWidth
                label="Телефон"
                variant="filled"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!phoneError}
                helperText={phoneError || ' '}
                sx={fieldSx}
              />
  
              <TextField
                fullWidth
                label="Пароль"
                variant="filled"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!pwdError}
                helperText={pwdError || ' '}
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((v) => !v)} edge="end" aria-label="Показать пароль">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
  
              <Button
                type="submit"
                fullWidth
                size="large"
                disabled={!canSubmit}
                sx={{
                  mt: 0.5,
                  py: 1.6,
                  borderRadius: 999,
                  bgcolor: '#E86635',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#db5e2d' }, // ← фикс опечатки
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {loading ? 'Создаём…' : 'Продолжить'}
              </Button>
            </Box>
  
            <Typography align="center" sx={{ mt: 3, color: 'text.secondary', fontSize: 16 }}>
              Уже есть аккаунт?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#F97316', fontWeight: 700 }}>
                Логин
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }
  