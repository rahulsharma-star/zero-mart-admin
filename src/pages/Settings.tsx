import { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Input, Button, message, Divider } from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import PageHeader from '../components/PageHeader';

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
        urgent_fee: data.urgent_fee,
        support_phone: data.support_phone,
        whatsapp_number: data.whatsapp_number,
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
    <div>
      <PageHeader title={t('settings')} subtitle="Global defaults used when a region has no override" />
      <Card style={{ maxWidth: 560 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="delivery_fee" label="Delivery fee (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="free_delivery_above" label="Free delivery above (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="min_order_value" label="Minimum order value (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="urgent_fee" label="Urgent / express fee (₹)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Divider>Customer support</Divider>
        <Form.Item name="support_phone" label="Support / Call number" extra="Customers tap to call (e.g. +919876543210)"><Input placeholder="+91XXXXXXXXXX" /></Form.Item>
        <Form.Item name="whatsapp_number" label="WhatsApp number" extra="Used for the WhatsApp chat & order-confirm button in the app"><Input placeholder="+91XXXXXXXXXX" /></Form.Item>
        <Divider>Store info (JSON, multilingual)</Divider>
        <Input.TextArea rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} style={{ fontFamily: 'monospace' }} />
        <Button type="primary" htmlType="submit" loading={save.isPending} style={{ marginTop: 16 }}>
          {t('save')}
        </Button>
      </Form>
      </Card>
    </div>
  );
}
