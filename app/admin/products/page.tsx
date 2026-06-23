'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
} from "antd"
import type { ColumnsType, TableProps } from "antd/es/table"
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ShoppingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { productsApi } from "@/lib/api/products"
import { categoriesApi } from "@/lib/api/categories"
import { adminProductsApi, ProductDetailResponse } from "@/lib/api/admin-products"
import { Category } from "@/types"
import ProductFormModal from "@/components/admin/product-form-modal"

const { Title, Text } = Typography

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductDetailResponse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  // Stats for cards (always show all products, not filtered)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Use admin API to get full product details including tags
      const allProducts: ProductDetailResponse[] = await adminProductsApi.getAll()

      setProducts(allProducts)
    } catch (error: any) {
      message.error("Không thể tải danh sách sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error: any) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch all products stats (no filters)
      const [activeResponse, inactiveResponse] = await Promise.all([
        productsApi.getAll({ isActive: true, pageSize: 1 }), // Just get count
        productsApi.getAll({ isActive: false, pageSize: 1 }), // Just get count
      ])

      setStats({
        total: activeResponse.totalCount + inactiveResponse.totalCount,
        active: activeResponse.totalCount,
        inactive: inactiveResponse.totalCount,
      })
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchStats() // Fetch stats once on mount
    fetchProducts() // Fetch products once on mount
  }, [])

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "ẩn" : "kích hoạt"
    const actionTitle = currentStatus ? "Ẩn sản phẩm" : "Kích hoạt sản phẩm"

    Modal.confirm({
      title: actionTitle,
      content: `Bạn có chắc chắn muốn ${action} sản phẩm này?`,
      okText: currentStatus ? "Ẩn" : "Kích hoạt",
      okType: currentStatus ? "danger" : "primary",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          setActionLoading(id)
          await adminProductsApi.changeStatus(id, !currentStatus)
          message.success(`Đã ${action} sản phẩm`)
          fetchProducts()
          fetchStats() // Refresh stats
        } catch (error: any) {
          message.error(`Không thể ${action} sản phẩm`)
        } finally {
          setActionLoading(null)
        }
      },
    })
  }

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return

    Modal.confirm({
      title: `Ẩn ${selectedRowKeys.length} sản phẩm`,
      content: "Bạn có chắc chắn muốn ẩn các sản phẩm đã chọn?",
      okText: "Ẩn",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          setLoading(true)
          // Soft delete: set isActive = false for all selected
          await Promise.all(
            selectedRowKeys.map((id) => adminProductsApi.changeStatus(Number(id), false))
          )
          message.success(`Đã ẩn ${selectedRowKeys.length} sản phẩm`)
          setSelectedRowKeys([])
          fetchProducts()
          fetchStats() // Refresh stats
        } catch (error: any) {
          message.error("Không thể ẩn sản phẩm")
        } finally {
          setLoading(false)
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

  // Client-side filtering
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      return product.name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
    }
    return true
  })

  const columns: ColumnsType<ProductDetailResponse> = [
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
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 300,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => {
        // Use imageUrl (main image) as priority, fallback to first image in imageUrls
        const mainImage = record.imageUrl || (record.imageUrls && record.imageUrls.length > 0 ? record.imageUrls[0] : null)

        return (
          <Space size={12}>
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={name}
              width={56}
              height={56}
              style={{ borderRadius: 12, objectFit: "cover" }}
              preview={false}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            </div>
          </Space>
        )
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 130,
      filters: categories.map(cat => ({ text: cat.name, value: cat.id })),
      onFilter: (value, record) => record.category?.id === value,
      render: (category) => (
        <Tag color="blue" style={{ borderRadius: 6 }}>
          {category?.name || "Không có"}
        </Tag>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      render: (tags: any[]) => (
        <Space size={4} wrap>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag key={tag.id} color="purple" style={{ borderRadius: 6, fontSize: 12 }}>
                {tag.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Không có
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Mục đích",
      dataIndex: "purposes",
      key: "purposes",
      width: 150,
      render: (purposes: any[]) => (
        <Space size={4} wrap>
          {purposes && purposes.length > 0 ? (
            purposes.map((p) => (
              <Tag key={p.id} color="cyan" style={{ borderRadius: 6, fontSize: 12 }}>
                {p.name}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chưa có
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Chính sách",
      dataIndex: "policy",
      key: "policy",
      width: 200,
      ellipsis: true,
      render: (policy: string) => (
        policy ? (
          <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: policy }}>
            {policy}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Chưa có
          </Text>
        )
      ),
    },
    {
      title: "Mệnh",
      dataIndex: "element",
      key: "element",
      width: 150,
      render: (element: string) => (
        <Space size={4} wrap>
          {element ? (
            element.split(', ').map((e) => (
              <Tag key={e} color="gold" style={{ borderRadius: 6, fontSize: 12 }}>
                {e}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chưa có
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 130,
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
        <Text strong style={{ fontSize: 14 }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 120,
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Đã ẩn', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) =>
        isActive ? (
          <Badge status="success" text="Hoạt động" />
        ) : (
          <Badge status="error" text="Đã ẩn" />
        ),
    },
    {
      title: "",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => {
        const isLoading = actionLoading === Number(record.id)
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Chỉnh sửa",
                  onClick: () => {
                    setEditingProductId(Number(record.id))
                    setModalOpen(true)
                  },
                },
                {
                  key: "toggle",
                  icon: <PoweroffOutlined />,
                  label: record.isActive ? "Ẩn sản phẩm" : "Kích hoạt",
                  danger: !record.isActive ? false : true,
                  onClick: () =>
                    handleToggleStatus(Number(record.id), record.isActive || false),
                },
              ],
            }}
            trigger={["click"]}
            disabled={isLoading}
          >
            <Button
              type="text"
              icon={isLoading ? <Spin size="small" /> : <MoreOutlined />}
              style={{ width: 32, height: 32 }}
            />
          </Dropdown>
        )
      },
    },
  ]

  const rowSelection: TableProps<ProductDetailResponse>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  }

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Quản lý sản phẩm
          </Title>
          <Text type="secondary" style={{ fontSize: 15, marginTop: 4, display: "block" }}>
            Quản lý toàn bộ {stats.total} sản phẩm trong cửa hàng
          </Text>
        </div>
        <Space size={12}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProductId(undefined)
              setModalOpen(true)
            }}
          >
            Thêm sản phẩm
          </Button>
        </Space>
      </Flex>

      {/* Stats cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Tổng sản phẩm</Text>}
              value={stats.total}
              valueStyle={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}
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
                  <ShoppingOutlined style={{ fontSize: 24, color: "white" }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Đang hoạt động</Text>}
              value={stats.active}
              valueStyle={{ fontSize: 32, fontWeight: 700, color: "#10b981" }}
              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: 24, color: "#10b981" }} />
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 16 }}>
            <Statistic
              title={<Text style={{ fontSize: 14, color: "#64748b" }}>Đã ẩn</Text>}
              value={stats.inactive}
              valueStyle={{ fontSize: 32, fontWeight: 700, color: "#ef4444" }}
              prefix={
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <CloseCircleOutlined style={{ fontSize: 24, color: "#ef4444" }} />
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Search bar */}
      <Card variant="borderless" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm, danh mục..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ width: 400, borderRadius: 8 }}
            size="large"
          />
          <Flex gap={12} align="center">
            <Text type="secondary">
              Hiển thị <Text strong style={{ color: '#6366f1' }}>{filteredProducts.length}</Text> / {products.length} sản phẩm
            </Text>
            {selectedRowKeys.length > 0 && (
              <Button danger size="large" onClick={handleBulkDelete}>
                Ẩn {selectedRowKeys.length} sản phẩm
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* Products table */}
      <Card variant="borderless" style={{ borderRadius: 16 }}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong ${total} sản phẩm`,
            style: { marginTop: 24 },
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy sản phẩm"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProductId(undefined)
        }}
        onSuccess={() => {
          fetchProducts()
          fetchStats() // Refresh stats after changes
        }}
        productId={editingProductId}
      />
    </div>
  )
}

