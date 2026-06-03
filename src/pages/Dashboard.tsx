import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';
import { statusColor } from '../utils/status';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => unwrap(await api.get('/admin/dashboard')),
  });

  const totals = data?.totals ?? {};

  return (
    <div>
      <Row gutter={16}>
        <Col xs={12} md={6}>
          <Card loading={isLoading}>
            <Statistic title={t('orders')} value={totals.orders ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={isLoading}>
            <Statistic title={t('customers')} value={totals.customers ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={isLoading}>
            <Statistic title={t('products')} value={totals.products ?? 0} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={isLoading}>
            <Statistic title={t('revenue')} value={totals.revenue ?? 0} prefix="₹" precision={2} />
          </Card>
        </Col>
      </Row>

      <Card title={t('orders')} style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.recent_orders ?? []}
          pagination={false}
          columns={[
            { title: t('order_no'), dataIndex: 'order_number' },
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
