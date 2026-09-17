'use client';

import { useState } from 'react';
import { Modal, Form, Input, Radio, Space, Button, Typography, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => void;
  onReject: (reason: string) => void;
  title: string;
  itemName?: string;
  itemValue?: number;
  loading?: boolean;
}

export default function ApprovalModal({
  open,
  onClose,
  onApprove,
  onReject,
  title,
  itemName,
  itemValue,
  loading = false
}: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(notes || undefined);
    } else {
      if (!rejectReason.trim()) {
        return;
      }
      onReject(rejectReason);
    }
    // Reset state
    setAction('approve');
    setNotes('');
    setRejectReason('');
  };

  const handleClose = () => {
    setAction('approve');
    setNotes('');
    setRejectReason('');
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          {action === 'approve' ? (
            <CheckCircleOutlined style={{ color: '#52C41A' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#FF4D4F' }} />
          )}
          <span>{title}</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            style={{
              background: action === 'approve' ? '#52C41A' : '#FF4D4F',
              borderColor: action === 'approve' ? '#52C41A' : '#FF4D4F'
            }}
          >
            {action === 'approve' ? 'Setujui' : 'Tolak'}
          </Button>
        </Space>
      }
      width={500}
    >
      {/* Item Summary */}
      {itemName && (
        <Alert
          message="Item yang akan diproses"
          description={
            <div>
              <Text strong>{itemName}</Text>
              {itemValue !== undefined && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(itemValue)})
                </Text>
              )}
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Action Selection */}
      <Form layout="vertical">
        <Form.Item label="Action">
          <Radio.Group
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={{ marginBottom: 8 }}
          >
            <Radio.Button value="approve" style={{ borderColor: '#52C41A', color: '#52C41A' }}>
              <Space>
                <CheckCircleOutlined />
                Setujui
              </Space>
            </Radio.Button>
            <Radio.Button value="reject" style={{ borderColor: '#FF4D4F', color: '#FF4D4F' }}>
              <Space>
                <CloseCircleOutlined />
                Tolak
              </Space>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Approval Notes */}
        {action === 'approve' && (
          <Form.Item label="Catatan (Opsional)">
            <TextArea
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Item>
        )}

        {/* Rejection Reason */}
        {action === 'reject' && (
          <>
            <Form.Item
              label="Alasan Penolakan"
              required
              validateStatus={!rejectReason.trim() && rejectReason !== undefined ? 'error' : ''}
              help={!rejectReason.trim() && rejectReason !== undefined ? 'Alasan wajib diisi' : ''}
            >
              <TextArea
                rows={3}
                placeholder="Jelaskan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </Form.Item>
            <Alert
              message="Pastikan alasan penolakan jelas dan lengkap"
              type="warning"
              showIcon
            />
          </>
        )}
      </Form>
    </Modal>
  );
}
