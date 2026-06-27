import { useState } from 'react';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { api, unwrap, errMsg } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { setSession } = useAuth();
  const [phone, setPhone] = useState('9999900000'); // seeded admin
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/auth/otp/request', { phone });
      message.success(t('otp') + ' sent (check backend console in dev)');
      setStep('otp');
    } catch (e) {
      message.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { phone, code: otp });
      const { token, user } = unwrap(res);
      if (user.role !== 'admin' && user.role !== 'vendor') {
        message.error(t('only_admin'));
        return;
      }
      setSession(token, user);
    } catch (e) {
      message.error(errMsg(e) || t('login_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', placeItems: 'center', minHeight: '100vh', background: 'radial-gradient(1200px 600px at 0% 0%, #e7f6ee 0%, #f4f6f8 45%)', padding: 24 }}>
      <Card style={{ width: 400, borderRadius: 18, boxShadow: '0 12px 40px rgba(16,24,40,0.10)' }} styles={{ body: { padding: 32 } }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px', background: 'linear-gradient(135deg,#0f9d58,#16a34a)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 28, boxShadow: '0 8px 20px rgba(15,157,88,0.35)' }}>Z</div>
            <Typography.Title level={3} style={{ margin: 0, color: '#111827' }}>
              Zero Admin
            </Typography.Title>
            <Typography.Text type="secondary">Sign in to your console</Typography.Text>
          </div>

          {step === 'phone' ? (
            <>
              <Input
                size="large"
                addonBefore="+91"
                placeholder={t('phone')}
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              <Button type="primary" block size="large" loading={loading} onClick={sendOtp}>
                {t('send_otp')}
              </Button>
            </>
          ) : (
            <>
              <Input
                size="large"
                placeholder={t('otp')}
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onPressEnter={verify}
              />
              <Button type="primary" block size="large" loading={loading} onClick={verify}>
                {t('verify')}
              </Button>
              <Button type="link" block onClick={() => setStep('phone')}>
                ← {t('phone')}
              </Button>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
