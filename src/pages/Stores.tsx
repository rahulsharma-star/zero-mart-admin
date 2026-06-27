import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import PageHeader from '../components/PageHeader';

export default function Stores() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: async () => unwrap(await api.get('/admin/stores')),
  });
  const { data: regions } = useQuery({
    queryKey: ['admin-regions'],
    queryFn: async () => unwrap(await api.get('/admin/regions')),
  });

  const save = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        region_id: values.region_id,
        name: values.name,
        address: values.address,
        phone: values.phone,
        whatsapp: values.whatsapp,
        lat: values.lat ?? undefined,
        lng: values.lng ?? undefined,
        commission_rate: values.commission_rate,
        is_active: values.is_active ?? true,
        owner: values.owner_phone ? { name: values.owner_name, phone: values.owner_phone } : undefined,
      };
      if (editing) return api.put(`/admin/stores/${editing.id}`, payload);
      return api.post('/admin/stores', payload);
    },
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-stores'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue({
        region_id: row.region_id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        whatsapp: row.whatsapp,
        lat: row.lat != null ? Number(row.lat) : undefined,
        lng: row.lng != null ? Number(row.lng) : undefined,
        commission_rate: row.commission_rate,
        is_active: row.is_active,
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
      });
    }
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Shops"
        subtitle="Onboard local vendors — each shop gets its own catalog and commission rate"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
            Add shop
          </Button>
        }
      />
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={stores ?? []}
        columns={[
          { title: 'Shop', dataIndex: 'name' },
          { title: 'Owner', render: (_: any, r: any) => r.owner_name ?? '—' },
          { title: 'Phone', dataIndex: 'phone' },
          { title: 'Commission %', dataIndex: 'commission_rate', render: (v: any) => (v != null ? `${v}%` : 'Global') },
          { title: 'Active', dataIndex: 'is_active', render: (v: boolean) => (v ? 'Yes' : 'No') },
          {
            title: '',
            render: (_: any, row: any) => (
              <Button size="small" onClick={() => openEdit(row)}>
                Edit
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} title={editing ? 'Edit shop' : 'Add shop'} onCancel={() => setOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)} initialValues={{ is_active: true }}>
          <Form.Item name="region_id" label="Region" rules={[{ required: true }]}>
            <Select options={(regions ?? []).map((r: any) => ({ value: r.id, label: `${r.name} (${r.city})` }))} />
          </Form.Item>
          <Form.Item name="name" label="Shop name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Shop phone">
            <Input />
          </Form.Item>
          <Form.Item name="whatsapp" label="WhatsApp">
            <Input placeholder="+91..." />
          </Form.Item>
          <Space>
            <Form.Item name="lat" label="Latitude" tooltip="Shop GPS latitude — used to show nearby shops by distance.">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="e.g. 26.9124" />
            </Form.Item>
            <Form.Item name="lng" label="Longitude" tooltip="Shop GPS longitude.">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="e.g. 75.7873" />
            </Form.Item>
          </Space>
          <Form.Item name="commission_rate" label="Commission % (blank = global default)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          {!editing && (
            <>
              <Form.Item name="owner_name" label="Owner name">
                <Input />
              </Form.Item>
              <Form.Item name="owner_phone" label="Owner mobile (vendor login)">
                <Input maxLength={10} />
              </Form.Item>
            </>
          )}
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={save.isPending} block>
            {t('save')}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
