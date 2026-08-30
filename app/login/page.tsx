'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { login } from '@/lib/auth';

type NotificationType = 'success' | 'error' | null;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationType>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [progress, setProgress] = useState(0);

  // Animate progress bar on success
  useEffect(() => {
    if (notification === 'success') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + 2;
        });
      }, 20); // 100% in ~1 second
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [notification]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      setNotificationMsg('Email and password are required.');
      setNotification('error');
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      login(email.trim());
      setNotificationMsg(`Welcome back! Login successful. Redirecting...`);
      setNotification('success');

      setTimeout(() => {
        router.replace('/dashboard');
      }, 1200);
    } catch {
      setLoading(false);
      setNotificationMsg('An unexpected error occurred. Please try again.');
      setNotification('error');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const isSuccess = notification === 'success';
  const isError = notification === 'error';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: '#f0f2f5',
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(79, 70, 229, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(79, 70, 229, 0.05)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -60,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          bgcolor: 'rgba(14, 165, 233, 0.05)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* ─── Notification Banner ─── */}
      <Box
        sx={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: notification
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(-120px)',
          opacity: notification ? 1 : 0,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          zIndex: 9999,
          width: '100%',
          maxWidth: 480,
          px: 2,
        }}
      >
        <Card
          elevation={8}
          sx={{
            overflow: 'hidden',
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            bgcolor: isSuccess
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: isSuccess
              ? '0 8px 32px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.1)'
              : '0 8px 32px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.1)',
          }}
        >
          {/* Progress bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              width: `${progress}%`,
              bgcolor: isSuccess ? 'success.main' : 'error.main',
              transition: 'width 0.02s linear',
              borderRadius: '0 2px 0 0',
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
            {/* Icon */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: isSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                animation: isSuccess ? 'pulse-success 0.6s ease-out' : 'shake-error 0.5s ease-out',
                '@keyframes pulse-success': {
                  '0%': { transform: 'scale(0.6)', opacity: 0 },
                  '60%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)', opacity: 1 },
                },
                '@keyframes shake-error': {
                  '0%, 100%': { transform: 'translateX(0)' },
                  '20%': { transform: 'translateX(-4px)' },
                  '40%': { transform: 'translateX(4px)' },
                  '60%': { transform: 'translateX(-3px)' },
                  '80%': { transform: 'translateX(3px)' },
                },
              }}
            >
              {isSuccess ? (
                <CheckCircleIcon sx={{ fontSize: 24, color: 'success.main' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 24, color: 'error.main' }} />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: isSuccess ? 'success.dark' : 'error.dark',
                  lineHeight: 1.3,
                }}
              >
                {isSuccess ? 'Login Successful' : 'Login Failed'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  lineHeight: 1.4,
                  mt: 0.25,
                }}
              >
                {notificationMsg}
              </Typography>
            </Box>

            {/* Loading spinner on success */}
            {isSuccess && (
              <Box sx={{ flexShrink: 0 }}>
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={28}
                  thickness={4}
                  sx={{ color: 'success.main' }}
                />
              </Box>
            )}
          </Box>
        </Card>
      </Box>

      {/* ─── Login Card ─── */}
      <Box sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/calf-logo.png"
            alt="Kopi Calf"
            sx={{
              height: 72,
              width: 'auto',
              mb: 2.5,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'grey.800',
              letterSpacing: '-0.02em',
            }}
          >
            Internal System
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Sign in to your account to continue
          </Typography>
        </Box>

        {/* Form Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Inline error */}
            {error && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.25,
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <ErrorIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{ mb: 2.5 }}
                slotProps={{
                  htmlInput: { sx: { py: 1.25 } },
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { py: 1.25 },
                  },
                }}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                endIcon={
                  loading ? null : <LoginIcon />
                }
                sx={{
                  py: 1.25,
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)' },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={18} sx={{ color: 'white' }} thickness={5} />
                    <span>Authenticating...</span>
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          component="p"
          sx={{ mt: 3, letterSpacing: '0.01em' }}
        >
          &copy; {new Date().getFullYear()} Kopi Calf Group — Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
}
