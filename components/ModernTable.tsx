'use client';

import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Paper, IconButton,
  Tooltip, TextField, InputAdornment, Skeleton, Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useState, useMemo, useCallback } from 'react';

export interface TableColumn<T> {
  id: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

export interface TableAction {
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'inherit';
  onClick: (row: unknown) => void;
  disabled?: (row: unknown) => boolean;
  tooltip?: string;
}

export interface ModernTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T & string;
  actions?: TableAction[];
  searchPlaceholder?: string;
  searchFields?: (keyof T & string)[];
  onSearch?: (query: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  getRowColor?: (row: T) => 'default' | 'warning' | 'error' | 'success';
  getBadge?: (row: T) => { label: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' };
}

function ModernTable<T extends object>({
  title,
  subtitle,
  columns,
  data,
  keyField,
  actions = [],
  searchPlaceholder = 'Search...',
  searchFields = [],
  onSearch,
  loading = false,
  error = null,
  onRefresh,
  onAdd,
  addButtonLabel = 'Add New',
  emptyMessage = 'No data available.',
  pagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 50,
  getRowColor,
  getBadge,
}: ModernTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();

    return data.filter((row) => {
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const value = row[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(q);
        });
      }
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, query, searchFields]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage, pagination]);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setPage(0);
    onSearch?.(value);
  }, [onSearch]);

  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  const startIndex = page * rowsPerPage + 1;
  const endIndex = Math.min((page + 1) * rowsPerPage, filteredData.length);

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {title && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 240 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAdd && (
              <Tooltip title={addButtonLabel}>
                <IconButton
                  size="small"
                  onClick={onAdd}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ p: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height={48} sx={{ mb: 0.5 }} animation="wave" />
          ))}
        </Box>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table
              size="medium"
              sx={{
                minWidth: { xs: 500, sm: 600 },
                '& .MuiTableCell-root': {
                  px: { xs: 1.5, sm: 2 },
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align || 'left'}
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: 11, sm: 13 },
                        py: 1.25,
                        width: col.width,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, fontSize: { xs: 11, sm: 13 }, py: 1.25, width: actions.length * 40 }}
                    >
                      Act
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row) => {
                  const keyValue = row[keyField];
                  const rowColor = getRowColor?.(row);
                  const badge = getBadge?.(row);

                  return (
                    <TableRow
                      key={String(keyValue)}
                      hover
                      sx={{
                        '&:last-child td': { border: 0 },
                        ...(rowColor === 'warning' && { bgcolor: 'warning.lighter' }),
                        ...(rowColor === 'error' && { bgcolor: 'error.lighter' }),
                        ...(rowColor === 'success' && { bgcolor: 'success.lighter' }),
                      }}
                    >
                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align || 'left'}
                          sx={{
                            py: 1.25,
                            fontSize: { xs: 12, sm: 14 },
                          }}
                        >
                          {col.render
                            ? col.render(row)
                            : String((row as Record<string, unknown>)[col.id] ?? '-')
                          }
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell align="center" sx={{ py: 0.75 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {actions.map((action) => {
                              const isDisabled = action.disabled?.(row) ?? false;
                              return (
                                <Tooltip key={action.label} title={action.tooltip || action.label}>
                                  <IconButton
                                    size="small"
                                    color={action.color || 'default'}
                                    onClick={() => action.onClick(row)}
                                    disabled={isDisabled}
                                    sx={{
                                      p: 0.5,
                                      '&:hover': {
                                        bgcolor: `${action.color || 'default'}.lighter`,
                                      },
                                    }}
                                  >
                                    {action.icon}
                                  </IconButton>
                                </Tooltip>
                              );
                            })}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}

                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)}
                      sx={{ textAlign: 'center', py: 5 }}
                    >
                      <Box sx={{ py: 2 }}>
                        <SearchIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {emptyMessage}
                        </Typography>
                        {query && (
                          <Typography variant="caption" color="text.disabled">
                            No results for "{query}"
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination && filteredData.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1,
                px: { xs: 1.5, sm: 2 },
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: { xs: 'center', sm: 'left' } }}
              >
                {startIndex}-{endIndex} of {filteredData.length}
                {query && ` (from ${data.length})`}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Rows:
                </Typography>
                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  sx={{
                    minWidth: 70,
                    '& .MuiSelect-select': { py: 0.5, fontSize: 12 },
                  }}
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </TextField>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(null, page - 1)}
                    disabled={page === 0}
                    sx={{ p: 0.5 }}
                  >
                    ‹
                  </IconButton>
                  <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {page + 1}/{Math.ceil(filteredData.length / rowsPerPage)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleChangePage(null, page + 1)}
                    disabled={page >= Math.ceil(filteredData.length / rowsPerPage) - 1}
                    sx={{ p: 0.5 }}
                  >
                    ›
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}

export default ModernTable;
