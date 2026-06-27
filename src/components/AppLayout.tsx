import { ReactNode } from 'react';
import { Layout, Menu, Typography, Button, Select, Space, Badge, Popover, List, Empty, Avatar, Tag } from 'antd';
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
  ShopOutlined,
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
    <div style={{ width: 340, maxHeight: 420, overflow: 'auto' }}>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('no_notifications')} />
      ) : (
        <List
          size="small"
          dataSource={items.slice(0, 20)}
          renderItem={(n: any) => (
            <List.Item>
              <List.Item.Meta title={<span style={{ fontWeight: 600 }}>{n.title}</span>} description={n.body} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
  return (
    <Popover content={content} title={t('notifications')} trigger="click" placement="bottomRight">
      <Badge count={items.length} size="small" offset={[-2, 2]}>
        <Button shape="circle" icon={<BellOutlined />} />
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

  const isVendor = user?.role === 'vendor';

  // Vendors get a focused menu scoped to their own shop.
  const vendorItems = [
    { type: 'group' as const, label: 'My Shop', children: [
      { key: '/', icon: <DashboardOutlined />, label: t('dashboard') },
      { key: '/orders', icon: <ProfileOutlined />, label: t('orders') },
      { key: '/products', icon: <ShoppingOutlined />, label: t('products') },
      { key: '/banners', icon: <PictureOutlined />, label: t('banners') },
    ]},
  ];

  // Grouped navigation for a more "product" feel.
  const adminItems = [
    { type: 'group' as const, label: 'Overview', children: [
      { key: '/', icon: <DashboardOutlined />, label: t('dashboard') },
      { key: '/orders', icon: <ProfileOutlined />, label: t('orders') },
    ]},
    { type: 'group' as const, label: 'Catalog', children: [
      { key: '/products', icon: <ShoppingOutlined />, label: t('products') },
      { key: '/stores', icon: <ShopOutlined />, label: 'Shops' },
      { key: '/categories', icon: <AppstoreOutlined />, label: t('categories') },
      { key: '/banners', icon: <PictureOutlined />, label: t('banners') },
    ]},
    { type: 'group' as const, label: 'Operations', children: [
      { key: '/delivery-boys', icon: <CarOutlined />, label: t('delivery_boys') },
      { key: '/regions', icon: <GlobalOutlined />, label: t('regions') },
      { key: '/service-areas', icon: <EnvironmentOutlined />, label: t('service_areas') },
    ]},
    { type: 'group' as const, label: 'People & Config', children: [
      { key: '/users', icon: <TeamOutlined />, label: t('customers') },
      { key: '/settings', icon: <SettingOutlined />, label: t('settings') },
    ]},
  ];

  const items = isVendor ? vendorItems : adminItems;

  // Flat lookup for the header title (current page name).
  const flat: Record<string, string> = {
    '/': t('dashboard'), '/orders': t('orders'), '/products': t('products'), '/stores': 'Shops',
    '/categories': t('categories'), '/banners': t('banners'), '/delivery-boys': t('delivery_boys'),
    '/regions': t('regions'), '/service-areas': t('service_areas'), '/users': t('customers'),
    '/settings': t('settings'),
  };

  const changeLang = (lng: string) => {
    localStorage.setItem('zero_admin_lang', lng);
    i18n.changeLanguage(lng);
  };

  const initials = (user?.name ?? user?.phone ?? 'A').slice(0, 1).toUpperCase();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        className="app-sider"
        breakpoint="lg"
        collapsedWidth="0"
        width={248}
        theme="light"
        style={{ borderRight: '1px solid #eef0f3', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 16px' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#0f9d58,#16a34a)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>Z</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', lineHeight: 1 }}>Zero</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Admin Console</div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[loc.pathname]}
          items={items}
          onClick={(e) => nav(e.key)}
          style={{ paddingBottom: 24 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'saturate(180%) blur(8px)',
            borderBottom: '1px solid #eef0f3',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingInline: 24,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography.Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            {flat[loc.pathname] ?? t('app')}
          </Typography.Title>
          <Space size="middle">
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
            <Popover
              placement="bottomRight"
              content={
                <div style={{ width: 200 }}>
                  <div style={{ fontWeight: 600 }}>{user?.name ?? 'Admin'}</div>
                  <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 10 }}>{user?.phone}</div>
                  <Button block danger icon={<LogoutOutlined />} onClick={logout}>
                    {t('logout')}
                  </Button>
                </div>
              }
              trigger="click"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: '#0f9d58', fontWeight: 700 }} size={34}>
                  {initials}
                </Avatar>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name ?? 'Admin'}</div>
                  <Tag color="green" style={{ marginTop: 2, fontSize: 10, lineHeight: '16px', padding: '0 6px' }}>
                    {isVendor ? 'Vendor' : 'Administrator'}
                  </Tag>
                </div>
              </Space>
            </Popover>
          </Space>
        </Header>
        <Content style={{ margin: 0, padding: 24, maxWidth: 1320, width: '100%' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
