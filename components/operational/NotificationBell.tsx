'use client';

import { useState, useEffect } from 'react';
import { Badge, List, Typography, Button, Space, Empty, Spin, Card } from 'antd';
import {
  BellOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import type { NotificationArgsProps } from 'antd';

const { Text, Title } = Typography;

export interface ApprovalNotification {
  id: number;
  type: 'stock_opname' | 'waste_form' | 'tools_request' | 'heavy_tools' | 'facility_request';
  title: string;
  message: string;
  document_id: number;
  document_num: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  read?: boolean;
  action_url?: string;
}

interface NotificationBellProps {
  onNotificationClick?: (notification: ApprovalNotification) => void;
  refreshInterval?: number; // in milliseconds
}

const typeLabels = {
  stock_opname: 'Stock Opname',
  waste_form: 'Waste Form',
  tools_request: 'Tools Request',
  heavy_tools: 'Heavy Tools',
  facility_request: 'Facility Request'
};

const priorityColors = {
  low: 'default',
  medium: 'warning',
  high: 'error'
};

// Shared function for status icons
const getStatusIcon = (status: ApprovalNotification['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'rejected':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    case 'pending':
    default:
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
  }
};

const NotificationBell: React.FC<NotificationBellProps> = ({
  onNotificationClick,
  refreshInterval = 60000 // default 1 minute
}) => {
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mock notifications for demo
  const mockNotifications: ApprovalNotification[] = [
    {
      id: 1,
      type: 'waste_form',
      title: 'Waste Form Pending Approval',
      message: 'Waste Form #WF-2026-0002 dari KC-CPT memerlukan persetujuan Anda',
      document_id: 2,
      document_num: 'WF-2026-0002',
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'stock_opname',
      title: 'Stock Opname Pending Approval',
      message: 'Stock Opname #SO-2026-0003 dari KC-BDG memerlukan persetujuan Anda',
      document_id: 3,
      document_num: 'SO-2026-0003',
      status: 'pending',
      priority: 'high',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'waste_form',
      title: 'Waste Form Approved',
      message: 'Waste Form #WF-2026-0001 telah disetujui oleh Manager',
      document_id: 1,
      document_num: 'WF-2026-0001',
      status: 'approved',
      priority: 'low',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      read: true
    }
  ];

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // In real app, this would call the API
      // const response = await fetch('/api/v1/notifications');
      // const data = await response.json();
      // setNotifications(data);

      // For now, use mock data
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleNotificationClick = (notification: ApprovalNotification) => {
    markAsRead(notification.id);
    setVisible(false);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <>
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          onClick={() => setVisible(!visible)}
          style={{ color: unreadCount > 0 ? '#1890ff' : undefined }}
        />
      </Badge>

      {visible && (
        <Card
          className="notification-dropdown"
          style={{
            position: 'absolute',
            top: 60,
            right: 20,
            width: 380,
            zIndex: 1000,
            maxHeight: 500,
            overflow: 'auto'
          }}
          size="small"
          title={
            <Space>
              <BellOutlined />
              <span>Notifikasi</span>
              {unreadCount > 0 && (
                <Badge count={unreadCount} size="small" />
              )}
            </Space>
          }
          extra={
            <Button type="link" size="small" onClick={() => setNotifications([])}>
              Tandai semua dibaca
            </Button>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin />
            </div>
          ) : notifications.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Tidak ada notifikasi"
            />
          ) : (
            <List
              size="small"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  style={{
                    background: item.read ? 'transparent' : '#f0f7ff',
                    cursor: 'pointer',
                    padding: '8px 12px'
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(item.status)}
                    title={
                      <Space>
                        <Text strong={!item.read}>{item.title}</Text>
                        <Badge
                          status={priorityColors[item.priority] as any}
                          text={item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : 'Low'}
                        />
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.message}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </>
  );
};

// Standalone notification list component for use in detail pages
interface NotificationListProps {
  notifications: ApprovalNotification[];
  loading?: boolean;
  onItemClick?: (notification: ApprovalNotification) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  onItemClick
}) => {
  if (loading) {
    return <Spin />;
  }

  if (notifications.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Tidak ada notifikasi"
      />
    );
  }

  return (
    <List
      size="small"
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          style={{
            background: item.read ? 'transparent' : '#f0f7ff',
            cursor: 'pointer'
          }}
          onClick={() => onItemClick?.(item)}
        >
          <List.Item.Meta
            avatar={getStatusIcon(item.status)}
            title={
              <Space>
                <Text strong={!item.read}>{item.title}</Text>
                <Badge
                  status={priorityColors[item.priority] as any}
                  text={typeLabels[item.type]}
                />
              </Space>
            }
            description={
              <Space direction="vertical" size={0}>
                <Text type="secondary">{item.message}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default NotificationBell;
