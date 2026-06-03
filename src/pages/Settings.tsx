import { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Input, Button, message, Divider } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';

export default function Settings() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [raw, setRaw] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => unwrap(await api.get('/admin/settings')),
  });

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        delivery_fee: data.delivery_fee,
        free_delivery_above: data.free_delivery_above,
        min_order_value: data.min_order_value,
        support_phone: data.support_phone,
      });
      setRaw(JSON.stringify(data.store ?? {}, null, 2));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: any) => api.put('/admin/settings', payload),
    onSuccess: () => message.success(t('saved')),
    onError: (e) => message.error(errMsg(e)),
  });

  const onFinish = (v: any) => {
    let store;
    try {
      store = JSON.parse(raw || '{}');
    } catch {
      message.error('Store JSON invalid');
      return;
    }
    save.mutate({ ...v, store });
  };

  return (
    <Card title={t('settings')} style={{ maxWidth: 560 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="delivery_fee" label="Delivery fee (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="free_delivery_above" label="Free delivery above (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="min_order_value" label="Minimum order value (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="support_phone" label="Support phone"><Input /></Form.Item>
        <Divider>Store info (JSON, multilingual)</Divider>
        <Input.TextArea rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} style={{ fontFamily: 'monospace' }} />
        <Button type="primary" htmlType="submit" loading={save.isPending} style={{ marginTop: 16 }}>
          {t('save')}
        </Button>
      </Form>
    </Card>
  );
}
