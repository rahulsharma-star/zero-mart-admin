import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Image, Tag, Popconfirm, message, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg, assetUrl } from '../../api/client';
import PageHeader from '../../components/PageHeader';
import ImageUpload from '../../components/ImageUpload';

const statusTag = (s: string) => {
  const color = s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red';
  return <Tag color={color}>{s}</Tag>;
};

export default function VendorBanners() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({ queryKey: ['vendor-banners'], queryFn: async () => unwrap(await api.get('/vendor/banners')) });

  const save = useMutation({
    mutationFn: async (v: any) => api.post('/vendor/banners', {
      image_url: v.image_url,
      title: { en: v.title_en, hi: v.title_hi },
      placement: v.placement ?? 'shop',
    }),
    onSuccess: () => { message.success(t('saved')); setOpen(false); qc.invalidateQueries({ queryKey: ['vendor-banners'] }); },
    onError: (e) => message.error(errMsg(e)),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/vendor/banners/${id}`),
    onSuccess: () => { message.success(t('deleted')); qc.invalidateQueries({ queryKey: ['vendor-banners'] }); },
  });

  const openNew = () => { form.resetFields(); form.setFieldsValue({ placement: 'shop' }); setOpen(true); };

  return (
    <div>
      <PageHeader
        title={t('banners')}
        subtitle="Ads for your shop. Home placement needs admin approval."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openNew}>{t('add')}</Button>}
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: '', dataIndex: 'image_url', width: 120, render: (u: string) => (u ? <Image src={assetUrl(u)} width={100} height={50} style={{ borderRadius: 6, objectFit: 'cover' }} /> : null) },
          { title: 'Title', dataIndex: ['title', 'en'] },
          { title: 'Where', dataIndex: 'placement', render: (p: string) => <Tag color={p === 'home' ? 'gold' : 'blue'}>{p}</Tag> },
          { title: 'Status', dataIndex: 'status', render: statusTag },
          {
            title: '',
            render: (row: any) => (
              <Popconfirm title={t('delete') + '?'} onConfirm={() => del.mutate(row.id)}>
                <Button size="small" danger>{t('delete')}</Button>
              </Popconfirm>
            ),
          },
        ]}
      />
      <Modal open={open} title={t('add')} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText={t('save')} confirmLoading={save.isPending}>
        <Form form={form} layout="vertical" onFinish={(v) => save.mutate(v)}>
          <Form.Item name="image_url" label={t('image_url')} rules={[{ required: true, message: 'Please upload an image' }]}>
            <ImageUpload height={120} />
          </Form.Item>
          <Form.Item name="title_en" label="Title (English)"><Input /></Form.Item>
          <Form.Item name="title_hi" label="Title (Hindi)"><Input /></Form.Item>
          <Form.Item name="placement" label="Show on">
            <Select
              options={[
                { value: 'shop', label: 'My shop page (auto-approved)' },
                { value: 'home', label: 'Home page (needs admin approval)' },
              ]}
            />
          </Form.Item>
          <Alert type="info" message="Home banners are reviewed by admin before they go live (charges may apply)." />
        </Form>
      </Modal>
    </div>
  );
}
