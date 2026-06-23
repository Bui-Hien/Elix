'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Dropdown,
  Image,
  Modal,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Flex,
  Typography,
  Badge,
  Empty,
  Switch,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GoldOutlined,
} from '@ant-design/icons'
import { getImageUrl } from '@/lib/utils'
import apiClient from '@/lib/api-client'

const { Title, Text, Paragraph } = Typography

interface StoneCategory {
  id: number
  name: string
  slug: string
}

interface Stone {
  id: number
  name: string
  description: string
  imageUrl: string
  price: number
  color: string
  size: number
  displaySize: string
  shape: string
  properties: string
  type: string
  stoneCategoryId?: number
  stoneCategory?: StoneCategory
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminStonesPage() {
  const [stones, setStones] = useState<Stone[]>([])
  const [stoneCategories, setStoneCategories] = useState<StoneCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStone, setEditingStone] = useState<Stone | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [showInactiveCategories, setShowInactiveCategories] = useState(false)

  // For Antd Form
  const [formData, setFormData] = useState({
    name: '',
    stoneCategoryId: undefined as number | undefined,
    type: 'stone',
    description: '',
    imageUrl: '',
    price: 0,
    size: 10,
    displaySize: '',
    shape: 'sphere' as string,
    properties: '',
    isAvailable: true,
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
  })

  useEffect(() => {
    fetchStones()
    fetchCategories()
  }, [showInactiveCategories])

  const fetchStones = async () => {
    try {
      setLoading(true)
      const data: any = await apiClient.get(`/admin/stones?includeInactiveCategories=${showInactiveCategories}`)
      const filteredData = data.filter((s: any) => s.type !== 'base')
      setStones(filteredData)
      
      setStats({
        total: filteredData.length,
        available: filteredData.filter((s: any) => s.isAvailable).length,
        unavailable: filteredData.filter((s: any) => !s.isAvailable).length,
      })
    } catch (error) {
      console.error('Error fetching stones:', error)
      message.error('Không thể tải danh sách đá')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data: any = await apiClient.get('/admin/stone-categories?isActive=true')
      setStoneCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleOpenModal = (stone?: Stone) => {
    if (stone) {
      setEditingStone(stone)
      setFormData({
        name: stone.name,
        stoneCategoryId: stone.stoneCategoryId,
        type: stone.type || 'stone',
        description: stone.description || '',
        imageUrl: stone.imageUrl || '',
        price: stone.price || 0,
        size: stone.size || 10,
        displaySize: stone.displaySize || '',
        shape: stone.shape || 'sphere',
        properties: stone.properties || '',
        isAvailable: stone.isAvailable,
      })
    } else {
      setEditingStone(null)
      setFormData({
        name: '',
        stoneCategoryId: stoneCategories[0]?.id,
        type: stoneCategories[0]?.slug || 'stone',
        description: '',
        imageUrl: '',
        price: 0,
        size: 10,
        displaySize: '',
        shape: 'sphere',
        properties: '',
        isAvailable: true,
      })
    }
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const uploadData = new FormData()
    uploadData.append('file', file)

    const response: any = await apiClient.post('/upload/image?folder=stones', uploadData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.imageUrl
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      message.error('Vui lòng nhập tên')
      return
    }

    try {
      setUploading(true)
      let imageUrl = formData.imageUrl

      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (uploadError: any) {
          message.error(`Lỗi upload ảnh: ${uploadError.message}`)
          setUploading(false)
          return
        }
      }

      const payload = { ...formData, imageUrl, color: '#000000' }

      if (editingStone) {
        await apiClient.put(`/admin/stones/${editingStone.id}`, payload)
        message.success('Đã cập nhật đá')
      } else {
        await apiClient.post('/admin/stones', payload)
        message.success('Đã tạo đá mới')
      }

      setIsModalOpen(false)
      fetchStones()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể lưu đá')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đá này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/admin/stones/${id}`)
          message.success('Đã xóa đá')
          fetchStones()
        } catch (error) {
          message.error('Không thể xóa đá')
        }
      }
    })
  }

  const filteredStones = stones.filter(stone =>
    stone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stone.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: ColumnsType<Stone> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Hình ảnh',
      key: 'imageUrl',
      width: 100,
      render: (_, record) => (
        <Image
          src={getImageUrl(record.imageUrl)}
          alt={record.name}
          width={48}
          height={48}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback="/placeholder.svg"
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Loại',
      key: 'stoneCategory',
      width: 150,
      filters: stoneCategories.map(c => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.stoneCategoryId === value,
      render: (_, record) => (
        <Tag color="purple" style={{ borderRadius: 6 }}>
          {record.stoneCategory?.name || record.type}
        </Tag>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.size || 0) - (b.size || 0),
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
            {record.size || 10}
          </Tag>
          {record.displaySize && (
            <Text type="secondary" style={{ fontSize: 11 }}>{record.displaySize}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (price) => <Text strong>{price.toLocaleString('vi-VN')}₫</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isAvailable',
      key: 'isAvailable',
      align: 'center',
      filters: [
        { text: 'Có sẵn', value: true },
        { text: 'Không có', value: false },
      ],
      onFilter: (value, record) => record.isAvailable === value,
      render: (available) => (
        <Badge status={available ? 'success' : 'error'} text={available ? 'Có sẵn' : 'Không có'} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#6366f1' }} />}
            onClick={() => handleOpenModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quản lý Đá & Charm
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý toàn bộ {stats.total} loại đá và charm cho việc thiết kế vòng tay
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          style={{ borderRadius: 8 }}
        >
          Thêm đá mới
        </Button>
      </Flex>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text type="secondary">Tổng số đá/charm</Text>}
              value={stats.total}
              valueStyle={{ fontSize: 32, fontWeight: 700 }}
              prefix={
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <GoldOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text type="secondary">Đang có sẵn</Text>}
              value={stats.available}
              valueStyle={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}
              prefix={
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text type="secondary">Tạm hết hàng</Text>}
              value={stats.unavailable}
              valueStyle={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}
              prefix={
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Card variant="borderless" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <Input
            placeholder="Tìm kiếm theo tên, mô tả..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 400, borderRadius: 8 }}
            size="large"
          />
          <Flex gap={16} align="center">
            <Flex align="center" gap={8}>
              <Switch 
                size="small" 
                checked={showInactiveCategories} 
                onChange={setShowInactiveCategories} 
              />
              <Text type="secondary">Hiện cả loại đã ẩn</Text>
            </Flex>
            <Text type="secondary">
              Hiển thị <Text strong style={{ color: '#6366f1' }}>{filteredStones.length}</Text> / {stones.length} vật phẩm
            </Text>
          </Flex>
        </Flex>
      </Card>

      {/* Table */}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredStones}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} vật phẩm`,
            style: { marginTop: 24 },
          }}
          locale={{ emptyText: <Empty description="Không tìm thấy kết quả" /> }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingStone ? 'Chỉnh sửa đá' : 'Thêm đá mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={uploading}
        okText={editingStone ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={600}
      >
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Text strong>Tên *</Text>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Thạch Anh Hồng"
              style={{ marginTop: 8 }}
              size="large"
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Loại *</Text>
              <select
                value={formData.stoneCategoryId}
                onChange={(e) => {
                  const id = parseInt(e.target.value)
                  const cat = stoneCategories.find(c => c.id === id)
                  setFormData({ ...formData, stoneCategoryId: id, type: cat?.slug || 'stone' })
                }}
                style={{ width: '100%', height: 40, marginTop: 8, padding: '0 11px', borderRadius: 8, border: '1px solid #d9d9d9' }}
              >
                <option value="">Chọn loại...</option>
                {stoneCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </Col>
            <Col span={12}>
              <Text strong>Giá (₫) *</Text>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                style={{ marginTop: 8 }}
                size="large"
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Size (rendering) *</Text>
              <Input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || 10 })}
                placeholder="10"
                style={{ marginTop: 8 }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                Điều khiển kích thước đá trên vòng tay và giãn cách
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>Size hiển thị</Text>
              <Input
                value={formData.displaySize}
                onChange={(e) => setFormData({ ...formData, displaySize: e.target.value })}
                placeholder="VD: 10mm, 12mm"
                style={{ marginTop: 8 }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                Hiển thị cho người dùng chọn trên trang customize
              </Text>
            </Col>
            <Col span={8}>
              <Text strong>Hình dạng</Text>
              <select
                value={formData.shape}
                onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                style={{ width: '100%', height: 40, marginTop: 8, padding: '0 11px', borderRadius: 8, border: '1px solid #d9d9d9' }}
              >
                <option value="sphere">Tròn (Sphere)</option>
                <option value="heart">Trái tim (Heart)</option>
                <option value="star">Ngôi sao (Star)</option>
                <option value="snowflake">Hoa tuyết (Snowflake)</option>
                <option value="butterfly">Con bướm (Butterfly)</option>
                <option value="ring">Nhẫn (Ring)</option>
                <option value="tube">Ống (Tube)</option>
              </select>
            </Col>
          </Row>

          <div>
            <Text strong>Mô tả</Text>
            <Input.TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả về đá..."
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>

          <div>
            <Text strong>Hình ảnh</Text>
            <div style={{ marginTop: 8, display: 'flex', gap: 16, alignItems: 'center' }}>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {formData.imageUrl && (
                <Image
                  src={getImageUrl(formData.imageUrl)}
                  alt="Preview"
                  width={64}
                  height={64}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              )}
            </div>
          </div>

          <div>
            <Text strong>Thuộc tính / Ý nghĩa</Text>
            <Input.TextArea
              value={formData.properties}
              onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
              placeholder="Năng lượng, ý nghĩa phong thủy..."
              rows={2}
              style={{ marginTop: 8 }}
            />
          </div>

          <Flex align="center" gap={12}>
            <Switch
              checked={formData.isAvailable}
              onChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
            />
            <Text>Đang có sẵn để sử dụng</Text>
          </Flex>
        </div>
      </Modal>
    </div>
  )
}

