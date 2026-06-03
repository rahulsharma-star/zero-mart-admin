import { useState } from 'react';
import { Table, Tag, Select, Drawer, Descriptions, List, Typography, Button, Space, Divider, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import { statusColor, ORDER_STATUSES } from '../utils/status';

export default function Orders() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [boyId, setBoyId] = useState<string | undefined>();

  const boys = useQuery({
    queryKey: ['admin-delivery-boys-all'],
    queryFn: async () => unwrap(await api.get('/admin/delivery-boys')),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => unwrap(await api.get('/admin/orders', { params: { limit: 100 } })),
  });

  const detail = useQuery({
    queryKey: ['admin-order', detailId],
    queryFn: async () => unwrap(await api.get(`/admin/orders/${detailId}`)),
    enabled: !!detailId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      message.success(t('saved'));
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (detailId) qc.invalidateQueries({ queryKey: ['admin-order', detailId] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const assign = useMutation({
    mutationFn: ({ id, delivery_boy_id }: { id: string; delivery_boy_id?: string }) =>
      api.post(`/admin/orders/${id}/assign`, delivery_boy_id ? { delivery_boy_id } : {}),
    onSuccess: () => {
      message.success(t('assigned_ok'));
      setBoyId(undefined);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (detailId) qc.invalidateQueries({ queryKey: ['admin-order', detailId] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  const unassign = useMutation({
    mutationFn: (id: string) => api.post(`/admin/orders/${id}/unassign`, {}),
    onSuccess: () => {
      message.success(t('saved'));
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (detailId) qc.invalidateQueries({ queryKey: ['admin-order', detailId] });
    },
    onError: (e) => message.error(errMsg(e)),
  });

  return (
    <div>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.items ?? []}
        onRow={(row) => ({ onClick: () => setDetailId(row.id) })}
        columns={[
          {
            title: t('order_no'),
            dataIndex: 'order_number',
            render: (no: string, row: any) => (
              <span>
                {no}{' '}
                {row.needs_reassign && <Tag color="red">⟳ {t('reassign_needed')}</Tag>}
              </span>
            ),
          },
          { title: t('total'), dataIndex: 'total', render: (v: string) => `₹${Number(v).toFixed(2)}` },
          { title: 'Payment', dataIndex: 'payment_method', render: (m: string) => m?.toUpperCase() },
          {
            title: 'Paid',
            dataIndex: 'payment_status',
            render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag>,
          },
          {
            title: t('status'),
            dataIndex: 'status',
            render: (s: string, row: any) => (
              <Select
                size="small"
                value={s}
                style={{ width: 160 }}
                onClick={(e) => e.stopPropagation()}
                onChange={(status) => updateStatus.mutate({ id: row.id, status })}
                options={ORDER_STATUSES.map((x) => ({ value: x, label: x }))}
              />
            ),
          },
          {
            title: 'Created',
            dataIndex: 'created_at',
            render: (d: string) => new Date(d).toLocaleString(),
          },
        ]}
      />

      <Drawer width={460} open={!!detailId} onClose={() => setDetailId(null)} title={detail.data?.order_number}>
        {detail.data && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={t('status')}>
                <Tag color={statusColor(detail.data.status)}>{detail.data.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {detail.data.customer?.name} — {detail.data.customer?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {detail.data.address_line1}, {detail.data.address_city} - {detail.data.address_pincode}
              </Descriptions.Item>
              <Descriptions.Item label={t('total')}>₹{Number(detail.data.total).toFixed(2)}</Descriptions.Item>
            </Descriptions>
            <Typography.Title level={5} style={{ marginTop: 16 }}>
              Items
            </Typography.Title>
            <List
              dataSource={detail.data.items ?? []}
              renderItem={(it: any) => (
                <List.Item>
                  <span>
                    {it.name?.en} × {it.quantity}
                  </span>
                  <span>₹{Number(it.line_total).toFixed(2)}</span>
                </List.Item>
              )}
            />

            {Array.isArray(detail.data.assignments) && detail.data.assignments.length > 0 && (
              <>
                <Divider>{t('assignment_history')}</Divider>
                <List
                  size="small"
                  dataSource={detail.data.assignments}
                  renderItem={(a: any) => (
                    <List.Item>
                      <span>
                        {a.boy_name}{' '}
                        <Tag color={a.status === 'rejected' || a.status === 'expired' ? 'red' : a.status === 'completed' ? 'green' : 'blue'}>
                          {a.status}
                        </Tag>
                      </span>
                      <span style={{ color: '#888' }}>{a.reject_reason || ''}</span>
                    </List.Item>
                  )}
                />
              </>
            )}

            <Divider>{t('assign_delivery_boy')}</Divider>
            {detail.data.status === 'ready_for_pickup' ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t('select_delivery_boy')}
                  value={boyId}
                  onChange={setBoyId}
                  options={(boys.data ?? [])
                    .filter((b: any) => b.is_active && (!detail.data.region_id || b.region_id === detail.data.region_id))
                    .map((b: any) => ({ value: b.id, label: `${b.name} (${b.availability})` }))}
                />
                <Space>
                  <Button type="primary" disabled={!boyId} loading={assign.isPending}
                    onClick={() => assign.mutate({ id: detail.data.id, delivery_boy_id: boyId })}>
                    {t('assign')}
                  </Button>
                  <Button loading={assign.isPending} onClick={() => assign.mutate({ id: detail.data.id })}>
                    {t('auto_assign')}
                  </Button>
                </Space>
              </Space>
            ) : detail.data.status === 'assigned' ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text type="secondary">{t('assigned_to_boy_hint')}</Typography.Text>
                <Button danger loading={unassign.isPending} onClick={() => unassign.mutate(detail.data.id)}>
                  {t('repool')}
                </Button>
              </Space>
            ) : (
              <Typography.Text type="secondary">
                {t('assign_hint')}
              </Typography.Text>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
