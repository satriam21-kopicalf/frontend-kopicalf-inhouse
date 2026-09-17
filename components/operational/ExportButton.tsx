'use client';

import { useState } from 'react';
import { Button, Dropdown, MenuProps, Modal, Radio, Space, Typography, message } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileTextOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

type ExportFormat = 'pdf' | 'excel' | 'print';

interface ExportButtonProps {
  title: string;
  data: Record<string, unknown>[];
  columns: {
    key: string;
    title: string;
    dataIndex?: string;
    render?: (value: unknown, record: Record<string, unknown>, index: number) => React.ReactNode;
  }[];
  filename?: string;
  onExport?: (format: ExportFormat, data: Record<string, unknown>[]) => void;
}

export default function ExportButton({
  title,
  data,
  columns,
  filename,
  onExport
}: ExportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('print');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // Call custom export handler if provided
      if (onExport) {
        await onExport(format, data);
      } else {
        // Default implementation
        switch (format) {
          case 'print':
            handlePrint();
            break;
          case 'pdf':
            handlePDF();
            break;
          case 'excel':
            handleExcel();
            break;
        }
      }
      setModalOpen(false);
      message.success(`Berhasil export ke ${format.toUpperCase()}`);
    } catch (error) {
      message.error('Gagal export data');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handlePDF = () => {
    // For PDF, we use browser print with PDF destination
    // In production, you might want to use jsPDF or similar library
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleExcel = () => {
    // Generate CSV for Excel compatibility
    const headers = columns.map(col => col.title).join(',');
    const rows = data.map(record =>
      columns.map(col => {
        const value = record[col.key] ?? '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    // Download as file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename || title}_${dayjs().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintContent = () => {
    const tableRows = data.map((record, index) =>
      `<tr>${columns.map(col => {
        let value = record[col.key] ?? '';
        if (col.render) {
          // Simple text extraction for render functions
          value = String(value);
        }
        return `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td>`;
      }).join('')}</tr>`
    ).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { font-size: 20px; margin-bottom: 5px; }
    .subtitle { color: #666; margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f5f5f5; padding: 10px 8px; border: 1px solid #ddd; text-align: left; font-weight: bold; }
    td { padding: 8px; border: 1px solid #ddd; }
    .footer { margin-top: 20px; font-size: 10px; color: #999; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Dicetak: ${dayjs().format('DD MMMM YYYY, HH:mm')}</p>
  <table>
    <thead>
      <tr>${columns.map(col => `<th>${col.title}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <p class="footer">
    ${title} - Kopi Calf Dashboard
  </p>
</body>
</html>`;
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'print',
      icon: <FileTextOutlined />,
      label: 'Print / Save as PDF',
      onClick: () => {
        setFormat('print');
        setModalOpen(true);
      }
    },
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Export to CSV/Excel',
      onClick: () => {
        setFormat('excel');
        setModalOpen(true);
      }
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button icon={<DownloadOutlined />}>
          Export
        </Button>
      </Dropdown>

      <Modal
        title="Export Data"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              icon={format === 'excel' ? <FileExcelOutlined /> : format === 'pdf' ? <FilePdfOutlined /> : <FileTextOutlined />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Pilih format export:</Text>
          </div>
          <Radio.Group
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <Radio value="print">
              <Space>
                <FileTextOutlined />
                <div>
                  <Text strong>Print / Save as PDF</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cetak langsung atau simpan sebagai PDF
                  </Text>
                </div>
              </Space>
            </Radio>
            <Radio value="excel">
              <Space>
                <FileExcelOutlined />
                <div>
                  <Text strong>Export to CSV/Excel</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Download sebagai file CSV untuk Excel
                  </Text>
                </div>
              </Space>
            </Radio>
          </Radio.Group>

          <div style={{
            background: '#F7F7F7',
            padding: 12,
            borderRadius: 6,
            fontSize: 12
          }}>
            <Text type="secondary">
              <strong>Preview:</strong> {data.length} record akan di-export
            </Text>
          </div>
        </Space>
      </Modal>
    </>
  );
}
