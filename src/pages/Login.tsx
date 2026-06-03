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
      if (user.role !== 'admin') {
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
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 380 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Typography.Title level={2} style={{ color: '#0f9d58', margin: 0 }}>
              ● Zero
            </Typography.Title>
            <Typography.Text type="secondary">{t('app')}</Typography.Text>
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
