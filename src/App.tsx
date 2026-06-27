import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './auth/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Banners from './pages/Banners';
import ServiceAreas from './pages/ServiceAreas';
import Settings from './pages/Settings';
import DeliveryBoys from './pages/DeliveryBoys';
import Stores from './pages/Stores';
import Regions from './pages/Regions';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorBanners from './pages/vendor/VendorBanners';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.role === 'vendor') {
    return (
      <AppLayout>
        <Routes>
          <Route path="/" element={<VendorDashboard />} />
          <Route path="/orders" element={<VendorOrders />} />
          <Route path="/products" element={<VendorProducts />} />
          <Route path="/banners" element={<VendorBanners />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/delivery-boys" element={<DeliveryBoys />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/regions" element={<Regions />} />
        <Route path="/users" element={<Users />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
