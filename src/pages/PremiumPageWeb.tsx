// src/pages/PremiumPageWeb.tsx
import {
  Box,
  Container,
  Stack,
  Typography,
  IconButton,
  Paper,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import { useNavigate } from 'react-router-dom';

const EMERALD = '#10B981';
const EMERALD_BG = '#10B9811A';
const SLATE = '#0f172a';
const SLATE_SOFT = '#334155';
const BORDER = '#E5E9EF';

// цены редактируются здесь
const PRICE = {
  dancePass: { kzt: '₸4 990', usd: '$10', rub: '1 000 ₽' },
  premium:   { kzt: '₸8 990', usd: '$17', rub: '1 400 ₽', period: '/ мес.' },
};
const SUPPORT_URL = 'https://t.me/vitedanceapp';


export default function PremiumPageWeb() {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    try {
      window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer');
    } catch {
      // на всякий случай — если popup заблокирован
      window.location.href = SUPPORT_URL;
    }
  };
  const SUPPORT_URL = 'https://t.me/vitedanceapp';

  const handleBuyPass   = () => {
    try {
      window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer');
    } catch {
      // на всякий случай — если popup заблокирован
      window.location.href = SUPPORT_URL;
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100dvh' }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', boxShadow: 1, '&:hover': { bgcolor: '#fff' } }}
            >
              <ArrowBackIosNewRoundedIcon />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DiamondRoundedIcon sx={{ color: EMERALD }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: SLATE }}>
                Премиум
              </Typography>
            </Stack>
          </Stack>

          {/* Hero */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#fff', mb: 2.5 }}>
            <Stack spacing={1}>
              <Chip
                label="Открой весь контент"
                size="small"
                icon={<AutoAwesomeRoundedIcon />}
                sx={{ alignSelf: 'flex-start', bgcolor: EMERALD_BG, color: EMERALD, fontWeight: 700 }}
              />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, color: SLATE }}>
                Учись быстрее и глубже с премиум-доступом
              </Typography>
              <Typography sx={{ color: SLATE_SOFT, maxWidth: 760 }}>
                Премиум снимает ограничения: полный доступ к курсам и хореографиям, офлайн-доступ,
                эксклюзивные подборки и персональные рекомендации. Никакой рекламы — только танец.
              </Typography>
              <Typography sx={{ mt: 1.5, color: '#0B0616', fontWeight: 700, maxWidth: 760 }}>
                Выберите курс целиком (Dance Pass), чтобы владеть программой навсегда.
                Или подключите месячный доступ, чтобы открыть все курсы сразу и экспериментировать без ограничений.
              </Typography>
            </Stack>
          </Paper>

          {/* Сравнение тарифов */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF', mb: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {/* Dance Pass */}
              <TierCard
                icon={<Inventory2RoundedIcon sx={{ color: SLATE }} />}
                title="Dance Pass"
                priceKZT={PRICE.dancePass.kzt}
                usd={PRICE.dancePass.usd}
                rub={PRICE.dancePass.rub}
                subtitle="Курс остаётся у вас навсегда"
                bullets={[
                  'Доступны все уроки выбранного курса',
                  'Смотрите в своём темпе',
                ]}
                cta={{
                  label: 'Купить Dance Pass',
                  variant: 'outlined',
                  onClick: handleBuyPass,
                }}
              />

              {/* Premium */}
              <TierCard
                icon={<DiamondRoundedIcon sx={{ color: EMERALD }} />}
                title="Premium"
                priceKZT={`${PRICE.premium.kzt} ${PRICE.premium.period ?? ''}`}
                usd={PRICE.premium.usd}
                rub={PRICE.premium.rub}
                subtitle="Все курсы и хореографии без ограничений"
                bullets={[
                  'Открывает весь каталог сразу',
                  'Сертификаты о завершении курса',
                ]}
                cta={{
                  label: 'Оформить Premium',
                  variant: 'contained',
                  color: EMERALD,
                  onClick: handleSubscribe,
                }}
              />
            </Box>
          </Paper>

          {/* Оплата: отдельный блок */}
          <Paper elevation={0} sx={{ borderRadius: 3, p: { xs: 2, md: 3 }, bgcolor: '#FFFFFF' }}>
            <Stack spacing={1.25}>
              <Typography sx={{ fontWeight: 900, color: SLATE }}>Оплата доступна через</Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                <PayPill
                  icon={<AccountBalanceWalletRoundedIcon />}
                  label="Kaspi платежом"
                />
                <PayPill
                  icon={<CreditCardRoundedIcon />}
                  label="Любой картой мира"
                  sublabel="Visa / Mastercard / Мир"
                />
                <PayPill
                  icon={<CurrencyBitcoinRoundedIcon />}
                  label="Криптовалютой"
                  sublabel="USDT"
                />
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

/* =========================================
   UI-фрагменты
   ========================================= */

function PriceTag({
  kzt,
  usd,
  rub,
  period,
}: { kzt: string; usd: string; rub: string; period?: string }) {
  return (
    <Stack spacing={0.75}>
      {/* Главная цена (KZT) */}
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography sx={{ fontWeight: 900, fontSize: { xs: 26, md: 30 }, color: SLATE }}>
          {kzt}
        </Typography>
        {period ? (
          <Typography sx={{ color: '#64748B', fontWeight: 700 }}>{period}</Typography>
        ) : null}
      </Stack>

      {/* Доп. валюты — «бейджи» крупно */}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip
          label={usd}
          sx={{
            fontWeight: 900,
            fontSize: { xs: 14, md: 15 },
            px: 1,
            bgcolor: '#F1F5F9',
            color: SLATE,
            borderRadius: 2,
          }}
        />
        <Chip
          label={rub}
          sx={{
            fontWeight: 900,
            fontSize: { xs: 14, md: 15 },
            px: 1,
            bgcolor: '#F1F5F9',
            color: SLATE,
            borderRadius: 2,
          }}
        />
      </Stack>
    </Stack>
  );
}

function TierCard({
  icon,
  title,
  priceKZT,
  usd,
  rub,
  subtitle,
  bullets,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  priceKZT: string;
  usd: string;
  rub: string;
  subtitle: string;
  bullets: string[];
  cta: { label: string; variant: 'contained' | 'outlined'; onClick: () => void; color?: string };
}) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, p: 2, border: `1px solid ${BORDER}` }}>
      <Stack spacing={1.25}>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography sx={{ fontWeight: 900, color: SLATE }}>{title}</Typography>
          </Stack>

          {/* Красивый блок цены */}
          <PriceTag
            kzt={priceKZT}
            usd={usd}
            rub={rub}
            period={priceKZT.includes('/ мес.') ? '/ мес.' : undefined}
          />
        </Stack>

        {subtitle && (
          <Typography sx={{ color: SLATE_SOFT }}>{subtitle}</Typography>
        )}

        <Stack spacing={0.75} sx={{ color: SLATE_SOFT }}>
          {bullets.map((b, i) => (
            <Bullet key={i} text={b} />
          ))}
        </Stack>

        <Divider sx={{ my: 0.5 }} />

        <Button
          variant={cta.variant}
          onClick={cta.onClick}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 999,
            ...(cta.variant === 'contained'
              ? { bgcolor: cta.color || EMERALD, '&:hover': { bgcolor: '#059669' } }
              : {}),
          }}
        >
          {cta.label}
        </Button>
      </Stack>
    </Paper>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start">
      <CheckRoundedIcon sx={{ fontSize: 18, color: EMERALD, mt: '2px' }} />
      <Typography sx={{ fontSize: 14 }}>{text}</Typography>
    </Stack>
  );
}

function PayPill({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        border: `1px solid ${BORDER}`,
        borderRadius: 999,
        px: 1.25,
        py: 0.75,
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: '#F1F5F9',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </Box>
      <Stack lineHeight={1}>
        <Typography sx={{ fontWeight: 800, color: SLATE }}>{label}</Typography>
        {sublabel ? (
          <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>{sublabel}</Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
