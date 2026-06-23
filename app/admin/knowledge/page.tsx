'use client';

import { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Switch, Space, Tag, Card,
  Typography, message, Popconfirm, Tabs, Badge, Tooltip, Empty, Row, Col, Flex
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  QuestionCircleOutlined, FileTextOutlined, BookOutlined, 
  BulbOutlined, ReloadOutlined, InfoCircleOutlined, FireOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Alert } = require('antd');

interface KnowledgeBase {
  id: number;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  FAQ: { label: 'FAQ', icon: QuestionCircleOutlined, color: 'blue' },
  Policy: { label: 'Chính sách', icon: FileTextOutlined, color: 'green' },
  Guide: { label: 'Hướng dẫn', icon: BookOutlined, color: 'orange' },
  Consultation: { label: 'Tư vấn', icon: BulbOutlined, color: 'purple' },
};

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeBase | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeBase | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/knowledge');
      setItems(response as any);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, displayOrder: 0 });
    setModalVisible(true);
  };

  const handleEdit = (item: KnowledgeBase) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleView = (item: KnowledgeBase) => {
    setViewingItem(item);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/admin/knowledge/${id}`);
      message.success('Xóa thành công');
      fetchItems();
    } catch (error) {
      console.error('Error deleting:', error);
      message.error('Không thể xóa');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await apiClient.put(`/admin/knowledge/${editingItem.id}`, values);
        message.success('Cập nhật thành công');
      } else {
        await apiClient.post('/admin/knowledge', values);
        message.success('Tạo mới thành công');
      }
      setModalVisible(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving:', error);
      message.error('Không thể lưu');
    }
  };

  const columns: ColumnsType<KnowledgeBase> = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => {
        const config = TYPE_CONFIG[type];
        const Icon = config?.icon;
        return (
          <Tag color={config?.color} icon={Icon && <Icon />}>
            {config?.label || type}
          </Tag>
        );
      },
      filters: Object.entries(TYPE_CONFIG).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.content.substring(0, 80)}...
          </Text>
        </div>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.displayOrder - b.displayOrder,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Hoạt động' : 'Tắt'}
        </Tag>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Tắt', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc chắn muốn xóa mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.type === activeTab);

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <Badge count={items.length} showZero offset={[10, 0]}>
            Tất cả
          </Badge>
        </span>
      ),
    },
    ...Object.entries(TYPE_CONFIG).map(([key, config]) => {
      const Icon = config.icon;
      const count = items.filter(item => item.type === key).length;
      return {
        key,
        label: (
          <span>
            <Icon style={{ marginRight: 4 }} />
            <Badge count={count} showZero offset={[10, 0]}>
              {config.label}
            </Badge>
          </span>
        ),
      };
    }),
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          Quản lý Knowledge Base
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Quản lý kiến thức cho chatbot và tư vấn phong thủy
        </Text>
      </div>

      {/* Alert */}
      <Alert
        title="Lưu ý quan trọng"
        description={
          <span>
            Sau khi thêm/sửa/xóa knowledge, bạn cần{' '}
            <a href="/admin/settings" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
              reindex chatbot tại trang Cài đặt
            </a>
            {' '}để chatbot cập nhật kiến thức mới.
          </span>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card 
            hoverable 
            style={{ height: '100%', border: '1px solid #fecaca', background: '#fffafb' }}
            onClick={() => router.push('/admin/elements')}
          >
            <Flex align="center">
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: '#fee2e2', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 
              }}>
                <FireOutlined style={{ fontSize: 24, color: '#ef4444' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0 }}>Đặc Tính Ngũ Hành</Title>
                <Text type="secondary">Quản lý Ưu/Nhược điểm của Kim, Mộc, Thủy, Hỏa, Thổ trong kết quả tư vấn.</Text>
              </div>
              <ArrowRightOutlined style={{ color: '#94a3b8' }} />
            </Flex>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            hoverable 
            style={{ height: '100%', border: '1px solid #e0e7ff', background: '#fbfbff' }}
            onClick={() => router.push('/admin/consultation-stats')}
          >
            <Flex align="center">
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: '#e0e7ff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 
              }}>
                <BulbOutlined style={{ fontSize: 24, color: '#6366f1' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0 }}>Thống kê tư vấn</Title>
                <Text type="secondary">Xem hiệu suất và lịch sử các lượt tư vấn từ khách hàng.</Text>
              </div>
              <ArrowRightOutlined style={{ color: '#94a3b8' }} />
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Thêm mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchItems}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
          <Tooltip title="Sau khi thêm/sửa/xóa knowledge, cần reindex để chatbot cập nhật">
            <Button
              type="dashed"
              icon={<BulbOutlined />}
              onClick={() => window.open('/admin/settings', '_blank')}
              style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
            >
              Reindex Chatbot
            </Button>
          </Tooltip>
        </Space>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} mục`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có dữ liệu"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingItem ? 'Chỉnh sửa Knowledge Base' : 'Thêm mới Knowledge Base'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText={editingItem ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select size="large" placeholder="Chọn loại">
              {Object.entries(TYPE_CONFIG).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <Select.Option key={value} value={value}>
                    <Icon style={{ marginRight: 8 }} />
                    {config.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input size="large" placeholder="Nhập tiêu đề" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea
              rows={10}
              placeholder="Nhập nội dung chi tiết"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              name="displayOrder"
              label="Thứ tự hiển thị"
              rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
              style={{ marginBottom: 0, flex: 1 }}
            >
              <Input type="number" size="large" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết Knowledge Base"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              if (viewingItem) handleEdit(viewingItem);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {viewingItem && (
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Loại:</Text>
                <br />
                <Tag color={TYPE_CONFIG[viewingItem.type]?.color} style={{ marginTop: 4 }}>
                  {TYPE_CONFIG[viewingItem.type]?.label}
                </Tag>
              </div>

              <div>
                <Text type="secondary">Tiêu đề:</Text>
                <br />
                <Title level={4} style={{ marginTop: 4, marginBottom: 0 }}>
                  {viewingItem.title}
                </Title>
              </div>

              <div>
                <Text type="secondary">Nội dung:</Text>
                <Card
                  style={{
                    marginTop: 8,
                    background: '#f5f5f5',
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                    {viewingItem.content}
                  </Paragraph>
                </Card>
              </div>

              <Space size="large">
                <div>
                  <Text type="secondary">Thứ tự:</Text>
                  <br />
                  <Text strong>{viewingItem.displayOrder}</Text>
                </div>
                <div>
                  <Text type="secondary">Trạng thái:</Text>
                  <br />
                  <Tag color={viewingItem.isActive ? 'success' : 'default'}>
                    {viewingItem.isActive ? 'Hoạt động' : 'Tắt'}
                  </Tag>
                </div>
              </Space>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
