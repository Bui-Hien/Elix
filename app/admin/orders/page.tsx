'use client'

import { useState, useEffect } from "react"
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Tag,
  Modal,
  Statistic,
  Row,
  Col,
  App,
  Flex,
  Typography,
  Badge,
  Empty,
  Descriptions,
  Divider,
  Input,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import {
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { adminOrdersApi, OrderListDto, OrderDetailDto } from "@/lib/api/admin-orders"
import Image from "next/image"
import { getImageUrl } from "@/lib/utils"

const { Title, Text } = Typography

// Order status mapping
const ORDER_STATUS = {
  Pending: { label: "Chờ xử lý", color: "gold" },
  Paid: { label: "Đã thanh toán", color: "blue" },
  Shipping: { label: "Đang giao", color: "cyan" },
  Done: { label: "Hoàn thành", color: "green" },
  Cancelled: { label: "Đã hủy", color: "red" },
}

const PAYMENT_STATUS = {
  Unpaid: { label: "Chưa thanh toán", color: "orange" },
  Paid: { label: "Đã thanh toán", color: "green" },
  Failed: { label: "Thất bại", color: "red" },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderListDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailDto | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const { message, modal } = App.useApp()

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await adminOrdersApi.getAll()
      setOrders(data)
    } catch (error: any) {
      message.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const allOrders = await adminOrdersApi.getAll()
      const pending = allOrders.filter(o => o.status === "Pending").length
      const completed = allOrders.filter(o => o.status === "Done").length
      const revenue = allOrders
        .filter(o => o.paymentStatus === "Paid")
        .reduce((sum, o) => sum + o.totalAmount, 0)

      setStats({
        total: allOrders.length,
        pending,
        completed,
        revenue,
      })
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      const matchesName = order.customerName.toLowerCase().includes(query)
      const matchesOrderId = order.id.toLowerCase().includes(query)
      const matchesPhone = order.phone?.toLowerCase().includes(query)
      return matchesName || matchesOrderId || matchesPhone
    }
    return true
  })

  const handleViewDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true)
      setDetailModalOpen(true)
      const detail = await adminOrdersApi.getById(orderId)
      setSelectedOrder(detail)
    } catch (error: any) {
      message.error("Không thể tải chi tiết đơn hàng")
      setDetailModalOpen(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    modal.confirm({
      title: "Xác nhận cập nhật trạng thái",
      content: `Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "${ORDER_STATUS[newStatus as keyof typeof ORDER_STATUS]?.label}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          setUpdatingStatus(orderId)
          await adminOrdersApi.updateStatus(orderId, newStatus)
          message.success("Cập nhật trạng thái thành công")
          fetchOrders()
          fetchStats()
        } catch (error: any) {
          message.error("Không thể cập nhật trạng thái")
        } finally {
          setUpdatingStatus(null)
        }
      },
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const columns: ColumnsType<OrderListDto> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <Text style={{ fontWeight: 500 }}>{index + 1}</Text>
      ),
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      width: 150,
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: (id) => (
        <Text code style={{ fontSize: 12 }}>
          {id.substring(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 200,
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (date) => (
        <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: "Thanh toán lúc",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 150,
      sorter: (a, b) => {
        if (!a.paidAt && !b.paidAt) return 0
        if (!a.paidAt) return 1
        if (!b.paidAt) return -1
        return new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
      },
      render: (date) => (
        date ? (
          <Text style={{ fontSize: 13, color: '#52c41a' }}>{formatDate(date)}</Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 13 }}>—</Text>
        )
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      align: "right",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => (
        <Text strong style={{ fontSize: 14, color: "#1890ff" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 130,
      align: "center",
      filters: [
        { text: 'Chưa thanh toán', value: 'Unpaid' },
        { text: 'Đã thanh toán', value: 'Paid' },
        { text: 'Thất bại', value: 'Failed' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
      render: (status) => {
        const config = PAYMENT_STATUS[status as keyof typeof PAYMENT_STATUS]
        return (
          <Tag color={config?.color || "default"} style={{ borderRadius: 6 }}>
            {config?.label || status}
          </Tag>
        )
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      filters: [
        { text: 'Chờ xử lý', value: 'Pending' },
        { text: 'Đã thanh toán', value: 'Paid' },
        { text: 'Đang giao', value: 'Shipping' },
        { text: 'Hoàn thành', value: 'Done' },
        { text: 'Đã hủy', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) => {
        const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS]
        const isUpdating = updatingStatus === record.id

        return (
          <Select
            value={status}
            onChange={(value) => handleUpdateStatus(record.id, value)}
            loading={isUpdating}
            disabled={isUpdating}
            style={{ width: "100%" }}
            size="small"
          >
            {Object.entries(ORDER_STATUS).map(([key, { label, color }]) => (
              <Select.Option key={key} value={key}>
                <Tag color={color} style={{ borderRadius: 6, margin: 0 }}>
                  {label}
                </Tag>
              </Select.Option>
            ))}
          </Select>
        )
      },
    },
    {
      title: "",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quản lý đơn hàng
          </Title>
          <Text type="secondary" style={{ fontSize: 15, marginTop: 4, display: "block" }}>
            Quản lý toàn bộ {stats.total} đơn hàng trong hệ thống
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} size="large" onClick={() => { fetchOrders(); fetchStats(); }}>
          Làm mới
        </Button>
      </Flex>

      {/* Stats cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Tổng đơn hàng</Text>}
              value={stats.total}
              formatter={(value) => <span style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>{value}</span>}
              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <ShoppingCartOutlined style={{ fontSize: 24, color: "white" }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Chờ xử lý</Text>}
              value={stats.pending}
              formatter={(value) => <span style={{ fontSize: 32, fontWeight: 700, color: "#faad14" }}>{value}</span>}
              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#fffbe6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 24, color: "#faad14" }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Hoàn thành</Text>}
              value={stats.completed}
              formatter={(value) => <span style={{ fontSize: 32, fontWeight: 700, color: "#52c41a" }}>{value}</span>}
              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f6ffed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Doanh thu</Text>}
              value={stats.revenue}
              formatter={(value) => <span style={{ fontSize: 28, fontWeight: 700, color: "#1890ff" }}>{formatCurrency(Number(value))}</span>}

              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#e6f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <DollarOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Search bar */}
      <Card variant="borderless" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Flex align="center" gap={12} wrap="wrap" justify="space-between">
          <Input
            placeholder="Tìm theo tên khách hàng, mã đơn hàng, số điện thoại..."
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 400, borderRadius: 8 }}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          />
          <Text type="secondary">
            Hiển thị <Text strong style={{ color: '#6366f1' }}>{filteredOrders.length}</Text> / {orders.length} đơn hàng
          </Text>
        </Flex>
      </Card>

      {/* Orders table */}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong ${total} đơn hàng`,
            style: { marginTop: 24 },
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy đơn hàng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Text strong style={{ fontSize: 18 }}>
            Chi tiết đơn hàng #{selectedOrder?.id.substring(0, 8).toUpperCase()}
          </Text>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false)
          setSelectedOrder(null)
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {loadingDetail ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text>Đang tải...</Text>
          </div>
        ) : selectedOrder ? (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Khách hàng" span={2}>
                <Text strong>{selectedOrder.customerName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.email}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedOrder.address}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  <Text type="secondary">{selectedOrder.note}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày đặt">
                {formatDate(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán lúc">
                {selectedOrder.paidAt ? (
                  <Text style={{ color: '#52c41a', fontWeight: 500 }}>
                    {formatDate(selectedOrder.paidAt)}
                  </Text>
                ) : (
                  <Text type="secondary">Chưa thanh toán</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mã PayOS">
                {selectedOrder.payosOrderCode || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái đơn">
                <Tag color={ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS]?.color}>
                  {ORDER_STATUS[selectedOrder.status as keyof typeof ORDER_STATUS]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={PAYMENT_STATUS[selectedOrder.paymentStatus as keyof typeof PAYMENT_STATUS]?.color}>
                  {PAYMENT_STATUS[selectedOrder.paymentStatus as keyof typeof PAYMENT_STATUS]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Sản phẩm</Divider>

            <div style={{ marginBottom: 16 }}>
              {selectedOrder.items.map((item) => {
                const isCustomProduct = !!item.customProductId;
                
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "16px",
                      marginBottom: "12px",
                      borderRadius: "12px",
                      border: isCustomProduct ? "2px solid #d3adf7" : "1px solid #f0f0f0",
                      background: isCustomProduct ? "#faf5ff" : "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", gap: 16, flex: 1 }}>
                      <div 
                        className="relative rounded-lg overflow-hidden shrink-0 border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition-all hover:shadow-lg"
                        style={{ 
                          width: isCustomProduct ? "120px" : "80px",
                          height: isCustomProduct ? "120px" : "80px",
                        }}
                        onClick={() => {
                          if (item.productImageSnapshot) {
                            setSelectedImage(getImageUrl(item.productImageSnapshot));
                            setImageModalOpen(true);
                          }
                        }}
                      >
                        <Image
                          src={getImageUrl(item.productImageSnapshot)}
                          alt={item.productNameSnapshot}
                          fill
                          className={isCustomProduct ? "object-contain p-1" : "object-cover"}
                          sizes={isCustomProduct ? "120px" : "80px"}
                        />
                        {isCustomProduct && (
                          <div 
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(147, 51, 234, 0.9)",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            ✨ Custom
                          </div>
                        )}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            padding: "4px",
                            fontSize: "10px",
                            textAlign: "center",
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                          className="hover-zoom-hint"
                        >
                          Click để phóng to
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <Text strong style={{ fontSize: 15 }}>{item.productNameSnapshot}</Text>
                          {isCustomProduct && (
                            <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                              Thiết kế riêng
                            </Tag>
                          )}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Đơn giá: <Text strong>{formatCurrency(item.unitPriceSnapshot)}</Text>
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Số lượng: <Text strong>x{item.quantity}</Text>
                          </Text>
                          
                          {/* Custom product details */}
                          {isCustomProduct && item.customProduct && (
                            <div style={{ marginTop: 12, padding: "8px 12px", background: "white", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
                              {item.customProduct.description && (
                                <div style={{ marginBottom: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {item.customProduct.description}
                                  </Text>
                                </div>
                              )}
                              
                              {item.customProduct.stones && item.customProduct.stones.length > 0 && (
                                <div>
                                  <Text strong style={{ fontSize: 12, color: "#9333ea" }}>
                                    💎 Chi tiết vật phẩm:
                                  </Text>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                                    {item.customProduct.stones.map((stone, idx) => (
                                      <Tag 
                                        key={idx} 
                                        color="purple"
                                        style={{ 
                                          margin: 0, 
                                          fontSize: 11,
                                          padding: "2px 8px",
                                          borderRadius: "6px"
                                        }}
                                      >
                                        {stone.stoneName} x{stone.quantity}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {item.customProduct.notes && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                                    📝 {item.customProduct.notes}
                                  </Text>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {isCustomProduct && !item.customProduct?.stones?.length && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12, fontStyle: "italic" }}>
                                💎 Vòng tay được thiết kế theo yêu cầu riêng
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text strong style={{ fontSize: 16, color: isCustomProduct ? "#9333ea" : "#1890ff" }}>
                        {formatCurrency(item.lineTotal)}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 0",
                borderTop: "2px solid #f0f0f0",
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                Tổng cộng:
              </Text>
              <Text strong style={{ fontSize: 20, color: "#1890ff" }}>
                {formatCurrency(selectedOrder.totalAmount)}
              </Text>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        open={imageModalOpen}
        onCancel={() => {
          setImageModalOpen(false);
          setSelectedImage("");
        }}
        footer={null}
        width="90vw"
        style={{ top: 20, maxWidth: 1200 }}
        centered
      >
        <div style={{ position: "relative", width: "100%", height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Product preview"
              fill
              className="object-contain"
              sizes="90vw"
            />
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .hover-zoom-hint {
          opacity: 0 !important;
        }
        div:hover .hover-zoom-hint {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
