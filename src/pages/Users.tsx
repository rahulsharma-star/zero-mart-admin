import { Table, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api, unwrap } from '../api/client';

export default function Users() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => unwrap(await api.get('/admin/users', { params: { limit: 100 } })),
  });

  return (
    <Table
      rowKey="id"
      loading={isLoading}
      dataSource={data?.items ?? []}
      columns={[
        { title: t('phone'), dataIndex: 'phone' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', dataIndex: 'role', render: (r: string) => <Tag>{r}</Tag> },
        { title: 'Lang', dataIndex: 'language' },
        { title: 'Joined', dataIndex: 'created_at', render: (d: string) => new Date(d).toLocaleDateString() },
      ]}
    />
  );
}
