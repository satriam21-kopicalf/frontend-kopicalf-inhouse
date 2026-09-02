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
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

import type { Branch } from '@/lib/api/client';
import type { Product } from '@/lib/api/client';
import { useBranches, useProducts } from '@/lib/hooks/master-data';

// =============================================================================
// FORM SCHEMA
// =============================================================================

const detailSchema = z.object({
  productCode: z.string().min(1, 'Product is required'),
  qty: z.number().min(1, 'Minimum quantity is 1'),
  reason: z.enum(['expired', 'damaged', 'spill', 'other'], {
    required_error: 'Reason is required',
  }),
  notes: z.string().optional(),
});

const wasteSchema = z.object({
  branchId: z.number().min(1, 'Outlet must be selected'),
  wasteDate: z.string().min(1, 'Date is required'),
  details: z.array(detailSchema).min(1, 'At least 1 product required'),
  notes: z.string().optional(),
});

export type WasteFormValues = z.infer<typeof wasteSchema>;

// =============================================================================
// COMPONENT
// =============================================================================

interface WasteFormProps {
  initialValues?: Partial<WasteFormValues>;
  onSubmit: (data: WasteFormValues) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function WasteForm({
  initialValues,
  onSubmit,
  onCancel,
  readOnly = false,
}: WasteFormProps) {
  const { data: branches } = useBranches();
  const { data: products } = useProducts();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WasteFormValues>({
    resolver: zodResolver(wasteSchema),
    defaultValues: initialValues ?? {
      branchId: undefined,
      wasteDate: new Date().toISOString().split('T')[0],
      details: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' });

  async function handleSubmit(values: WasteFormValues) {
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
                Waste / Disposal
              </Typography>
              <Typography color="text.secondary">
                Record products that cannot be sold
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
                  name="wasteDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Waste Date"
                      type="date"
                      disabled={readOnly}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Box>
            </Box>

            <Divider />

            {/* Product Lines */}
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
                      append({ productCode: '', qty: 1, reason: 'other', notes: '' })
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
                          append({ productCode: '', qty: 1, reason: 'other', notes: '' })
                        }
                      >
                        Add first product
                      </Button>
                    )}
                  </Typography>
                </Paper>
              )}

              {fields.map((f, idx) => (
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

                    <Box sx={{ flex: 2, minWidth: '100px' }}>
                      <Controller
                        name={`details.${idx}.qty`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            type="number"
                            size="small"
                            label="Quantity"
                            disabled={readOnly}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            slotProps={{ htmlInput: { min: 1 }}}
                          />
                        )}
                      />
                    </Box>

                    <Box sx={{ flex: 3, minWidth: '120px' }}>
                      <Controller
                        name={`details.${idx}.reason`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <FormControl fullWidth size="small" error={!!fieldState.error}>
                            <InputLabel>Reason</InputLabel>
                            <Select {...field} label="Reason" disabled={readOnly}>
                              <MenuItem value="expired">Kedaluwarsa</MenuItem>
                              <MenuItem value="damaged">Rusak</MenuItem>
                              <MenuItem value="spill">Tumpah/Bocor</MenuItem>
                              <MenuItem value="other">Lainnya</MenuItem>
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

                  {/* Notes per item */}
                  <Box sx={{ mt: 1 }}>
                    <Controller
                      name={`details.${idx}.notes`}
                      control={form.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Catatan (opsional)"
                          placeholder="Add notes for this product"
                          disabled={readOnly}
                        />
                      )}
                    />
                  </Box>
                </Paper>
              ))}
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
                  label="General Notes (optional)"
                  placeholder="General notes for this waste record"
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
                  color="error"
                  type="submit"
                  disabled={submitting || !form.formState.isDirty}
                >
                  {submitting ? <CircularProgress size={20} /> : 'Save Waste'}
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
