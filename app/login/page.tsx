'use client';

import { useState, useEffect } from 'react';
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
  Close as CloseIcon,
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
      }, 20);
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
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      login(email.trim());
      setNotificationMsg('Welcome back! Login successful. Redirecting...');
      setNotification('success');

      setTimeout(() => {
        router.replace('/dashboard');
      }, 1200);
    } catch {
      setLoading(false);
      setNotificationMsg('An unexpected error occurred. Please try again.');
      setNotification('error');
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
        bgcolor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ─── Notification Toast (Top Right) ─── */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          transform: notification
            ? 'translateX(0)'
            : 'translateX(calc(100% + 40px))',
          opacity: notification ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: isSuccess ? 'success.light' : 'error.light',
            borderLeft: '3px solid',
            borderLeftColor: isSuccess ? 'success.main' : 'error.main',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            minWidth: 300,
            maxWidth: 360,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isSuccess ? (
              <CheckCircleIcon sx={{ fontSize: 22, color: 'success.main' }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 22, color: 'error.main' }} />
            )}
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {isSuccess ? 'Login Successful' : 'Login Failed'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.4,
              }}
            >
              {notificationMsg}
            </Typography>
          </Box>

          {/* Spinner / Close */}
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {isSuccess ? (
              <CircularProgress
                variant="determinate"
                value={progress}
                size={20}
                thickness={4}
                sx={{ color: 'success.main' }}
              />
            ) : (
              <IconButton
                size="small"
                onClick={() => setNotification(null)}
                sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* ─── Login Card ─── */}
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Logo + Title */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/calf-logo.png"
            alt="Kopi Calf"
            sx={{ height: 64, width: 'auto', mb: 2 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.800' }}>
            Internal System
          </Typography>
        </Box>

        {/* Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {error && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  mb: 2,
                  borderRadius: 1.5,
                  bgcolor: 'error.50',
                  border: '1px solid',
                  borderColor: 'error.100',
                }}
              >
                <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
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
                sx={{ mb: 2 }}
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
                  },
                }}
                sx={{ mb: 2.5 }}
              />
              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={loading}
                endIcon={!loading && <LoginIcon />}
                sx={{
                  py: 1.25,
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  '&:active': { transform: 'scale(0.99)' },
                  transition: 'all 0.15s ease',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.disabled"
          align="center"
          component="p"
          sx={{ mt: 2.5 }}
        >
          &copy; {new Date().getFullYear()} Kopi Calf Group
        </Typography>
      </Box>
    </Box>
  );
}
