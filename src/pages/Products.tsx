import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Image,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';

export default function Products() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => unwrap(await api.get('/admin/products', { params: { limit: 100 } })),
  });
  const { data: cats } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => unwrap(await api.get('/admin/categories')),
  });

  const save = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        category_id: values.category_id ?? null,
        name: { en: values.name_en, hi: values.name_hi },
        description: { en: values.desc_en, hi: values.desc_hi },
        unit: values.unit,
        price: values.price,
        mrp: values.mrp,
        stock: values.stock,
        image_url: values.image_url,
        is_active: values.is_active,
      };
      if (editing) return api.put(`/admin/products/${editing.id}`, payload);
      return api.post('/admin/products', payload);
    },
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      message.success(t('deleted'));
      qc.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue({
        name_en: row.name?.en,
        name_hi: row.name?.hi,
        desc_en: row.description?.en,
        desc_hi: row.description?.hi,
        unit: row.unit,
        price: Number(row.price),
        mrp: row.mrp ? Number(row.mrp) : undefined,
        stock: row.stock,
        image_url: row.image_url,
        category_id: row.category_id,
        is_active: row.is_active,
      });
    } else {
      form.setFieldsValue({ is_active: true, stock: 0, price: 0 });
    }
    setOpen(true);
  };

  const catName = (id: string) => {
    const c = (cats ?? []).find((x: any) => x.id === id);
    return c ? c.name?.en : '-';
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>
          {t('add')} {t('products')}
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.items ?? []}
        columns={[
          {
            title: '',
            dataIndex: 'image_url',
            width: 64,
            render: (url: string) => (url ? <Image src={url} width={44} height={44} style={{ objectFit: 'cover', borderRadius: 6 }} /> : null),
          },
          { title: t('name_en'), dataIndex: ['name', 'en'] },
          { title: t('category'), dataIndex: 'category_id', render: catName },
          { title: t('unit'), dataIndex: 'unit' },
          { title: t('price'), dataIndex: 'price', render: (v: string) => `₹${Number(v).toFixed(2)}` },
          { title: t('stock'), dataIndex: 'stock' },
          {
            title: '',
            render: (row: any) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>
                  {t('edit')}
                </Button>
                <Popconfirm title={t('delete') + '?'} onConfirm={() => del.mutate(row.id)}>
                  <Button size="small" danger>
                    {t('delete')}
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        title={editing ? t('edit') : t('add')}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={save.isPending}
        okText={t('save')}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="name_en" label={t('name_en')} rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="name_hi" label={t('name_hi')} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="desc_en" label={t('desc_en')} style={{ flex: 1 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item name="desc_hi" label={t('desc_hi')} style={{ flex: 1 }}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="category_id" label={t('category')} style={{ flex: 1, minWidth: 180 }}>
              <Select
                allowClear
                options={(cats ?? []).map((c: any) => ({ value: c.id, label: c.name?.en }))}
              />
            </Form.Item>
            <Form.Item name="unit" label={t('unit')} style={{ flex: 1 }}>
              <Input placeholder="1 kg" />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="price" label={t('price')} rules={[{ required: true }]}>
              <InputNumber min={0} prefix="₹" />
            </Form.Item>
            <Form.Item name="mrp" label={t('mrp')}>
              <InputNumber min={0} prefix="₹" />
            </Form.Item>
            <Form.Item name="stock" label={t('stock')}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="image_url" label={t('image_url')}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
