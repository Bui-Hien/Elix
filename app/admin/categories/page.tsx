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
  Tabs,
  message,
  Popconfirm,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  TagsOutlined,
  AppstoreOutlined,
  TagOutlined,
  GoldOutlined,
} from '@ant-design/icons'
import { Switch } from 'antd'
import apiClient from '@/lib/api-client'
import { gemstoneApi } from '@/lib/api/gemstones'
import { GemstoneType } from '@/types'

const { Title, Text } = Typography
const { TextArea } = Input

interface Category {
  id: number
  name: string
  description?: string
  isActive: boolean
}

interface TagModel {
  id: number
  name: string
  isActive: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagModel[]>([])
  const [gemstones, setGemstones] = useState<GemstoneType[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tagModalVisible, setTagModalVisible] = useState(false)
  const [gemstoneModalVisible, setGemstoneModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingGemstone, setEditingGemstone] = useState<GemstoneType | null>(null)
  const [form] = Form.useForm()
  const [tagForm] = Form.useForm()
  const [gemstoneForm] = Form.useForm()

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchGemstones()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res: any = await apiClient.get('/admin/categories')
      setCategories(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh mục')
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const res: any = await apiClient.get('/admin/tags')
      setTags(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải tags')
    }
  }

  const fetchGemstones = async () => {
    try {
      const res = await gemstoneApi.getAll()
      setGemstones(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải loại đá')
    }
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ isActive: true }) // Default to active
    setModalVisible(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setModalVisible(true)
  }

  const handleSaveCategory = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategory) {
        await apiClient.put(`/admin/categories/${editingCategory.id}`, values)
        message.success('Đã cập nhật danh mục')
      } else {
        await apiClient.post('/admin/categories', values)
        message.success('Đã thêm danh mục')
      }
      setModalVisible(false)
      fetchCategories()
    } catch (e) {
      message.error('Lỗi khi lưu danh mục')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiClient.delete(`/admin/categories/${id}`)
      setCategories(categories.filter((c) => c.id !== id))
      message.success('Đã xóa danh mục')
    } catch (e) {
      message.error('Không thể xóa (có thể đang có sản phẩm)')
    }
  }

  const handleCreateTag = () => {
    tagForm.resetFields()
    setTagModalVisible(true)
  }

  const handleSaveTag = async () => {
    try {
      const values = await tagForm.validateFields()
      await apiClient.post('/admin/tags', values)
      message.success('Đã thêm thẻ')
      setTagModalVisible(false)
      fetchTags()
    } catch (e) {
      message.error('Lỗi khi thêm thẻ')
    }
  }

  const handleDeleteTag = async (id: number) => {
    try {
      await apiClient.delete(`/admin/tags/${id}`)
      setTags(tags.filter((t) => t.id !== id))
      message.success('Đã xóa thẻ')
    } catch (e) {
      message.error('Không thể xóa')
    }
  }

  const handleCreateGemstone = () => {
    setEditingGemstone(null)
    gemstoneForm.resetFields()
    gemstoneForm.setFieldsValue({ isActive: true })
    setGemstoneModalVisible(true)
  }

  const handleEditGemstone = (gemstone: GemstoneType) => {
    setEditingGemstone(gemstone)
    gemstoneForm.setFieldsValue(gemstone)
    setGemstoneModalVisible(true)
  }

  const handleSaveGemstone = async () => {
    try {
      const values = await gemstoneForm.validateFields()
      if (editingGemstone) {
        await gemstoneApi.update(editingGemstone.id, values)
        message.success('Đã cập nhật loại đá')
      } else {
        await gemstoneApi.create(values)
        message.success('Đã thêm loại đá')
      }
      setGemstoneModalVisible(false)
      fetchGemstones()
    } catch (e) {
      message.error('Lỗi khi lưu loại đá')
    }
  }

  const handleDeleteGemstone = async (id: number) => {
    try {
      await gemstoneApi.delete(id)
      setGemstones(gemstones.filter((g) => g.id !== id))
      message.success('Đã xóa loại đá')
    } catch (e: any) {
      message.error(e.response?.data?.message || 'Không thể xóa')
    }
  }

  const categoryColumns: TableColumnsType<Category> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: Category, index: number) => index + 1,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Flex gap={8} align="center">
          <FolderOutlined style={{ color: '#6366f1', fontSize: 16 }} />
          <Text strong style={{ fontSize: 15 }}>{name}</Text>
        </Flex>
      ),
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
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (category: Category) => (
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
            description="Bạn chắc chắn muốn xóa danh mục này?"
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
  const activeTags = tags.filter((t) => t.isActive)
  const activeGemstones = gemstones.filter((g) => g.isActive)

  const gemstoneColumns: TableColumnsType<GemstoneType> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: GemstoneType, index: number) => index + 1,
    },
    {
      title: 'Tên loại đá',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Flex gap={8} align="center">
          <GoldOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
          <Text strong style={{ fontSize: 15 }}>{name}</Text>
        </Flex>
      ),
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
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (gemstone: GemstoneType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditGemstone(gemstone)}
            style={{ color: '#6366f1' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn chắc chắn muốn xóa loại đá này?"
            onConfirm={() => handleDeleteGemstone(gemstone.id)}
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

  const tabItems = [
    {
      key: 'categories',
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Danh mục sản phẩm
        </span>
      ),
      children: (
        <div>
          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng danh mục</span>}
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

          {/* Table */}
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCategory}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Thêm danh mục
              </Button>
            }
          >
            <Table
              columns={categoryColumns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} danh mục`,
              }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'tags',
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <TagsOutlined style={{ marginRight: 8 }} />
          Thẻ (Tags)
        </span>
      ),
      children: (
        <div>
          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng thẻ</span>}
                  value={tags.length}
                  prefix={<TagsOutlined />}
                  valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Đang hoạt động</span>}
                  value={activeTags.length}
                  prefix={<TagOutlined />}
                  valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tags Display */}
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateTag}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Thêm thẻ
              </Button>
            }
          >
            <Flex wrap="wrap" gap={12}>
              {tags.length === 0 ? (
                <Text type="secondary">Chưa có thẻ nào</Text>
              ) : (
                tags.map((tag) => (
                  <Tag
                    key={tag.id}
                    color="purple"
                    closable
                    onClose={() => handleDeleteTag(tag.id)}
                    style={{
                      fontSize: 14,
                      padding: '6px 12px',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <TagOutlined />
                    {tag.name}
                  </Tag>
                ))
              )}
            </Flex>
          </Card>
        </div>
      ),
    },
    {
      key: 'gemstones',
      label: (
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          <GoldOutlined style={{ marginRight: 8 }} />
          Loại đá
        </span>
      ),
      children: (
        <div>
          {/* Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng loại đá</span>}
                  value={gemstones.length}
                  prefix={<GoldOutlined />}
                  valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card bordered={false} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Đang hoạt động</span>}
                  value={activeGemstones.length}
                  prefix={<GoldOutlined />}
                  valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Table */}
          <Card
            bordered={false}
            style={{ borderRadius: 12 }}
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateGemstone}
                size="large"
                style={{ borderRadius: 8 }}
              >
                Thêm loại đá
              </Button>
            }
          >
            <Table
              columns={gemstoneColumns}
              dataSource={gemstones}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng ${total} loại đá`,
              }}
            />
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Danh mục & Thẻ
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý phân loại và gắn thẻ sản phẩm
          </Text>
        </div>
      </Flex>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="categories"
        items={tabItems}
        size="large"
        style={{
          background: '#fff',
          padding: '16px 24px',
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        }}
      />

      {/* Category Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Vòng tay, Nhẫn..." size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn về danh mục..." />
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
        </Form>
      </Modal>

      {/* Tag Modal */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>Thêm thẻ mới</span>}
        open={tagModalVisible}
        onOk={handleSaveTag}
        onCancel={() => setTagModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
        width={400}
      >
        <Form form={tagForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="Tên thẻ"
            rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
          >
            <Input placeholder="Ví dụ: hot, sale, new..." size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Gemstone Modal */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingGemstone ? 'Chỉnh sửa loại đá' : 'Thêm loại đá mới'}
          </span>
        }
        open={gemstoneModalVisible}
        onOk={handleSaveGemstone}
        onCancel={() => setGemstoneModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={500}
      >
        <Form form={gemstoneForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="Tên loại đá"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại đá' }]}
          >
            <Input placeholder="Ví dụ: Thạch anh tím, Ngọc bích..." size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về loại đá..." />
          </Form.Item>
          {editingGemstone && (
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
          )}
        </Form>
      </Modal>
    </div>
  )
}
