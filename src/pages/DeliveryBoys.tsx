import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Tag, Drawer,
  Statistic, Row, Col, Divider, List, message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import PageHeader from '../components/PageHeader';

export default function DeliveryBoys() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [payoutBoy, setPayoutBoy] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-delivery-boys'],
    queryFn: async () => unwrap(await api.get('/admin/delivery-boys')),
  });
  const { data: regions } = useQuery({
    queryKey: ['admin-regions'],
    queryFn: async () => unwrap(await api.get('/admin/regions')),
  });

  const save = useMutation({
    mutationFn: async (v: any) => {
      const payload = { ...v, payout_per_order: v.payout_per_order ?? null };
      return editing ? api.put(`/admin/delivery-boys/${editing.id}`, payload) : api.post('/admin/delivery-boys', payload);
    },
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-delivery-boys'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row)
      form.setFieldsValue({
        name: row.name, region_id: row.region_id, vehicle_type: row.vehicle_type,
        vehicle_number: row.vehicle_number, is_active: row.is_active,
        payout_per_order: row.payout_per_order != null ? Number(row.payout_per_order) : undefined,
      });
    else form.setFieldsValue({ is_active: true });
    setOpen(true);
  };

  const regionOptions = (regions ?? []).map((r: any) => ({ value: r.id, label: `${r.name} (${r.city})` }));

  return (
    <div>
      <PageHeader
        title={t('delivery_boys')}
        subtitle="Riders, payout rates and earnings"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
            {t('add')} {t('delivery_boys')}
          </Button>
        }
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: t('phone'), dataIndex: 'phone' },
          { title: 'Vehicle', dataIndex: 'vehicle_type' },
          {
            title: t('payout_rate'),
            dataIndex: 'payout_per_order',
            render: (v: any) => (v != null ? `₹${Number(v)}` : <Tag>default</Tag>),
          },
          {
            title: t('availability'),
            dataIndex: 'availability',
            render: (a: string) => <Tag color={a === 'online' ? 'green' : a === 'busy' ? 'orange' : 'default'}>{a}</Tag>,
          },
          { title: 'Deliveries', dataIndex: 'total_deliveries' },
          { title: t('active'), dataIndex: 'is_active', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{String(v)}</Tag> },
          {
            title: '',
            render: (row: any) => (
              <>
                <Button size="small" onClick={() => openEdit(row)}>{t('edit')}</Button>{' '}
                <Button size="small" type="link" onClick={() => setPayoutBoy(row)}>{t('payouts')}</Button>
              </>
            ),
          },
        ]}
      />

      <Modal open={open} title={editing ? t('edit') : t('add')} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText={t('save')} confirmLoading={save.isPending}>
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          {!editing && (
            <Form.Item name="phone" label={t('phone')} rules={[{ required: true, pattern: /^[6-9]\d{9}$/ } as any]}>
              <Input maxLength={10} addonBefore="+91" />
            </Form.Item>
          )}
          <Form.Item name="region_id" label="Region" rules={[{ required: true }]}>
            <Select options={regionOptions} />
          </Form.Item>
          <Form.Item name="vehicle_type" label="Vehicle type"><Input placeholder="bike" /></Form.Item>
          <Form.Item name="vehicle_number" label="Vehicle number"><Input /></Form.Item>
          <Form.Item name="payout_per_order" label={`${t('payout_rate')} (₹)`} tooltip={t('payout_rate_hint')}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="blank = global default" />
          </Form.Item>
          {editing && <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>}
        </Form>
      </Modal>

      <PayoutDrawer boy={payoutBoy} onClose={() => setPayoutBoy(null)} />
    </div>
  );
}

function PayoutDrawer({ boy, onClose }: { boy: any; onClose: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const enabled = !!boy;

  const { data } = useQuery({
    queryKey: ['boy-earnings', boy?.id],
    queryFn: async () => unwrap(await api.get(`/admin/delivery-boys/${boy.id}/earnings`)),
    enabled,
  });

  const pay = useMutation({
    mutationFn: (v: any) => api.post(`/admin/delivery-boys/${boy.id}/payout`, v),
    onSuccess: () => {
      message.success(t('payout_recorded'));
      form.resetFields();
      qc.invalidateQueries({ queryKey: ['boy-earnings', boy.id] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  return (
    <Drawer width={460} open={enabled} onClose={onClose} title={`${t('payouts')} — ${boy?.name ?? ''}`} destroyOnClose>
      <Row gutter={12}>
        <Col span={8}><Statistic title={t('earned')} value={data?.total_earned ?? 0} prefix="₹" /></Col>
        <Col span={8}><Statistic title={t('paid')} value={data?.total_paid ?? 0} prefix="₹" /></Col>
        <Col span={8}><Statistic title={t('due')} value={data?.due ?? 0} prefix="₹" valueStyle={{ color: (data?.due ?? 0) > 0 ? '#e23744' : '#0f9d58' }} /></Col>
      </Row>

      <Divider>{t('record_payout')}</Divider>
      <Form form={form} layout="vertical" onFinish={(v) => pay.mutate(v)}>
        <Form.Item name="amount" label={`${t('amount')} (₹)`} rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label="Method" initialValue="cash">
          <Select options={['cash', 'upi', 'bank', 'other'].map((x) => ({ value: x, label: x }))} />
        </Form.Item>
        <Form.Item name="note" label="Note"><Input.TextArea rows={2} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={pay.isPending}>{t('record_payout')}</Button>
      </Form>

      <Divider>{t('payout_history')}</Divider>
      <List
        size="small"
        dataSource={data?.payouts ?? []}
        locale={{ emptyText: '—' }}
        renderItem={(p: any) => (
          <List.Item>
            <span>{p.method} {p.note ? `• ${p.note}` : ''}</span>
            <span>₹{Number(p.amount)} · {new Date(p.created_at).toLocaleDateString()}</span>
          </List.Item>
        )}
      />
      <Divider>{t('earnings')}</Divider>
      <List
        size="small"
        dataSource={data?.earnings ?? []}
        locale={{ emptyText: '—' }}
        renderItem={(e: any) => (
          <List.Item>
            <span>{e.type}</span>
            <span>+₹{Number(e.amount)} · {new Date(e.created_at).toLocaleDateString()}</span>
          </List.Item>
        )}
      />
    </Drawer>
  );
}
