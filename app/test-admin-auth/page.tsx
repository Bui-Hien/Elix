'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { Card, Descriptions, Tag, Button, Space } from 'antd'
import { useRouter } from 'next/navigation'

export default function TestAdminAuthPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth)

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card title="🔐 Admin Auth State Test">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Loading">
            <Tag color={loading ? 'orange' : 'green'}>
              {loading ? 'TRUE (Loading...)' : 'FALSE (Ready)'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Is Authenticated">
            <Tag color={isAuthenticated ? 'green' : 'red'}>
              {isAuthenticated ? 'TRUE' : 'FALSE'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="User">
            {user ? (
              <div>
                <div>ID: {user.id}</div>
                <div>Email: {user.email}</div>
                <div>Name: {user.fullName}</div>
                <div>Role: <Tag color="purple">{user.role}</Tag></div>
              </div>
            ) : (
              <Tag color="red">NULL (No user)</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Cookie">
            <code style={{ fontSize: 11, wordBreak: 'break-all' }}>
              {typeof window !== 'undefined' ? document.cookie : 'N/A'}
            </code>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" onClick={() => router.push('/admin')}>
              Go to Admin Dashboard
            </Button>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Space>
        </div>

        <Card
          size="small"
          title="📋 Debug Info"
          style={{ marginTop: 24, background: '#f5f5f5' }}
        >
          <pre style={{ fontSize: 11, margin: 0 }}>
            {JSON.stringify({ user, isAuthenticated, loading }, null, 2)}
          </pre>
        </Card>
      </Card>
    </div>
  )
}
