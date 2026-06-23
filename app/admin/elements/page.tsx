'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Flex,
  Typography,
  Popconfirm,
  Tag,
  Select,
  Tabs
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FireOutlined,
  MinusCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { App } from 'antd'
import apiClient from '@/lib/api-client'

const { Title, Text } = Typography
const { TextArea } = Input

interface ElementTrait {
  title: string;
  description: string;
}

interface ElementCharacteristic {
  id: number;
  element: string;
  positiveTraits: ElementTrait[];
  negativeTraits: ElementTrait[];
  description: string;
  soundUrl?: string;
}

interface RecommendedStone {
  name: string;
  description: string;
}

interface ElementDeficit {
  id: number;
  deficitElement: string;
  title: string;
  weakDescription: string;
  weakSymptoms: ElementTrait[];
  compensationTitle: string;
  compensationDescription: string;
  compensationBenefits: ElementTrait[];
  recommendedStones: RecommendedStone[];
}

// ─── Element Characteristics Tab ─────────────────────────────────
function ElementCharacteristicsTab() {
  const [characteristics, setCharacteristics] = useState<ElementCharacteristic[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingChar, setEditingChar] = useState<ElementCharacteristic | null>(null)
  const [form] = Form.useForm()
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { message } = App.useApp()

  useEffect(() => {
    fetchCharacteristics()
  }, [])

  const fetchCharacteristics = async () => {
    try {
      setLoading(true)
      const res: any = await apiClient.get('/admin/element-characteristics')
      setCharacteristics(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải đặc tính bản mệnh')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingChar(null)
    form.resetFields()
    form.setFieldsValue({
      positiveTraits: [{}],
      negativeTraits: [{}]
    })
    setAudioUrl(null)
    setModalVisible(true)
  }

  const handleEdit = (char: ElementCharacteristic) => {
    setEditingChar(char)
    setAudioUrl(char.soundUrl || null)
    form.setFieldsValue(char)
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...values, soundUrl: audioUrl }
      if (editingChar) {
        await apiClient.put(`/admin/element-characteristics/${editingChar.id}`, data)
        message.success('Đã cập nhật đặc tính')
      } else {
        await apiClient.post('/admin/element-characteristics', data)
        message.success('Đã thêm đặc tính')
      }
      setModalVisible(false)
      fetchCharacteristics()
    } catch (e: any) {
      message.error(e?.response?.data || 'Lỗi khi lưu đặc tính')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/element-characteristics/${id}`)
      setCharacteristics(characteristics.filter((c) => c.id !== id))
      message.success('Đã xóa đặc tính')
    } catch (e) {
      message.error('Không thể xóa đặc tính này')
    }
  }

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'kim': return 'default';
      case 'mộc': return 'success';
      case 'thủy': return 'blue';
      case 'hỏa': return 'error';
      case 'thổ': return 'warning';
      default: return 'default';
    }
  }

  const columns: TableColumnsType<ElementCharacteristic> = [
    {
      title: 'Hành',
      dataIndex: 'element',
      key: 'element',
      render: (element: string) => (
        <Tag color={getElementColor(element)} style={{ fontSize: 14, padding: '4px 12px' }}>
          {element}
        </Tag>
      ),
    },
    {
      title: 'Mô tả chung',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
          {desc || 'Chưa định nghĩa'}
        </Text>
      )
    },
    {
      title: 'Số Ưu Điểm',
      key: 'posCount',
      align: 'center',
      render: (_: any, record: ElementCharacteristic) => (
        <Text>{record.positiveTraits?.length || 0}</Text>
      )
    },
    {
      title: 'Số Khuyết Điểm',
      key: 'negCount',
      align: 'center',
      render: (_: any, record: ElementCharacteristic) => (
        <Text>{record.negativeTraits?.length || 0}</Text>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (char: ElementCharacteristic) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(char)}
            style={{ color: '#6366f1' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn chắc chắn muốn xóa đặc tính này?"
            onConfirm={() => handleDelete(char.id)}
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

  return (
    <>
      <Card
        variant="borderless"
        style={{ borderRadius: 12 }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{ borderRadius: 8 }}
          >
            Thêm Ngũ Hành
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={characteristics}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingChar ? `Chỉnh sửa: ${editingChar.element}` : 'Thêm Đặc Tính Mới'}
          </span>
        }
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="element"
            label="Hành"
            rules={[{ required: true, message: 'Vui lòng chọn hệ' }]}
          >
            <Select size="large" placeholder="Chọn hành..." disabled={!!editingChar}>
              <Select.Option value="Kim">Kim</Select.Option>
              <Select.Option value="Mộc">Mộc</Select.Option>
              <Select.Option value="Thủy">Thủy</Select.Option>
              <Select.Option value="Hỏa">Hỏa</Select.Option>
              <Select.Option value="Thổ">Thổ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Đoạn văn kết nối (Lời khuyên chung)">
            <TextArea rows={3} placeholder="Ví dụ: Người mang mệnh Hỏa cần khắc phục tính nóng vội..." />
          </Form.Item>

          {/* Positive Traits Dynamic Form */}
          <div className="bg-emerald-50 p-4 rounded-xl mb-6">
            <h4 className="font-bold text-emerald-700 mb-4">Ưu Điểm (Tích Cực)</h4>
            <Form.List name="positiveTraits">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                      >
                        <Input placeholder="Tiêu đề (Vd: Sáng tạo)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        style={{ width: 400 }}
                        rules={[{ required: true, message: 'Nhập mô tả' }]}
                      >
                        <Input placeholder="Mô tả chi tiết" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm Ưu Điểm
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* Negative Traits Dynamic Form */}
          <div className="bg-rose-50 p-4 rounded-xl mb-4">
            <h4 className="font-bold text-rose-700 mb-4">Khuyết Điểm (Hạn Chế)</h4>
            <Form.List name="negativeTraits">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                      >
                        <Input placeholder="Tiêu đề (Vd: Nóng nảy)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        style={{ width: 400 }}
                        rules={[{ required: true, message: 'Nhập mô tả' }]}
                      >
                        <Input placeholder="Mô tả chi tiết" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm Khuyết Điểm
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </>
  )
}

// ─── Element Deficits Tab ────────────────────────────────────────
function ElementDeficitsTab() {
  const [deficits, setDeficits] = useState<ElementDeficit[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingDeficit, setEditingDeficit] = useState<ElementDeficit | null>(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  useEffect(() => {
    fetchDeficits()
  }, [])

  const fetchDeficits = async () => {
    try {
      setLoading(true)
      const res: any = await apiClient.get('/admin/element-deficits')
      setDeficits(res)
    } catch (err) {
      console.error(err)
      message.error('Không thể tải dữ liệu Mệnh Khuyết')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingDeficit(null)
    form.resetFields()
    form.setFieldsValue({
      weakSymptoms: [{}],
      compensationBenefits: [{}],
      recommendedStones: [{}]
    })
    setModalVisible(true)
  }

  const handleEdit = (deficit: ElementDeficit) => {
    setEditingDeficit(deficit)
    form.setFieldsValue(deficit)
    setModalVisible(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingDeficit) {
        await apiClient.put(`/admin/element-deficits/${editingDeficit.id}`, values)
        message.success('Đã cập nhật Mệnh Khuyết')
      } else {
        await apiClient.post('/admin/element-deficits', values)
        message.success('Đã thêm Mệnh Khuyết')
      }
      setModalVisible(false)
      fetchDeficits()
    } catch (e: any) {
      message.error(e?.response?.data || 'Lỗi khi lưu Mệnh Khuyết')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/element-deficits/${id}`)
      setDeficits(deficits.filter((d) => d.id !== id))
      message.success('Đã xóa Mệnh Khuyết')
    } catch (e) {
      message.error('Không thể xóa Mệnh Khuyết này')
    }
  }

  const getElementColor = (element: string) => {
    switch (element.toLowerCase()) {
      case 'kim': return 'default';
      case 'mộc': return 'success';
      case 'thủy': return 'blue';
      case 'hỏa': return 'error';
      case 'thổ': return 'warning';
      default: return 'default';
    }
  }

  const columns: TableColumnsType<ElementDeficit> = [
    {
      title: 'Hành Khuyết',
      dataIndex: 'deficitElement',
      key: 'deficitElement',
      width: 120,
      render: (element: string) => (
        <Tag color={getElementColor(element)} style={{ fontSize: 14, padding: '4px 12px' }}>
          Khuyết {element}
        </Tag>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text strong style={{ fontSize: 14 }}>
          {title || 'Chưa đặt'}
        </Text>
      )
    },
    {
      title: 'Số triệu chứng',
      key: 'weakCount',
      align: 'center',
      width: 130,
      render: (_: any, record: ElementDeficit) => (
        <Tag color="red">{record.weakSymptoms?.length || 0} triệu chứng</Tag>
      )
    },
    {
      title: 'Số lợi ích bù',
      key: 'benefitCount',
      align: 'center',
      width: 130,
      render: (_: any, record: ElementDeficit) => (
        <Tag color="green">{record.compensationBenefits?.length || 0} lợi ích</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (deficit: ElementDeficit) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(deficit)}
            style={{ color: '#6366f1' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn chắc chắn muốn xóa dữ liệu Mệnh Khuyết này?"
            onConfirm={() => handleDelete(deficit.id)}
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

  return (
    <>
      <Card
        variant="borderless"
        style={{ borderRadius: 12 }}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
            style={{ borderRadius: 8 }}
          >
            Thêm Mệnh Khuyết
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={deficits}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingDeficit ? `Chỉnh sửa: Khuyết ${editingDeficit.deficitElement}` : 'Thêm Mệnh Khuyết Mới'}
          </span>
        }
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={900}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="deficitElement"
            label="Hành Khuyết"
            rules={[{ required: true, message: 'Vui lòng chọn hành khuyết' }]}
          >
            <Select size="large" placeholder="Chọn hành khuyết..." disabled={!!editingDeficit}>
              <Select.Option value="Kim">Kim (Sinh Mùa Xuân)</Select.Option>
              <Select.Option value="Mộc">Mộc (Sinh Mùa Thu)</Select.Option>
              <Select.Option value="Thủy">Thủy (Sinh Mùa Hạ)</Select.Option>
              <Select.Option value="Hỏa">Hỏa (Sinh Mùa Đông)</Select.Option>
              <Select.Option value="Thổ">Thổ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề chính"
            rules={[{ required: true, message: 'Nhập tiêu đề' }]}
          >
            <Input size="large" placeholder="Vd: KHUYẾT KIM - BÙ KIM" />
          </Form.Item>

          {/* Weak Section */}
          <div className="bg-red-50 p-5 rounded-xl mb-6 border border-red-100">
            <h4 className="font-bold text-red-700 mb-2 text-base">KHI NĂNG LƯỢNG HÀNH SUY YẾU</h4>
            
            <Form.Item
              name="weakDescription"
              label="Mô tả tổng quan khi hành suy yếu"
            >
              <TextArea rows={3} placeholder="Vd: KHI NĂNG LƯỢNG HÀNH KIM SUY YẾU..." />
            </Form.Item>

            <h5 className="font-semibold text-red-600 mb-3">Các triệu chứng (Biểu hiện tiêu cực)</h5>
            <Form.List name="weakSymptoms">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="bg-white rounded-lg p-3 mb-3 border border-red-100">
                      <Flex gap={12} align="start">
                        <div style={{ flex: 1 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'title']}
                            rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <Input placeholder="Tiêu đề (Vd: Tư duy rời rạc, thiếu tập trung)" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            rules={[{ required: true, message: 'Nhập mô tả' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea rows={2} placeholder="Mô tả chi tiết biểu hiện..." />
                          </Form.Item>
                        </div>
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', fontSize: 18, marginTop: 8 }} />
                      </Flex>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#fca5a5', color: '#dc2626' }}>
                      Thêm Triệu Chứng
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* Compensation Section */}
          <div className="bg-emerald-50 p-5 rounded-xl mb-4 border border-emerald-100">
            <h4 className="font-bold text-emerald-700 mb-2 text-base">BÙ HÀNH - CÂN BẰNG NĂNG LƯỢNG</h4>
            
            <Form.Item
              name="compensationTitle"
              label="Tiêu đề phần bù"
              rules={[{ required: true, message: 'Nhập tiêu đề' }]}
            >
              <Input size="large" placeholder="Vd: BÙ KIM: KHẲNG ĐỊNH VỊ THẾ & TƯ DUY SẮC BÉN" />
            </Form.Item>

            <Form.Item
              name="compensationDescription"
              label="Mô tả tổng quan khi được bù đắp"
            >
              <TextArea rows={3} placeholder="Vd: Khi năng lượng Kim được cân bằng đúng cách bằng đá tự nhiên..." />
            </Form.Item>

            <h5 className="font-semibold text-emerald-600 mb-3">Các lợi ích khi bù đắp</h5>
            <Form.List name="compensationBenefits">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="bg-white rounded-lg p-3 mb-3 border border-emerald-100">
                      <Flex gap={12} align="start">
                        <div style={{ flex: 1 }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'title']}
                            rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                            style={{ marginBottom: 8 }}
                          >
                            <Input placeholder="Tiêu đề (Vd: Tư Duy Chiến Lược)" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            rules={[{ required: true, message: 'Nhập mô tả' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea rows={2} placeholder="Mô tả chi tiết lợi ích khi được bù đắp..." />
                          </Form.Item>
                        </div>
                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', fontSize: 18, marginTop: 8 }} />
                      </Flex>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#86efac', color: '#059669' }}>
                      Thêm Lợi Ích
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* Recommended Stones Section */}
          <div className="bg-blue-50 p-5 rounded-xl mb-4 border border-blue-100">
            <h4 className="font-bold text-blue-700 mb-2 text-base">ĐÁ PHONG THỦY GỢI Ý</h4>
            <p className="text-xs text-blue-500 mb-4">Danh sách tên đá cụ thể phù hợp để bù khuyết hành này. Hiển thị ở dòng &quot;Để bổ sung hành... dùng đá quý như: ...&quot;</p>
            
            <Form.List name="recommendedStones">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Nhập tên đá' }]}
                      >
                        <Input placeholder="Tên đá (Vd: Thạch anh trắng)" style={{ width: 350 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ borderColor: '#93c5fd', color: '#2563eb' }}>
                      Thêm Loại Đá
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AdminElementCharacteristicsPage() {
  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            <FireOutlined style={{ color: '#ef4444', marginRight: 12 }} />
            Đặc Tính Ngũ Hành
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Quản lý phần diễn giải ưu/nhược điểm và dữ liệu Mệnh Khuyết cho trang tư vấn
          </Text>
        </div>
      </Flex>

      <Tabs
        defaultActiveKey="characteristics"
        type="card"
        size="large"
        items={[
          {
            key: 'characteristics',
            label: (
              <span>
                <FireOutlined style={{ marginRight: 8 }} />
                Đặc Tính Ngũ Hành
              </span>
            ),
            children: <ElementCharacteristicsTab />,
          },
          {
            key: 'deficits',
            label: (
              <span>
                <ThunderboltOutlined style={{ marginRight: 8 }} />
                Mệnh Khuyết - Bù Hành
              </span>
            ),
            children: <ElementDeficitsTab />,
          },
        ]}
      />
    </div>
  )
}
