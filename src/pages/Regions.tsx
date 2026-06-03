import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Tag, Drawer, InputNumber, Divider, List, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';

export default function Regions() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [drawer, setDrawer] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-regions'],
    queryFn: async () => unwrap(await api.get('/admin/regions')),
  });

  const createRegion = useMutation({
    mutationFn: (v: any) => api.post('/admin/regions', v),
    onSuccess: () => { message.success(t('saved')); setOpen(false); qc.invalidateQueries({ queryKey: ['admin-regions'] }); },
    onError: (e) => message.error(errMsg(e)),
  });

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ currency: 'INR', is_active: true }); setOpen(true); }}>
          {t('add')} {t('regions')}
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: t('city'), dataIndex: 'city' },
          { title: 'Currency', dataIndex: 'currency' },
          { title: t('active'), dataIndex: 'is_active', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{String(v)}</Tag> },
          { title: '', render: (row: any) => <Button size="small" onClick={() => setDrawer(row)}>Pricing & Pincodes</Button> },
        ]}
      />

      <Modal open={open} title={`${t('add')} ${t('regions')}`} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText={t('save')} confirmLoading={createRegion.isPending}>
        <Form form={form} layout="vertical" onFinish={(v) => createRegion.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="New Delhi - South" /></Form.Item>
          <Form.Item name="city" label={t('city')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="state" label="State"><Input /></Form.Item>
          <Form.Item name="currency" label="Currency"><Input maxLength={3} /></Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>

      <RegionDrawer region={drawer} onClose={() => setDrawer(null)} />
    </div>
  );
}

function RegionDrawer({ region, onClose }: { region: any; onClose: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [pform] = Form.useForm();
  const [pincode, setPincode] = useState('');
  const enabled = !!region;

  const { data: pricing } = useQuery({
    queryKey: ['region-pricing', region?.id],
    queryFn: async () => unwrap(await api.get(`/admin/regions/${region.id}/pricing`)),
    enabled,
  });
  const { data: pincodes } = useQuery({
    queryKey: ['region-pincodes', region?.id],
    queryFn: async () => unwrap(await api.get(`/admin/regions/${region.id}/pincodes`)),
    enabled,
  });

  const savePricing = useMutation({
    mutationFn: (v: any) => api.put(`/admin/regions/${region.id}/pricing`, v),
    onSuccess: () => { message.success(t('saved')); qc.invalidateQueries({ queryKey: ['region-pricing', region.id] }); },
    onError: (e) => message.error(errMsg(e)),
  });
  const addPin = useMutation({
    mutationFn: (code: string) => api.post(`/admin/regions/${region.id}/pincodes`, { pincode: code }),
    onSuccess: () => { setPincode(''); qc.invalidateQueries({ queryKey: ['region-pincodes', region.id] }); },
    onError: (e) => message.error(errMsg(e)),
  });
  const delPin = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/pincodes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['region-pincodes', region.id] }),
  });

  return (
    <Drawer width={460} open={enabled} onClose={onClose} title={region?.name} destroyOnClose>
      {pricing !== undefined && (
        <Form
          form={pform}
          layout="vertical"
          initialValues={{
            base_delivery_fee: Number(pricing?.base_delivery_fee ?? 20),
            min_order_value: Number(pricing?.min_order_value ?? 99),
            free_delivery_above: pricing?.free_delivery_above != null ? Number(pricing.free_delivery_above) : undefined,
            surge_multiplier: Number(pricing?.surge_multiplier ?? 1),
            surge_active: pricing?.surge_active ?? false,
            promo_discount: Number(pricing?.promo_discount ?? 0),
          }}
          onFinish={(v) => savePricing.mutate(v)}
        >
          <Divider>Delivery pricing (₹)</Divider>
          <Form.Item name="base_delivery_fee" label="Base delivery fee"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="min_order_value" label="Minimum order value"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="free_delivery_above" label="Free delivery above"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="surge_multiplier" label="Surge multiplier"><InputNumber min={1} step={0.1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="surge_active" label="Surge active" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="promo_discount" label="Promo discount (off fee)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Button type="primary" htmlType="submit" loading={savePricing.isPending}>{t('save')}</Button>
        </Form>
      )}

      <Divider>{t('pincodes') || 'Service pincodes'}</Divider>
      <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
        <Input placeholder="6-digit pincode" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
        <Button type="primary" disabled={pincode.length !== 6} loading={addPin.isPending} onClick={() => addPin.mutate(pincode)}>{t('add')}</Button>
      </Space.Compact>
      <List
        size="small"
        bordered
        dataSource={pincodes ?? []}
        renderItem={(p: any) => (
          <List.Item actions={[<a key="d" onClick={() => delPin.mutate(p.id)} style={{ color: '#e23744' }}>{t('delete')}</a>]}>
            {p.pincode} {p.area_name ? `— ${p.area_name}` : ''}
          </List.Item>
        )}
      />
    </Drawer>
  );
}
