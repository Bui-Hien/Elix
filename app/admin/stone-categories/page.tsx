'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Statistic,
  Flex,
  Typography,
  message,
  Popconfirm,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  AppstoreOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { Switch } from 'antd'
import apiClient from '@/lib/api-client'

const { Title, Text } = Typography
const { TextArea } = Input

interface StoneCategory {
  id: number
  name: string
  slug: string
  description?: string
  isActive: boolean
  isRequiredFirst: boolean
}

export default function AdminStoneCategoriesPage() {
  const [categories, setCategories] = useState<StoneCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<StoneCategory | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res: any = await apiClient.get('/admin/stone-categories')
      setCategories(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách loại đá')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setModalVisible(true)
  }

  const handleEditCategory = (category: StoneCategory) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setModalVisible(true)
  }

  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategory) {
        await apiClient.put(`/admin/stone-categories/${editingCategory.id}`, values)
        message.success('Đã cập nhật loại đá')
      } else {
        await apiClient.post('/admin/stone-categories', values)
        message.success('Đã thêm loại đá mới')
      }
      setModalVisible(false)
      fetchCategories()
    } catch (e) {
      message.error('Lỗi khi lưu loại đá')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiClient.delete(`/admin/stone-categories/${id}`)
      setCategories(categories.filter((c) => c.id !== id))
      message.success('Đã xóa loại đá')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Không thể xóa loại đá này')
    }
  }

  const columns: TableColumnsType<StoneCategory> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: StoneCategory, index: number) => index + 1,
    },
    {
      title: 'Tên loại',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Flex gap={8} align="center">
          <AppstoreOutlined style={{ color: '#6366f1', fontSize: 16 }} />
          <Text strong style={{ fontSize: 15 }}>{name}</Text>
        </Flex>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {desc || 'Chưa có mô tả'}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Ẩn'}
        </Tag>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'isRequiredFirst',
      key: 'isRequiredFirst',
      align: 'center',
      width: 150,
      render: (isRequired: boolean) => (
        isRequired ? <Tag color="orange">Bắt buộc add trước</Tag> : <Text type="secondary" style={{ opacity: 0.5 }}>Thường</Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (category: StoneCategory) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(category)}
            style={{ color: '#6366f1' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn chắc chắn muốn xóa loại đá này?"
            onConfirm={() => handleDeleteCategory(category.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const activeCategories = categories.filter((c) => c.isActive)

  return (
    <div className="p-6">
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quản lý Loại Đá & Charm
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý các nhóm đá quý, charm, linh vật cho việc thiết kế vòng tay
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateCategory}
          size="large"
          style={{ borderRadius: 8 }}
        >
          Thêm loại mới
        </Button>
      </Flex>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng số loại</span>}
              value={categories.length}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Đang hoạt động</span>}
              value={activeCategories.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} loại đá`,
          }}
        />
      </Card>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingCategory ? 'Chỉnh sửa loại đá' : 'Thêm loại đá mới'}
          </span>
        }
        open={modalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="Tên loại"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại' }]}
          >
            <Input placeholder="Ví dụ: Đá Quý, Charm Bạc, Linh Vật..." size="large" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug (Mã nhận diện)"
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
          >
            <Input placeholder="Ví dụ: stone, charm, metal..." size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn về loại này..." />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Hiển thị"
              unCheckedChildren="Ẩn"
            />
          </Form.Item>
          <Form.Item
            name="isRequiredFirst"
            label="Phân loại đặc biệt (Bắt buộc add trước)"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Bắt buộc"
              unCheckedChildren="Không"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
