import { Card, Col, Row, Table, Tag } from 'antd';
import {
  ShoppingOutlined,
  TeamOutlined,
  AppstoreOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import { statusColor } from '../utils/status';
import PageHeader from '../components/PageHeader';

function StatCard({
  icon,
  label,
  value,
  tint,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tint: string;
  loading?: boolean;
}) {
  return (
    <Card loading={loading} styles={{ body: { padding: 18 } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${tint}1a`,
            color: tint,
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1, marginTop: 2 }}>{value}</div>
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => unwrap(await api.get('/admin/dashboard')),
  });

  const totals = data?.totals ?? {};

  return (
    <div>
      <PageHeader title={t('dashboard')} subtitle="At-a-glance health of your store" />

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <StatCard loading={isLoading} icon={<ShoppingOutlined />} tint="#0f9d58" label={t('orders')} value={totals.orders ?? 0} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard loading={isLoading} icon={<TeamOutlined />} tint="#3b82f6" label={t('customers')} value={totals.customers ?? 0} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard loading={isLoading} icon={<AppstoreOutlined />} tint="#f59e0b" label={t('products')} value={totals.products ?? 0} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            loading={isLoading}
            icon={<RiseOutlined />}
            tint="#8b5cf6"
            label={t('revenue')}
            value={`₹${Number(totals.revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          />
        </Col>
      </Row>

      <Card title={`${t('orders')} · Recent`} style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.recent_orders ?? []}
          pagination={false}
          columns={[
            { title: t('order_no'), dataIndex: 'order_number', render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span> },
            {
              title: t('total'),
              dataIndex: 'total',
              render: (v: string) => `₹${Number(v).toFixed(2)}`,
            },
            {
              title: t('status'),
              dataIndex: 'status',
              render: (s: string) => <Tag color={statusColor(s)}>{s}</Tag>,
            },
            {
              title: 'Payment',
              dataIndex: 'payment_status',
              render: (s: string) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
