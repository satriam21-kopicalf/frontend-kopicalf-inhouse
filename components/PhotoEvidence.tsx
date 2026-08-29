'use client';

import { useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Grid, Paper, LinearProgress,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface PhotoEvidenceProps {
  photos: string[]; // base64 data URLs
  onPhotosChange: (photos: string[]) => void;
  minPhotos?: number;
  label?: string;
}

export default function PhotoEvidence({
  photos,
  onPhotosChange,
  minPhotos = 3,
  label = 'Bukti Foto (minimum 3 foto)',
}: PhotoEvidenceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const meetsMin = photos.length >= minPhotos;

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - photos.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        onPhotosChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
    e.target.value = '';
  };

  const handleRemove = (idx: number) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1.5,
        flexWrap: 'wrap',
        gap: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon fontSize="small" sx={{ color: meetsMin ? 'success.main' : 'warning.main' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: meetsMin ? 'success.lighter' : 'warning.lighter',
              color: meetsMin ? 'success.dark' : 'warning.dark',
            }}
          >
            {photos.length}/{minPhotos}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {meetsMin ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: { xs: 'none', sm: 'inline' } }}>
                Lengkap
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />
              <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600, display: { xs: 'none', sm: 'inline' } }}>
                Minimal {minPhotos} foto wajib
              </Typography>
            </Box>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddPhotoIcon fontSize="small" />}
            onClick={() => inputRef.current?.click()}
            disabled={photos.length >= 10}
            sx={{ fontSize: 12 }}
          >
            Tambah
          </Button>
        </Box>
      </Box>

      {/* Progress bar */}
      {!meetsMin && (
        <LinearProgress
          variant="determinate"
          value={(photos.length / minPhotos) * 100}
          sx={{
            mb: 1.5,
            borderRadius: 1,
            height: 6,
            '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' },
            bgcolor: 'grey.200',
          }}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleAdd}
      />

      {/* Photo grid */}
      {photos.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 3 },
            borderStyle: 'dashed',
            borderColor: 'warning.main',
            bgcolor: 'warning.lighter',
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'warning.light' },
          }}
          onClick={() => inputRef.current?.click()}
        >
          <AddPhotoIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'warning.dark', mb: 0.5 }} />
          <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600 }}>
            Klik untuk upload foto bukti
          </Typography>
          <Typography variant="caption" sx={{ color: 'warning.dark' }}>
            Format: JPG, PNG, WEBP — Maks 10 foto
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1}>
          {photos.map((src, idx) => (
            <Grid size={{ xs: 4, sm: 4, md: 3 }} key={idx}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover .delete-btn': { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt={`Bukti foto ${idx + 1}`}
                  sx={{
                    width: '100%',
                    height: { xs: 100, sm: 120 },
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                {/* Overlay with number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>
                    {idx + 1}
                  </Typography>
                </Box>
                {/* Delete button */}
                <Tooltip title="Hapus foto">
                  <IconButton
                    size="small"
                    className="delete-btn"
                    onClick={() => handleRemove(idx)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'error.main',
                      color: '#fff',
                      opacity: { xs: 1, sm: 0 },
                      transition: 'opacity 0.2s',
                      '&:hover': { bgcolor: 'error.dark' },
                      width: 26,
                      height: 26,
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          ))}

          {/* Add more button */}
          {photos.length < 10 && (
            <Grid size={{ xs: 4, sm: 4, md: 3 }}>
              <Box
                onClick={() => inputRef.current?.click()}
                sx={{
                  height: { xs: 100, sm: 120 },
                  borderRadius: 2,
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <AddPhotoIcon sx={{ fontSize: { xs: 28, sm: 32 }, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                  Tambah
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Footer hint */}
      {meetsMin && (
        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
          {photos.length} foto bukti terlampir — form siap disubmit
        </Typography>
      )}
    </Box>
  );
}
