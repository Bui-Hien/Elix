'use client'

import { Card, Typography, Space, Button } from 'antd'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from 'next/navigation'
import {
  CheckCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  MessageOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

export default function SimpleAdminPage() {
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
            <Title level={2} style={{ marginTop: 16 }}>
              ✅ Admin Login Thành Công!
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Chào mừng {user?.fullName || 'Admin'} đến với trang quản trị
            </Text>
          </div>

          <Card size="small" style={{ background: '#f5f5f5' }}>
            <Text strong>Thông tin tài khoản:</Text>
            <div style={{ marginTop: 8 }}>
              <div>👤 Tên: {user?.fullName}</div>
              <div>📧 Email: {user?.email}</div>
              <div>🎭 Role: {user?.role}</div>
            </div>
          </Card>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Quick Links:</Text>
            
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              size="large"
              block
              onClick={() => router.push('/admin/products')}
            >
              Quản lý Sản phẩm
            </Button>

            <Button
              icon={<MessageOutlined />}
              size="large"
              block
              onClick={() => router.push('/admin/chat')}
            >
              Quản lý Chatbot
            </Button>

            <Button
              icon={<UserOutlined />}
              size="large"
              block
              onClick={() => router.push('/admin/customers')}
            >
              Quản lý Khách hàng
            </Button>

            <Button
              size="large"
              block
              onClick={() => router.push('/admin')}
            >
              Dashboard (Full)
            </Button>
          </Space>

          <Card size="small" title="🐛 Debug Info" style={{ background: '#fff1f0' }}>
            <pre style={{ fontSize: 11, margin: 0 }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        </Space>
      </Card>
    </div>
  )
}
