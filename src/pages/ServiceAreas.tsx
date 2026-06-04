import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import PageHeader from '../components/PageHeader';

export default function ServiceAreas() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-areas'],
    queryFn: async () => unwrap(await api.get('/admin/service-areas')),
  });

  const save = useMutation({
    mutationFn: (v: any) => api.post('/admin/service-areas', v),
    onSuccess: () => {
      message.success(t('saved'));
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['admin-areas'] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/service-areas/${id}`),
    onSuccess: () => {
      message.success(t('deleted'));
      qc.invalidateQueries({ queryKey: ['admin-areas'] });
    },
  });

  return (
    <div>
      <PageHeader
        title={t('service_areas')}
        subtitle="Pincodes you currently deliver to"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ is_active: true }); setOpen(true); }}>
            {t('add')} {t('service_areas')}
          </Button>
        }
      />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: t('pincode'), dataIndex: 'pincode' },
          { title: t('city'), dataIndex: 'city' },
          { title: t('area'), dataIndex: 'area_name' },
          { title: t('active'), dataIndex: 'is_active', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{String(v)}</Tag> },
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
          <Form.Item name="pincode" label={t('pincode')} rules={[{ required: true, pattern: /^\d{6}$/ } as any]}><Input maxLength={6} /></Form.Item>
          <Form.Item name="city" label={t('city')}><Input /></Form.Item>
          <Form.Item name="area_name" label={t('area')}><Input /></Form.Item>
          <Form.Item name="is_active" label={t('active')} valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
