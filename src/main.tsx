import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './i18n';
import './index.css';
import 'antd/dist/reset.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#0f9d58',
          colorInfo: '#0f9d58',
          colorSuccess: '#16a34a',
          colorError: '#e23744',
          colorWarning: '#f59e0b',
          borderRadius: 10,
          fontFamily: FONT,
          fontSize: 14,
          controlHeight: 38,
          colorBgLayout: '#f4f6f8',
          colorTextBase: '#1f2937',
          colorBorderSecondary: '#eef0f3',
          wireframe: false,
        },
        components: {
          Layout: { headerBg: '#ffffff', siderBg: '#ffffff', bodyBg: '#f4f6f8', headerHeight: 64 },
          Menu: {
            itemSelectedBg: '#e7f6ee',
            itemSelectedColor: '#0b7a44',
            itemBorderRadius: 10,
            itemHeight: 42,
            itemMarginInline: 10,
            iconSize: 16,
          },
          Card: { borderRadiusLG: 14, paddingLG: 20 },
          Table: { headerBg: '#fafbfc', headerColor: '#6b7280', borderColor: '#eef0f3', rowHoverBg: '#f7fbf9' },
          Button: { fontWeight: 600, primaryShadow: 'none', defaultShadow: 'none' },
          Statistic: { titleFontSize: 13 },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
