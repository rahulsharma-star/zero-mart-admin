import { Table, Button, Space, Tag, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../../api/client';
import PageHeader from '../../components/PageHeader';

const statusColor: Record<string, string> = {
  placed: 'orange', confirmed: 'blue', preparing: 'cyan', ready_for_pickup: 'geekblue',
  assigned: 'purple', out_for_delivery: 'purple', delivered: 'green', cancelled: 'red',
};

export default function VendorOrders() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['vendor-orders'], queryFn: async () => unwrap(await api.get('/vendor/orders')) });

  const act = useMutation({
    mutationFn: ({ id, path, body }: { id: string; path: string; body?: any }) => api.post(`/vendor/orders/${id}/${path}`, body),
    onSuccess: () => { message.success(t('saved')); qc.invalidateQueries({ queryKey: ['vendor-orders'] }); },
    onError: (e) => message.error(errMsg(e)),
  });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/vendor/orders/${id}/status`, { status }),
    onSuccess: () => { message.success(t('saved')); qc.invalidateQueries({ queryKey: ['vendor-orders'] }); },
    onError: (e) => message.error(errMsg(e)),
  });

  const actions = (row: any) => {
    switch (row.status) {
      case 'placed':
        return (
          <Space>
            <Button size="small" type="primary" onClick={() => act.mutate({ id: row.id, path: 'accept' })}>Accept</Button>
            <Button size="small" danger onClick={() => act.mutate({ id: row.id, path: 'reject' })}>Reject</Button>
          </Space>
        );
      case 'confirmed':
        return <Button size="small" onClick={() => setStatus.mutate({ id: row.id, status: 'preparing' })}>Start preparing</Button>;
      case 'preparing':
        return <Button size="small" onClick={() => setStatus.mutate({ id: row.id, status: 'ready_for_pickup' })}>Mark ready</Button>;
      default:
        return <span style={{ color: '#999' }}>—</span>;
    }
  };

  return (
    <div>
      <PageHeader title={t('orders')} subtitle="Your shop's orders" />
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        columns={[
          { title: t('order_no'), dataIndex: 'order_number' },
          { title: t('status'), dataIndex: 'status', render: (s: string) => <Tag color={statusColor[s] || 'default'}>{s?.replace(/_/g, ' ')}</Tag> },
          { title: 'Customer', dataIndex: 'customer_name', render: (n: string, r: any) => <span>{n || '—'}<br /><small style={{ color: '#999' }}>{r.contact_phone}</small></span> },
          { title: t('total'), dataIndex: 'total', render: (p: any) => `₹${p}` },
          { title: 'Your payout', dataIndex: 'vendor_payout', render: (p: any) => `₹${p}` },
          { title: '', render: actions },
        ]}
      />
    </div>
  );
}
