import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, Image, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg, assetUrl } from '../api/client';
import PageHeader from '../components/PageHeader';
import ImageUpload from '../components/ImageUpload';

export default function Categories() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => unwrap(await api.get('/admin/categories')),
  });

  const save = useMutation({
    mutationFn: async (v: any) => {
      const payload = { name: { en: v.name_en, hi: v.name_hi }, image_url: v.image_url, sort_order: v.sort_order, is_active: v.is_active };
      return editing ? api.put(`/admin/categories/${editing.id}`, payload) : api.post('/admin/categories', payload);
    },
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      message.success(t('deleted'));
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue({ name_en: row.name?.en, name_hi: row.name?.hi, image_url: row.image_url, sort_order: row.sort_order, is_active: row.is_active });
    else form.setFieldsValue({ is_active: true, sort_order: 0 });
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title={t('categories')}
        subtitle="Organise products into shoppable groups"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
            {t('add')} {t('categories')}
          </Button>
        }
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: '', dataIndex: 'image_url', width: 64, render: (u: string) => (u ? <Image src={assetUrl(u)} width={44} height={44} style={{ borderRadius: 6, objectFit: 'cover' }} /> : null) },
          { title: t('name_en'), dataIndex: ['name', 'en'] },
          { title: t('name_hi'), dataIndex: ['name', 'hi'] },
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
          <Form.Item name="name_en" label={t('name_en')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name_hi" label={t('name_hi')}><Input /></Form.Item>
          <Form.Item name="image_url" label={t('image_url')}><ImageUpload height={120} /></Form.Item>
          <Form.Item name="sort_order" label="Sort order"><InputNumber min={0} /></Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
