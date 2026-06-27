import { Card, Col, Row, Statistic, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../../api/client';
import PageHeader from '../../components/PageHeader';

export default function VendorDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({ queryKey: ['vendor-me'], queryFn: async () => unwrap(await api.get('/vendor/me')) });

  if (isLoading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div>
      <PageHeader title={data?.store?.name || 'My Shop'} subtitle="Your shop at a glance" />
      <Row gutter={16}>
        <Col xs={12} md={6}>
          <Card><Statistic title="Pending orders" value={data?.stats?.pending_orders ?? 0} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Active orders" value={data?.stats?.active_orders ?? 0} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="Commission %" value={data?.store?.commission_rate ?? '—'} /></Card>
        </Col>
      </Row>
    </div>
  );
}
