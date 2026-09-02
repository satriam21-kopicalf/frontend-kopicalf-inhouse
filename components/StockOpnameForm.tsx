'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

import type { Branch } from '@/lib/api/client';
import type { Product } from '@/lib/api/client';
import { useBranches, useProducts } from '@/lib/hooks/master-data';

// =============================================================================
// FORM SCHEMA
// =============================================================================

const detailSchema = z.object({
  productCode: z.string().min(1, 'Product must be selected'),
  balanceStock: z.number().min(0),
  actualStock: z.number().min(0, 'Physical stock minimum is 0'),
  notes: z.string().optional(),
});

const stockOpnameSchema = z.object({
  branchId: z.number().min(1, 'Outlet must be selected'),
  soDate: z.string().min(1, 'Date is required'),
  periodType: z.enum(['daily_packaging', 'weekly', 'monthly']),
  details: z.array(detailSchema).min(1, 'At least 1 product required'),
  notes: z.string().optional(),
});

export type StockOpnameFormValues = z.infer<typeof stockOpnameSchema>;

// =============================================================================
// COMPONENT
// =============================================================================

interface StockOpnameFormProps {
  initialValues?: Partial<StockOpnameFormValues>;
  onSubmit: (data: StockOpnameFormValues) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function StockOpnameForm({
  initialValues,
  onSubmit,
  onCancel,
  readOnly = false,
}: StockOpnameFormProps) {
  const { data: branches } = useBranches();
  const { data: products } = useProducts();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StockOpnameFormValues>({
    resolver: zodResolver(stockOpnameSchema),
    defaultValues: initialValues ?? {
      branchId: undefined,
      soDate: dayjs().format('YYYY-MM-DD'),
      periodType: 'daily_packaging',
      details: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' });
  const { watch } = form;
  const watchBranchId = watch('branchId');

  const selectedBranch = branches?.find((b: Branch) => b.branchID === watchBranchId);

  async function handleSubmit(values: StockOpnameFormValues) {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Info */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Stock Opname
              </Typography>
              <Typography color="text.secondary">
                entries will be saved as drafts — submit for manager approval when ready.
              </Typography>
            </Box>

            <Divider />

            {/* Branch & Date */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <Controller
                  name="branchId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error} size="small">
                      <InputLabel>Outlet / Branch</InputLabel>
                      <Select {...field} label="Outlet / Branch" disabled={readOnly}>
                        {(branches ?? []).map((b: Branch) => (
                          <MenuItem key={b.branchID} value={b.branchID}>
                            {b.branchName}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldState.error && (
                        <Typography color="error">
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: '150px' }}>
                <Controller
                  name="soDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Opname Date"
                      type="date"
                      disabled={readOnly}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: '150px' }}>
                <Controller
                  name="periodType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth size="small" error={!!fieldState.error}>
                      <InputLabel>Period Type</InputLabel>
                      <Select {...field} label="Period Type" disabled={readOnly}>
                        <MenuItem value="daily_packaging">Harian Packaging</MenuItem>
                        <MenuItem value="weekly">Mingguan</MenuItem>
                        <MenuItem value="monthly">Bulanan</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>
            </Box>

            <Divider />

            {/* Products Lines */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2">
                  Product List ({fields.length})
                </Typography>
                {!readOnly && (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      append({ productCode: '', balanceStock: 0, actualStock: 0, notes: '' })
                    }
                  >
                    Add Product
                  </Button>
                )}
              </Box>

              {fields.length === 0 && (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No products added yet.{' '}
                    {readOnly ? null : (
                      <Button
                        size="small"
                        onClick={() =>
                          append({ productCode: '', balanceStock: 0, actualStock: 0, notes: '' })
                        }
                      >
                        Add first product
                      </Button>
                    )}
                  </Typography>
                </Paper>
              )}

              {fields.map((f, idx) => {
                const bal = form.watch(`details.${idx}.balanceStock`) ?? 0;
                const act = form.watch(`details.${idx}.actualStock`) ?? 0;
                const diff = act - bal;

                return (
                  <Paper key={f.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'end', flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 5, minWidth: 0 }}>
                        <Controller
                          name={`details.${idx}.productCode`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <FormControl fullWidth size="small" error={!!fieldState.error}>
                              <InputLabel>Product</InputLabel>
                              <Select {...field} label="Product" disabled={readOnly}>
                                {(products ?? []).map((p: Product) => (
                                  <MenuItem key={p.productCode} value={p.productCode}>
                                    {p.name} ({p.productCode})
                                  </MenuItem>
                                ))}
                              </Select>
                              {fieldState.error && (
                                <Typography color="error">
                                  {fieldState.error.message}
                                </Typography>
                              )}
                            </FormControl>
                          )}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <Controller
                          name={`details.${idx}.balanceStock`}
                          control={form.control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              label="System Stock"
                              disabled
                            />
                          )}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <Controller
                          name={`details.${idx}.actualStock`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <TextField
                              {...field}
                              type="number"
                              size="small"
                              label="Physical Stock"
                              disabled={readOnly}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              slotProps={{ htmlInput: { min: 0 }}}
                            />
                          )}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: '100px' }}>
                        <TextField
                          size="small"
                          label="Selisih"
                          value={diff}
                          disabled
                          slotProps={{ htmlInput: { readOnly: true }}}
                          sx={{
                            '& .MuiInputBase-root': {
                              color: diff === 0 ? 'text.secondary' : diff < 0 ? 'error.main' : 'success.main',
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        {!readOnly && (
                          <IconButton
                            color="error"
                            onClick={() => remove(idx)}
                            disabled={fields.length === 0}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </Box>

            {/* Notes */}
            <Controller
              name="notes"
              control={form.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={2}
                  label="Catatan (opsional)"
                  placeholder="Tambahkan catatan jika ada"
                  disabled={readOnly}
                />
              )}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel} disabled={submitting}>
                  Cancel
                </Button>
              )}
              {!readOnly && (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={submitting || !form.formState.isDirty}
                >
                  {submitting ? <CircularProgress size={20} /> : 'Save Draft'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
