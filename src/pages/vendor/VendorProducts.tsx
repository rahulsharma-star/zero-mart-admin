import { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Image, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg, assetUrl } from '../../api/client';
import PageHeader from '../../components/PageHeader';
import ImageUpload from '../../components/ImageUpload';

export default function VendorProducts() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({ queryKey: ['vendor-products'], queryFn: async () => unwrap(await api.get('/vendor/products')) });
  const { data: cats } = useQuery({ queryKey: ['vendor-categories'], queryFn: async () => unwrap(await api.get('/vendor/categories')) });

  const save = useMutation({
    mutationFn: async (v: any) => {
      const payload = {
        category_id: v.category_id ?? null,
        name: { en: v.name_en, hi: v.name_hi, mr: v.name_mr },
        description: { en: v.desc_en, hi: v.desc_hi, mr: v.desc_mr },
        unit: v.unit,
        price: v.price,
        extra_charge: v.extra_charge ?? 0,
        mrp: v.mrp,
        stock: v.stock,
        image_url: v.image_url,
        is_active: v.is_active,
      };
      return editing ? api.put(`/vendor/products/${editing.id}`, payload) : api.post('/vendor/products', payload);
    },
    onSuccess: () => { message.success(t('saved')); setOpen(false); qc.invalidateQueries({ queryKey: ['vendor-products'] }); },
    onError: (e) => message.error(errMsg(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/vendor/products/${id}`),
    onSuccess: () => { message.success(t('deleted')); qc.invalidateQueries({ queryKey: ['vendor-products'] }); },
  });

  const openEdit = (row?: any) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue({
        name_en: row.name?.en, name_hi: row.name?.hi, name_mr: row.name?.mr,
        desc_en: row.description?.en, desc_hi: row.description?.hi, desc_mr: row.description?.mr,
        unit: row.unit, price: Number(row.price), extra_charge: row.extra_charge ? Number(row.extra_charge) : 0,
        mrp: row.mrp ? Number(row.mrp) : undefined, stock: row.stock, image_url: row.image_url,
        category_id: row.category_id, is_active: row.is_active,
      });
    } else form.setFieldsValue({ is_active: true, stock: 0, price: 0, extra_charge: 0 });
    setOpen(true);
  };

  const catName = (id: string) => (cats ?? []).find((x: any) => x.id === id)?.name?.en ?? '-';

  return (
    <div>
      <PageHeader
        title={t('products')}
        subtitle="Manage your shop's products"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit()}>{t('add')}</Button>}
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: '', dataIndex: 'image_url', width: 80, render: (u: string) => (u ? <Image src={assetUrl(u)} width={56} height={56} style={{ borderRadius: 8, objectFit: 'cover' }} /> : null) },
          { title: t('name_en'), dataIndex: ['name', 'en'] },
          { title: t('category'), dataIndex: 'category_id', render: catName },
          { title: t('price'), dataIndex: 'price', render: (p: any) => `₹${p}` },
          { title: 'Extra', dataIndex: 'extra_charge', render: (p: any) => (Number(p) ? `+₹${p}` : '—') },
          { title: t('stock'), dataIndex: 'stock' },
          { title: t('active'), dataIndex: 'is_active', render: (a: boolean) => <Tag color={a ? 'green' : 'red'}>{a ? 'Yes' : 'No'}</Tag> },
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
      <Modal open={open} title={editing ? t('edit') : t('add')} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText={t('save')} confirmLoading={save.isPending} width={640}>
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="name_en" label={t('name_en')} rules={[{ required: true }]} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="name_hi" label={t('name_hi')} style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="name_mr" label="Name (Marwadi)" style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="category_id" label={t('category')}>
            <Select allowClear options={(cats ?? []).map((c: any) => ({ value: c.id, label: c.name?.en }))} />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="unit" label={t('unit')} style={{ flex: 1 }}><Input placeholder="1 kg / 500 ml" /></Form.Item>
            <Form.Item name="price" label={t('price')} rules={[{ required: true }]}><InputNumber min={0} prefix="₹" /></Form.Item>
            <Form.Item name="extra_charge" label="Extra charge" tooltip="Added on top of price"><InputNumber min={0} prefix="₹" /></Form.Item>
            <Form.Item name="mrp" label={t('mrp')}><InputNumber min={0} prefix="₹" /></Form.Item>
            <Form.Item name="stock" label={t('stock')}><InputNumber min={0} /></Form.Item>
          </Space>
          <Form.Item name="image_url" label={t('image_url')}><ImageUpload height={120} /></Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
