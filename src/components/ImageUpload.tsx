import { useState } from 'react';
import { Upload, message, Button, Space } from 'antd';
import { UploadOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { api, unwrap, errMsg, assetUrl } from '../api/client';

/**
 * Image upload field. Designed to drop straight into an AntD <Form.Item> —
 * the form passes `value` (the stored "/uploads/..." path) and `onChange`.
 * Uploads go to POST /uploads and we keep only the returned relative path.
 */
export default function ImageUpload({
  value,
  onChange,
  height = 120,
}: {
  value?: string;
  onChange?: (v: string) => void;
  height?: number;
}) {
  const [loading, setLoading] = useState(false);

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = unwrap(res) as { path: string };
      onChange?.(data.path);
      onSuccess?.(data);
    } catch (e) {
      message.error(errMsg(e));
      onError?.(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {value && (
        <img
          src={assetUrl(value)}
          alt="preview"
          style={{
            width: '100%',
            maxWidth: 320,
            height,
            objectFit: 'cover',
            borderRadius: 10,
            border: '1px solid #eef0f3',
            display: 'block',
            marginBottom: 10,
          }}
        />
      )}
      <Space>
        <Upload accept="image/*" showUploadList={false} customRequest={customRequest} disabled={loading}>
          <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />} loading={loading}>
            {value ? 'Change image' : 'Upload image'}
          </Button>
        </Upload>
        {value && (
          <Button danger type="text" icon={<DeleteOutlined />} onClick={() => onChange?.('')}>
            Remove
          </Button>
        )}
      </Space>
    </div>
  );
}
