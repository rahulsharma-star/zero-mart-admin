import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, Space, Image, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';

export default function Banners() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => unwrap(await api.get('/admin/banners')),
  });

  const save = useMutation({
    mutationFn: async (v: any) => {
      const payload = {
        title: { en: v.title_en, hi: v.title_hi },
        image_url: v.image_url,
        action_type: v.action_type ?? 'none',
        action_value: v.action_value,
        sort_order: v.sort_order,
        is_active: v.is_active,
      };
      return editing ? api.put(`/admin/banners/${editing.id}`, payload) : api.post('/admin/banners', payload);
    },
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      message.success(t('deleted'));
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue({ title_en: row.title?.en, title_hi: row.title?.hi, image_url: row.image_url, action_type: row.action_type, action_value: row.action_value, sort_order: row.sort_order, is_active: row.is_active });
    else form.setFieldsValue({ is_active: true, sort_order: 0, action_type: 'none' });
    setOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
          {t('add')} {t('banners')}
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: '', dataIndex: 'image_url', width: 120, render: (u: string) => (u ? <Image src={u} width={100} height={50} style={{ borderRadius: 6, objectFit: 'cover' }} /> : null) },
          { title: 'Title', dataIndex: ['title', 'en'] },
          { title: 'Action', dataIndex: 'action_type' },
          { title: 'Sort', dataIndex: 'sort_order' },
          {
            title: '',
            render: (row: any) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>{t('edit')}</Button>
                <Popconfirm title={t('delete') + '?'} onConfirm={() => del.mutate(row.id)}>
                  <Button size="small" danger>{t('delete')}</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Modal open={open} title={editing ? t('edit') : t('add')} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText={t('save')} confirmLoading={save.isPending}>
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
          <Form.Item name="title_en" label="Title (English)"><Input /></Form.Item>
          <Form.Item name="title_hi" label="Title (Hindi)"><Input /></Form.Item>
          <Form.Item name="image_url" label={t('image_url')} rules={[{ required: true }]}><Input placeholder="https://..." /></Form.Item>
          <Form.Item name="action_type" label="Action">
            <Select options={['none', 'category', 'product', 'url'].map((x) => ({ value: x, label: x }))} />
          </Form.Item>
          <Form.Item name="action_value" label="Action value (slug / url)"><Input /></Form.Item>
          <Form.Item name="sort_order" label="Sort order"><InputNumber min={0} /></Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
