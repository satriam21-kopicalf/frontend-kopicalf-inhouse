'use client';

import { useState } from 'react';
import { Upload, Modal, Button, Image, Typography, Space, message } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Text } = Typography;

interface PhotoUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  required?: boolean;
  wasteType?: string;
}

export default function PhotoUpload({
  value = [],
  onChange,
  maxCount = 5,
  required = false,
  wasteType
}: PhotoUploadProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, index) => ({
      uid: `-${index}`,
      name: `photo-${index + 1}`,
      status: 'done',
      url: url,
    }))
  );

  const isExpiredType = wasteType === 'expired';
  const isDamagedType = wasteType === 'damaged';

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Convert to URL strings for submission
    const urls = newFileList
      .filter(file => file.status === 'done')
      .map(file => file.url || file.response?.url || '')
      .filter(Boolean);

    setFileList(newFileList);
    onChange?.(urls);
  };

  const handlePreview = async (file: UploadFile) => {
    let url = file.url || file.response?.url || '';
    if (!url && file.originFileObj) {
      url = URL.createObjectURL(file.originFileObj);
    }
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const handleRemove = (file: UploadFile) => {
    const newUrls = fileList
      .filter(f => f.uid !== file.uid)
      .map(f => f.url || f.response?.url || '')
      .filter(Boolean);
    onChange?.(newUrls);
  };

  const uploadButton = (
    <div style={{ padding: 8 }}>
      <PlusOutlined />
      <div style={{ marginTop: 8, fontSize: 12 }}>
        {maxCount - fileList.length > 0 ? `Upload (${fileList.length}/${maxCount})` : 'Max reached'}
      </div>
    </div>
  );

  // Determine if photo is required based on waste type
  const isRequired = required || isExpiredType || isDamagedType;

  return (
    <div>
      {/* Warning for certain waste types */}
      {(isExpiredType || isDamagedType) && (
        <div style={{
          background: '#FFFBE6',
          border: '1px solid #FAAD14',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Text style={{ fontSize: 12, color: '#8A6D3B' }}>
            <Text strong style={{ color: '#FAAD14' }}>⚠️ Rekomendasi:</Text> Foto dokumentasi sangat disarankan untuk tipe waste <Text strong>{isExpiredType ? 'Expired' : 'Damaged'}</Text>
          </Text>
        </div>
      )}

      {/* Required indicator */}
      {isRequired && (
        <Text type="danger" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
          * Foto dokumentasi wajib dilampirkan
        </Text>
      )}

      <Upload
        action="/api/v1/upload"
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
        beforeUpload={(file) => {
          const isImage = file.type.startsWith('image/');
          if (!isImage) {
            message.error('Hanya file gambar yang dapat diupload!');
            return false;
          }
          const isLt5M = file.size / 1024 / 1024 < 5;
          if (!isLt5M) {
            message.error('Ukuran file maksimal 5MB!');
            return false;
          }
          return true;
        }}
        maxCount={maxCount}
        accept="image/*"
      >
        {fileList.length < maxCount && uploadButton}
      </Upload>

      {/* Tips */}
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
        Format: JPG, PNG, WEBP. Maksimal 5MB per foto.
      </Text>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        title="Preview Foto"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        width={800}
      >
        <Image
          src={previewImage}
          alt="Preview"
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  );
}
