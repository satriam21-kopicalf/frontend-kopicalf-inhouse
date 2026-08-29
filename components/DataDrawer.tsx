'use client';

import {
  Drawer, Box, Typography, TextField, Button, IconButton,
  Divider, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel,
  Alert, CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export type DrawerMode = 'add' | 'edit' | 'delete' | null;

export interface DrawerField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'switch' | 'readonly';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  gridSpan?: 1 | 2;
  disabled?: boolean;
}

interface DataDrawerProps {
  open: boolean;
  mode: DrawerMode;
  title: string;
  subtitle?: string;
  fields: DrawerField[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onSave: () => void;
  onDelete?: () => void;
  onClose: () => void;
  saving?: boolean;
  deleteLoading?: boolean;
  saveLabel?: string;
  width?: number | string;
}

const fmtCurr = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

export default function DataDrawer({
  open,
  mode,
  title,
  subtitle,
  fields,
  values,
  onChange,
  onSave,
  onDelete,
  onClose,
  saving = false,
  deleteLoading = false,
  saveLabel = 'Save',
  width = 480,
}: DataDrawerProps) {
  const isDelete = mode === 'delete';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width,
            maxWidth: '100vw',
            borderRadius: '16px 0 0 16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
        backdrop: {
          sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.4)' },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: isDelete
            ? 'error.lighter'
            : mode === 'add'
            ? 'primary.lighter'
            : 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: isDelete ? 'error.dark' : mode === 'add' ? 'primary.dark' : 'text.primary',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {mode === 'add' ? `Add ${title}` : mode === 'edit' ? `Edit ${title}` : mode === 'delete' ? `Delete ${title}` : title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={saving || deleteLoading}
          sx={{
            color: isDelete ? 'error.dark' : 'text.secondary',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Delete confirmation */}
        {isDelete && (
          <Box sx={{ px: 3, py: 3 }}>
            <Alert
              severity="error"
              icon={<WarningIcon fontSize="large" />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                You are about to permanently delete this record.
              </Typography>
            </Alert>

            <Box
              sx={{
                bgcolor: 'grey.50',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              {fields
                .filter((f) => f.type !== 'switch')
                .slice(0, 5)
                .map((field) => (
                  <Box key={field.name} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>
                      {field.label}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {field.type === 'readonly'
                        ? String(values[field.name] ?? '-')
                        : typeof values[field.name] === 'number' && field.name.toLowerCase().includes('price')
                        ? fmtCurr(values[field.name] as number)
                        : String(values[field.name] ?? '-')}
                    </Typography>
                  </Box>
                ))}
            </Box>

            <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
              This action cannot be undone. Are you sure?
            </Typography>
          </Box>
        )}

        {/* Form content */}
        {!isDelete && (
          <Box
            sx={{
              px: 3,
              py: 2.5,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              {fields.map((field) => {
                const value = values[field.name];

                if (field.type === 'readonly') {
                  return (
                    <Box
                      key={field.name}
                      sx={{ gridColumn: field.gridSpan === 2 ? '1 / -1' : undefined }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25, display: 'block', fontSize: 11 }}>
                        {field.label}
                      </Typography>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: 13,
                          fontWeight: 500,
                          minHeight: 36,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {value != null && value !== '' ? String(value) : '-'}
                      </Box>
                    </Box>
                  );
                }

                if (field.type === 'switch') {
                  return (
                    <Box
                      key={field.name}
                      sx={{ gridColumn: field.gridSpan === 2 ? '1 / -1' : undefined }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(value)}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                            disabled={saving}
                            color="success"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {field.label}
                          </Typography>
                        }
                      />
                    </Box>
                  );
                }

                if (field.type === 'select') {
                  const selectValue = value != null && value !== '' ? String(value) : '';
                  return (
                    <FormControl
                      key={field.name}
                      size="small"
                      fullWidth
                      sx={{ gridColumn: field.gridSpan === 2 ? '1 / -1' : undefined }}
                    >
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        value={selectValue}
                        label={field.label}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        disabled={saving || field.disabled}
                      >
                        {field.options?.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }

                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    type={field.type ?? 'text'}
                    size="small"
                    fullWidth
                    value={value ?? ''}
                    onChange={(e) => {
                      const v = field.type === 'number'
                        ? (e.target.value === '' ? '' : Number(e.target.value))
                        : e.target.value;
                      onChange(field.name, v);
                    }}
                    disabled={saving || field.disabled}
                    required={field.required}
                    placeholder={field.placeholder}
                    slotProps={{
                      htmlInput: field.type === 'number' ? { inputProps: { min: 0 } } : undefined,
                    }}
                    sx={{ gridColumn: field.gridSpan === 2 ? '1 / -1' : undefined }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer Actions - always visible */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        {isDelete ? (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={deleteLoading}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              onClick={onDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={saving}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : saveLabel}
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
