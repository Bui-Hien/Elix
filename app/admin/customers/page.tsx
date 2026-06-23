'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Avatar,
  Card,
  Statistic,
  Row,
  Col,
  Flex,
  Typography,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Select,
  Drawer,
  Descriptions,
  Divider,
} from 'antd'
import type { MenuProps, TableColumnsType } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SearchOutlined,
  DeleteOutlined,
  MoreOutlined,
  TeamOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import apiClient from '@/lib/api-client'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface User {
  id: number
  email: string
  fullName: string
  phone: string | null
  address: string | null
  createdAt: string
  isActive: boolean
  role: string
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res: any = await apiClient.get(`/admin/users`)
      setUsers(res)
    } catch (error) {
      console.error(error)
      message.error("Không thể tải danh sách khách hàng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const changeRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin'
    const roleLabel = newRole === 'Admin' ? 'Quản trị viên' : 'Khách hàng'

    Modal.confirm({
      title: 'Thay đổi vai trò',
      content: `Bạn có chắc chắn muốn thay đổi vai trò thành "${roleLabel}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.patch(`/admin/users/${userId}/role`, { roleName: newRole })
          message.success(`Đã thay đổi vai trò thành ${roleLabel}`)
          fetchUsers()
        } catch (e: any) {
          message.error(e.response?.data?.message || 'Thay đổi vai trò thất bại')
        }
      },
    })
  }

  const viewUserDetail = async (userId: number) => {
    try {
      const user = await apiClient.get(`/admin/users/${userId}`)
      setSelectedUser(user)
      setDrawerVisible(true)
    } catch (e: any) {
      message.error('Không thể tải thông tin khách hàng')
    }
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      // Send the new status value in the request body
      await apiClient.patch(`/admin/users/${id}/status`, !currentStatus)
      message.success("Đã cập nhật trạng thái")
      fetchUsers()
    } catch (e) {
      message.error("Cập nhật thất bại")
    }
  }

  const getMenuItems = (user: User): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => viewUserDetail(user.id),
    },
    {
      type: 'divider',
    },
    {
      key: 'role',
      label: user.role === 'Admin' ? 'Chuyển thành Khách hàng' : 'Chuyển thành Quản trị viên',
      icon: <UserOutlined />,
      onClick: () => changeRole(user.id, user.role),
    },
    {
      type: 'divider',
    },
    {
      key: 'status',
      label: user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      icon: user.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      onClick: () => toggleStatus(user.id, user.isActive),
    },
  ]

  // Filter users based on search query (client-side)
  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      return user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    }
    return true
  })

  const columns: TableColumnsType<User> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: User, index: number) => index + 1,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (user: User) => (
        <Flex gap={12} align="center">
          <Avatar
            size={48}
            style={{
              backgroundColor: '#6366f1',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
              {user.fullName || 'Chưa đặt tên'}
            </div>
            <Flex gap={8} align="center">
              <MailOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {user.email}
              </Text>
            </Flex>
          </div>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewUserDetail(user.id)}
          >
            Chi tiết
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      render: (user: User) => (
        <Space orientation="vertical" size={4}>
          {user.phone ? (
            <Flex gap={6} align="center">
              <PhoneOutlined style={{ color: '#10b981', fontSize: 13 }} />
              <Text style={{ fontSize: 13 }}>{user.phone}</Text>
            </Flex>
          ) : (
            <Text type="secondary" italic style={{ fontSize: 13 }}>
              Chưa cập nhật
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      sorter: (a, b) => (a.address || '').localeCompare(b.address || ''),
      render: (user: User) => (
        user.address ? (
          <Flex gap={6} align="start">
            <EnvironmentOutlined style={{ color: '#f59e0b', fontSize: 13, marginTop: 2 }} />
            <Text style={{ fontSize: 13, maxWidth: 250 }} ellipsis={{ tooltip: user.address }}>
              {user.address}
            </Text>
          </Flex>
        ) : (
          <Text type="secondary" italic style={{ fontSize: 13 }}>
            Chưa cập nhật
          </Text>
        )
      ),
    },
    {
      title: 'Vai trò',
      key: 'role',
      align: 'center',
      filters: [
        { text: 'Quản trị viên', value: 'Admin' },
        { text: 'Khách hàng', value: 'User' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (user: User) => (
        <Tooltip title="Click để thay đổi vai trò">
          <Tag
            color={user.role === 'Admin' ? 'red' : 'blue'}
            style={{ cursor: 'pointer' }}
            onClick={() => changeRole(user.id, user.role)}
          >
            {user.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Vô hiệu', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (user: User) => (
        <Tag color={user.isActive ? 'success' : 'default'} icon={user.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tham gia',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (user: User) => (
        <Flex gap={6} align="center">
          <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
          <Text style={{ fontSize: 13 }}>
            {dayjs(user.createdAt).format('DD/MM/YYYY')}
          </Text>
        </Flex>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (user: User) => (
        <Dropdown menu={{ items: getMenuItems(user) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  const activeUsers = filteredUsers.filter(u => u.isActive === true)
  const inactiveUsers = filteredUsers.filter(u => u.isActive === false)
  const adminUsers = filteredUsers.filter(u => u.role === 'Admin')

  // Stats should show total (not filtered)
  const totalActiveUsers = users.filter(u => u.isActive === true).length
  const totalInactiveUsers = users.filter(u => u.isActive === false).length
  const totalAdminUsers = users.filter(u => u.role === 'Admin').length

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quản lý khách hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý tài khoản người dùng và thông tin cá nhân
          </Text>
        </div>
      </Flex>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng khách hàng</span>}
              value={users.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Đang hoạt động</span>}
              value={totalActiveUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Vô hiệu hóa</span>}
              value={totalInactiveUsers}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Quản trị viên</span>}
              value={totalAdminUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Search Bar */}
        <Flex justify="space-between" align="center" style={{ marginBottom: 20 }} wrap="wrap" gap={16}>
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 400, borderRadius: 8 }}
            size="large"
            allowClear
          />
          <Text type="secondary">
            Hiển thị <Text strong style={{ color: '#6366f1' }}>{filteredUsers.length}</Text> / {users.length} khách hàng
          </Text>
        </Flex>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
            style: { marginTop: 16 },
          }}
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* User Detail Drawer */}
      <Drawer
        title={
          <Flex align="center" gap={12}>
            <Avatar
              size={48}
              style={{
                backgroundColor: '#6366f1',
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {selectedUser?.fullName?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {selectedUser?.fullName || 'Chưa đặt tên'}
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {selectedUser?.email}
              </Text>
            </div>
          </Flex>
        }
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedUser && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Status Tags */}
            <Flex gap={8}>
              <Tag color={selectedUser.role === 'Admin' ? 'red' : 'blue'} style={{ fontSize: 13, padding: '4px 12px' }}>
                {selectedUser.role === 'Admin' ? '👑 Quản trị viên' : '👤 Khách hàng'}
              </Tag>
              <Tag
                color={selectedUser.isActive ? 'success' : 'default'}
                icon={selectedUser.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                style={{ fontSize: 13, padding: '4px 12px' }}
              >
                {selectedUser.isActive ? 'Hoạt động' : 'Vô hiệu'}
              </Tag>
            </Flex>

            <Divider style={{ margin: 0 }} />

            {/* User Information */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>
                Thông tin cá nhân
              </Title>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  <Text copyable>{selectedUser.email}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                  {selectedUser.phone ? (
                    <Text copyable>{selectedUser.phone}</Text>
                  ) : (
                    <Text type="secondary" italic>Chưa cập nhật</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>
                  {selectedUser.address ? (
                    <Text>{selectedUser.address}</Text>
                  ) : (
                    <Text type="secondary" italic>Chưa cập nhật</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày tham gia</>}>
                  {dayjs(selectedUser.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Actions */}
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>
                Hành động
              </Title>
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Button
                  block
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => {
                    setDrawerVisible(false)
                    changeRole(selectedUser.id, selectedUser.role)
                  }}
                >
                  {selectedUser.role === 'Admin' ? 'Chuyển thành Khách hàng' : 'Chuyển thành Quản trị viên'}
                </Button>
                <Button
                  block
                  size="large"
                  danger={selectedUser.isActive}
                  icon={selectedUser.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                  onClick={() => {
                    setDrawerVisible(false)
                    toggleStatus(selectedUser.id, selectedUser.isActive)
                  }}
                >
                  {selectedUser.isActive ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                </Button>
              </Space>
            </div>

            {/* Additional Info */}
            <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>ID:</strong> {selectedUser.id}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Vai trò:</strong> {selectedUser.role}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>Trạng thái:</strong> {selectedUser.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                </Text>
              </Space>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  )
}
