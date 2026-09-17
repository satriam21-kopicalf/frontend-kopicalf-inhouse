'use client';

import { Timeline, Typography, Tag, Descriptions, Card, Space } from 'antd';
import {
  ClockCircleOutlined, UserOutlined, CheckCircleOutlined,
  CloseCircleOutlined, EditOutlined, SendOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

export interface AuditEntry {
  id: number;
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected';
  performed_by: string;
  performed_at: string;
  notes?: string;
  details?: string;
}

interface AuditTrailProps {
  entries: AuditEntry[];
  loading?: boolean;
}

const actionConfig = {
  created: {
    icon: <EditOutlined />,
    color: 'blue',
    label: 'Dibuat',
    tagColor: 'blue'
  },
  updated: {
    icon: <EditOutlined />,
    color: 'orange',
    label: 'Diupdate',
    tagColor: 'orange'
  },
  submitted: {
    icon: <SendOutlined />,
    color: 'cyan',
    label: 'Submitted',
    tagColor: 'cyan'
  },
  approved: {
    icon: <CheckCircleOutlined />,
    color: 'green',
    label: 'Disetujui',
    tagColor: 'green'
  },
  rejected: {
    icon: <CloseCircleOutlined />,
    color: 'red',
    label: 'Ditolak',
    tagColor: 'red'
  }
};

const AuditTrail: React.FC<AuditTrailProps> = ({ entries, loading }) => {
  if (loading) {
    return (
      <Card loading size="small" />
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card size="small">
        <Text type="secondary">Tidak ada history audit</Text>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Audit Trail</span>
        </Space>
      }
    >
      <Timeline
        mode="left"
        items={entries.map((entry) => {
          const config = actionConfig[entry.action] || actionConfig.updated;
          return {
            key: entry.id,
            color: config.color,
            icon: config.icon,
            children: (
              <Space direction="vertical" size={0}>
                <Space>
                  <Tag color={config.tagColor}>{config.label}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    oleh {entry.performed_by}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(entry.performed_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                {entry.notes && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Catatan: {entry.notes}
                  </Text>
                )}
                {entry.details && (
                  <Text style={{ fontSize: 12 }}>{entry.details}</Text>
                )}
              </Space>
            )
          };
        })}
      />
    </Card>
  );
};

export default AuditTrail;
