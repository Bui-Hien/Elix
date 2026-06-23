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
  Divider,
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
  LinkOutlined,
} from '@ant-design/icons'
import { getImageUrl } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import EllipseArcEditor from '@/components/admin/ellipse-arc-editor'
import SingleStoneEditor from '@/components/admin/single-stone-editor'

const { Title, Text, Paragraph } = Typography

interface BraceletBase {
  id: number
  name: string
  description: string
  imageUrl: string
  price: number
  color: string
  properties: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  ellipseCenterX?: number
  ellipseCenterY?: number
  ellipseRadiusX?: number
  ellipseRadiusY?: number
  arcStartAngle?: number
  arcEndAngle?: number
  isSingleStoneMode?: boolean
  singleStoneX?: number
  singleStoneY?: number
}

export default function AdminBraceletBasesPage() {
  const [bases, setBases] = useState<BraceletBase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBase, setEditingBase] = useState<BraceletBase | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    color: '#000000',
    size: 10,
    properties: '',
    isAvailable: true,
    ellipseCenterX: 0.5,
    ellipseCenterY: 0.5,
    ellipseRadiusX: 0.35,
    ellipseRadiusY: 0.25,
    arcStartAngle: 3.67,
    arcEndAngle: 5.0,
    isSingleStoneMode: false,
    singleStoneX: 0.5,
    singleStoneY: 0.4,
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    multiStone: 0,
    singleStone: 0,
  })

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = async () => {
    try {
      setLoading(true)
      const data: any = await apiClient.get('/admin/bracelet-bases')
      setBases(data)
      
      setStats({
        total: data.length,
        multiStone: data.filter((b: any) => !b.isSingleStoneMode).length,
        singleStone: data.filter((b: any) => b.isSingleStoneMode).length,
      })
    } catch (error) {
      console.error('Error fetching bases:', error)
      message.error('Không thể tải danh sách phôi vòng')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (base?: BraceletBase) => {
    if (base) {
      setEditingBase(base)
      setFormData({
        name: base.name,
        description: base.description || '',
        imageUrl: base.imageUrl || '',
        price: base.price || 0,
        color: base.color || '#000000',
        size: (base as any).size || 10,
        properties: base.properties || '',
        isAvailable: base.isAvailable,
        ellipseCenterX: base.ellipseCenterX ?? 0.5,
        ellipseCenterY: base.ellipseCenterY ?? 0.5,
        ellipseRadiusX: base.ellipseRadiusX ?? 0.35,
        ellipseRadiusY: base.ellipseRadiusY ?? 0.25,
        arcStartAngle: base.arcStartAngle ?? 3.67,
        arcEndAngle: base.arcEndAngle ?? 5.0,
        isSingleStoneMode: base.isSingleStoneMode ?? false,
        singleStoneX: base.singleStoneX ?? 0.5,
        singleStoneY: base.singleStoneY ?? 0.4,
      })
    } else {
      setEditingBase(null)
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        color: '#000000',
        size: 10,
        properties: '',
        isAvailable: true,
        ellipseCenterX: 0.5,
        ellipseCenterY: 0.5,
        ellipseRadiusX: 0.35,
        ellipseRadiusY: 0.25,
        arcStartAngle: 3.67,
        arcEndAngle: 5.0,
        isSingleStoneMode: false,
        singleStoneX: 0.5,
        singleStoneY: 0.4,
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

    const response: any = await apiClient.post('/upload/image?folder=bases', uploadData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.imageUrl
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      message.error('Vui lòng nhập tên')
      return
    }

    if (!formData.imageUrl && !imageFile) {
      message.error('Vui lòng chọn hình ảnh')
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

      const payload = {
        name: formData.name,
        group: 'cable',
        category: formData.description,
        price: formData.price,
        imageUrl: imageUrl,
        isActive: formData.isAvailable,
        ellipseCenterX: formData.ellipseCenterX,
        ellipseCenterY: formData.ellipseCenterY,
        ellipseRadiusX: formData.ellipseRadiusX,
        ellipseRadiusY: formData.ellipseRadiusY,
        arcStartAngle: formData.arcStartAngle,
        arcEndAngle: formData.arcEndAngle,
        isSingleStoneMode: formData.isSingleStoneMode,
        singleStoneX: formData.singleStoneX,
        singleStoneY: formData.singleStoneY,
      }

      if (editingBase) {
        await apiClient.put(`/admin/bracelet-bases/${editingBase.id}`, payload)
        message.success('Đã cập nhật phôi vòng')
      } else {
        await apiClient.post('/admin/bracelet-bases', payload)
        message.success('Đã tạo phôi vòng mới')
      }

      setIsModalOpen(false)
      fetchBases()
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể lưu phôi vòng')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phôi vòng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await apiClient.delete(`/admin/bracelet-bases/${id}`)
          message.success('Đã xóa phôi vòng')
          fetchBases()
        } catch (error) {
          message.error('Không thể xóa phôi vòng')
        }
      }
    })
  }

  const filteredBases = bases.filter(base =>
    base.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    base.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns: ColumnsType<BraceletBase> = [
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
      width: 120,
      render: (_, record) => (
        <Image
          src={getImageUrl(record.imageUrl)}
          alt={record.name}
          width={80}
          height={80}
          style={{ borderRadius: 8, objectFit: 'contain', background: '#f8f8f8', padding: 4 }}
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
      title: 'Loại Vòng',
      key: 'mode',
      width: 150,
      filters: [
        { text: 'Chế độ Nhiều Đá', value: false },
        { text: 'Chế độ 1 Đá', value: true },
      ],
      onFilter: (value, record) => record.isSingleStoneMode === value,
      render: (_, record) => (
        record.isSingleStoneMode ? (
          <Tag color="orange" style={{ borderRadius: 6 }}>1 Đá Duy Nhất</Tag>
        ) : (
          <Tag color="blue" style={{ borderRadius: 6 }}>Dây Vòng (Nhiều Đá)</Tag>
        )
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
      render: (available) => (
        <Badge status={available ? 'success' : 'error'} text={available ? 'Hoạt động' : 'Tạm ẩn'} />
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
            Quản lý Phôi Vòng
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Thiết lập các loại dây vòng nền và điểm neo cho hạt/charm
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          style={{ borderRadius: 8 }}
        >
          Thêm phôi vòng mới
        </Button>
      </Flex>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text type="secondary">Tổng số phôi vòng</Text>}
              value={stats.total}
              styles={{ content: { fontSize: 32, fontWeight: 700 } }}
              prefix={
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <LinkOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text type="secondary">Vòng nhiều đá (Dây)</Text>}
              value={stats.multiStone}
              styles={{ content: { fontSize: 32, fontWeight: 700, color: '#10b981' } }}
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
              title={<Text type="secondary">Vòng 1 đá cao cấp</Text>}
              value={stats.singleStone}
              styles={{ content: { fontSize: 32, fontWeight: 700, color: '#f59e0b' } }}
              prefix={
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <CloseCircleOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
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
            placeholder="Tìm kiếm theo tên phôi vòng..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 400, borderRadius: 8 }}
            size="large"
          />
          <Text type="secondary">
            Hiển thị <Text strong style={{ color: '#6366f1' }}>{filteredBases.length}</Text> / {bases.length} vật phẩm
          </Text>
        </Flex>
      </Card>

      {/* Table */}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredBases}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} phôi vòng`,
            style: { marginTop: 24 },
          }}
          locale={{ emptyText: <Empty description="Không tìm thấy kết quả" /> }}
        />
      </Card>

      {/* Form Modal */}
      <Modal
        title={editingBase ? 'Chỉnh sửa phôi vòng' : 'Thêm phôi vòng mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={uploading}
        okText={editingBase ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <div style={{ marginBottom: 20 }}>
                <Text strong>Tên phôi vòng *</Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Dây lụa đỏ 1.5mm"
                  style={{ marginTop: 8 }}
                  size="large"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong>Giá bổ sung (₫)</Text>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  style={{ marginTop: 8 }}
                  size="large"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong>Hình ảnh sản phẩm *</Text>
                <div style={{ marginTop: 8 }}>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    Nên dùng ảnh PNG nền trong suốt, kích thước khoảng 1000x1000px
                  </Paragraph>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 20 }}>
                <Text strong>Mô tả / Loại</Text>
                <Input.TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về chất liệu, nguồn gốc..."
                  rows={4}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                <Flex vertical align="start" gap={8}>
                  <Text strong>Trạng thái</Text>
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  />
                </Flex>
                <Flex vertical align="start" gap={8}>
                  <Text strong>Chế độ 1 đá</Text>
                  <Switch
                    checked={formData.isSingleStoneMode}
                    onChange={(checked) => setFormData({ ...formData, isSingleStoneMode: checked })}
                  />
                </Flex>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '0' }} />

          {formData.imageUrl && (
            <div>
              <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EditOutlined /> Cấu hình điểm neo (Anchor Points)
              </Title>
              <Paragraph type="secondary">
                {formData.isSingleStoneMode 
                  ? 'Kéo điểm màu hồng để xác định vị trí viên đá duy nhất trên dây.'
                  : 'Xác định cung tròn nơi các hạt sẽ được xâu vào dây.'}
              </Paragraph>
              
              <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, border: '1px dashed #d9d9d9' }}>
                {!formData.isSingleStoneMode ? (
                  <EllipseArcEditor
                    imageUrl={formData.imageUrl}
                    config={{
                      ellipseCenterX: formData.ellipseCenterX,
                      ellipseCenterY: formData.ellipseCenterY,
                      ellipseRadiusX: formData.ellipseRadiusX,
                      ellipseRadiusY: formData.ellipseRadiusY,
                      arcStartAngle: formData.arcStartAngle,
                      arcEndAngle: formData.arcEndAngle,
                    }}
                    onChange={(config) => setFormData({ ...formData, ...config })}
                  />
                ) : (
                  <SingleStoneEditor
                    imageUrl={formData.imageUrl}
                    singleStoneX={formData.singleStoneX}
                    singleStoneY={formData.singleStoneY}
                    onChange={(config) => setFormData({ ...formData, ...config })}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

