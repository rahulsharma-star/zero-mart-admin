import { ReactNode } from 'react';
import { Layout, Menu, Typography, Button, Select, Space, Badge, Popover, List, Empty } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  TeamOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  LogoutOutlined,
  CarOutlined,
  GlobalOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { api, unwrap } from '../api/client';
import i18n from '../i18n';

function NotificationsBell() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => unwrap(await api.get('/notifications')),
    refetchInterval: 20000, // poll every 20s
  });
  const items = (data ?? []) as any[];
  const content = (
    <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('no_notifications')} />
      ) : (
        <List
          size="small"
          dataSource={items.slice(0, 20)}
          renderItem={(n: any) => (
            <List.Item>
              <List.Item.Meta title={n.title} description={n.body} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
  return (
    <Popover content={content} title={t('notifications')} trigger="click" placement="bottomRight">
      <Badge count={items.length} size="small">
        <Button icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
}

const { Sider, Header, Content } = Layout;

export default function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation();
  const { logout, user } = useAuth();

  const items = [
    { key: '/', icon: <DashboardOutlined />, label: t('dashboard') },
    { key: '/products', icon: <ShoppingOutlined />, label: t('products') },
    { key: '/categories', icon: <AppstoreOutlined />, label: t('categories') },
    { key: '/orders', icon: <ProfileOutlined />, label: t('orders') },
    { key: '/delivery-boys', icon: <CarOutlined />, label: t('delivery_boys') },
    { key: '/regions', icon: <GlobalOutlined />, label: t('regions') },
    { key: '/users', icon: <TeamOutlined />, label: t('customers') },
    { key: '/banners', icon: <PictureOutlined />, label: t('banners') },
    { key: '/service-areas', icon: <EnvironmentOutlined />, label: t('service_areas') },
    { key: '/settings', icon: <SettingOutlined />, label: t('settings') },
  ];

  const changeLang = (lng: string) => {
    localStorage.setItem('zero_admin_lang', lng);
    i18n.changeLanguage(lng);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light">
        <div style={{ padding: 16, fontWeight: 700, fontSize: 18, color: '#0f9d58' }}>● Zero</div>
        <Menu
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={items}
          onClick={(e) => nav(e.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingInline: 24 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('app')}
          </Typography.Title>
          <Space>
            <NotificationsBell />
            <Select
              size="small"
              defaultValue={i18n.language}
              style={{ width: 110 }}
              onChange={changeLang}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'हिंदी' },
              ]}
            />
            <Typography.Text type="secondary">{user?.phone}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>
              {t('logout')}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
