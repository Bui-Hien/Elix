'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Select,
  Flex,
  Typography,
  Space,
  message,
  Spin,
  DatePicker,
  Button,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Line } from '@ant-design/plots'
import { dashboardApi, DashboardStats, RecentOrder, TopProduct } from '@/lib/api/admin-dashboard'
import dayjs from 'dayjs'
import Link from 'next/link'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

// Order status mapping
const ORDER_STATUS = {
  Pending: { label: 'Chờ xử lý', color: 'gold' },
  Paid: { label: 'Đã thanh toán', color: 'blue' },
  Shipping: { label: 'Đang giao', color: 'cyan' },
  Done: { label: 'Hoàn thành', color: 'green' },
  Cancelled: { label: 'Đã hủy', color: 'red' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<number>(30)
  const [customDateRange, setCustomDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [isCustomRange, setIsCustomRange] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)

      if (isCustomRange && customDateRange) {
        // Use custom date range
        const startDate = customDateRange[0].format('YYYY-MM-DD')
        const endDate = customDateRange[1].format('YYYY-MM-DD')

        console.log('📊 Fetching dashboard stats for custom range:', {
          startDate,
          endDate
        })

        const data = await dashboardApi.getStats(undefined, startDate, endDate)
        console.log('✅ Dashboard stats loaded:', data)
        setStats(data)
      } else {
        // Use days parameter
        console.log('📊 Fetching dashboard stats for period:', period)
        const data = await dashboardApi.getStats(period)
        console.log('✅ Dashboard stats loaded:', data)
        setStats(data)
      }

      console.log('📈 Revenue by day:', stats?.revenueByDay)
    } catch (error: any) {
      console.error('❌ Dashboard error:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)

      const errorMsg = error.response?.data?.message || error.message || 'Không thể tải dữ liệu dashboard'
      message.error(errorMsg)

      // If 401, might need to re-login
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (value: number) => {
    setPeriod(value)
    setIsCustomRange(false)
    setCustomDateRange(null)
  }

  const handleCustomDateChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setCustomDateRange([dates[0], dates[1]])
      setIsCustomRange(true)
    } else {
      setCustomDateRange(null)
      setIsCustomRange(false)
    }
  }

  const applyCustomRange = () => {
    if (customDateRange) {
      fetchStats()
    } else {
      message.warning('Vui lòng chọn khoảng thời gian')
    }
  }

  useEffect(() => {
    if (!isCustomRange) {
      fetchStats()
    }
  }, [period])

  const getPeriodLabel = () => {
    if (isCustomRange && customDateRange) {
      const days = customDateRange[1].diff(customDateRange[0], 'day') + 1
      return `${days} ngày`
    }
    return `${period} ngày`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Revenue chart data
  const revenueChartData = stats?.revenueByDay.map(item => ({
    date: dayjs(item.date).format('DD/MM'),
    value: item.revenue,
  })) || []

  // Revenue chart config
  const revenueChartConfig = {
    data: revenueChartData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: '#6366f1',
    point: {
      size: 4,
      shape: 'circle',
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => {
          const num = Number(v)
          if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
          if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
          return num.toString()
        },
        style: {
          fontSize: 12,
        },
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: 'Doanh thu', value: formatCurrency(datum.value) }
      },
    },
  }

  // Top products columns
  const topProductsColumns: ColumnsType<TopProduct> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: TopProduct, index: number) => index + 1,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Đã bán',
      dataIndex: 'totalSold',
      key: 'totalSold',
      align: 'center',
      width: 100,
      render: (value: number) => <Text strong>{value}</Text>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'right',
      width: 150,
      render: (value: number) => (
        <Text strong style={{ color: '#6366f1' }}>
          {formatCurrency(value)}
        </Text>
      ),
    },
  ]

  // Recent orders columns
  const recentOrdersColumns: ColumnsType<RecentOrder> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code style={{ fontSize: 12 }}>
          {id.substring(0, 8).toUpperCase()}
        </Text>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      width: 130,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const config = ORDER_STATUS[status as keyof typeof ORDER_STATUS]
        return (
          <Tag color={config?.color || 'default'} style={{ borderRadius: 6 }}>
            {config?.label || status}
          </Tag>
        )
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
  ]

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Tổng quan Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Theo dõi hoạt động và hiệu suất của cửa hàng
          </Text>
        </div>
        <Space size="middle">
          <Select
            value={isCustomRange ? undefined : period}
            onChange={handlePeriodChange}
            size="large"
            style={{ width: 180 }}
            placeholder="Chọn khoảng thời gian"
            options={[
              { label: 'Hôm nay', value: 1 },
              { label: '7 ngày qua', value: 7 },
              { label: '30 ngày qua', value: 30 },
              { label: 'Tất cả', value: 365 },
            ]}
          />
          <RangePicker
            size="large"
            value={customDateRange}
            onChange={handleCustomDateChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            style={{ width: 280 }}
            suffixIcon={<CalendarOutlined />}
            disabledDate={(current) => {
              // Disable future dates
              return current && current > dayjs().endOf('day')
            }}
          />
          {isCustomRange && customDateRange && (
            <Button
              type="primary"
              size="large"
              onClick={applyCustomRange}
              icon={<CheckCircleOutlined />}
            >
              Áp dụng
            </Button>
          )}
        </Space>
      </Flex>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Doanh thu ({getPeriodLabel()})</span>}
              value={stats.periodRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
              styles={{ value: { color: '#fff', fontSize: 24, fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Đơn hàng ({getPeriodLabel()})</span>}
              value={stats.periodOrdersCount}
              prefix={<ShoppingCartOutlined />}
              styles={{ value: { color: '#fff', fontSize: 28, fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng khách hàng</span>}
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              styles={{ value: { color: '#fff', fontSize: 28, fontWeight: 700 } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Tổng sản phẩm</span>}
              value={stats.totalActiveProducts}
              suffix={<Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>/ {stats.totalProducts}</Text>}
              prefix={<AppstoreOutlined />}
              styles={{ value: { color: '#fff', fontSize: 28, fontWeight: 700 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={`Chờ xử lý (${getPeriodLabel()})`}
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={`Hoàn thành (${getPeriodLabel()})`}
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={`Tổng đơn hàng (${getPeriodLabel()})`}
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Flex justify="space-between" align="center">
                <Text strong style={{ fontSize: 16 }}>
                  Biểu đồ doanh thu
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {isCustomRange && customDateRange
                    ? `${customDateRange[0].format('DD/MM/YYYY')} - ${customDateRange[1].format('DD/MM/YYYY')}`
                    : period === 1
                      ? 'Hôm nay'
                      : `${period} ngày qua`}
                </Text>
              </Flex>
            }
          >
            {revenueChartData.length > 0 ? (
              <Line {...revenueChartConfig} height={300} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Text type="secondary">Chưa có dữ liệu doanh thu trong khoảng thời gian này</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={
            <Flex justify="space-between" align="center">
              <Text strong style={{ fontSize: 16 }}>
                Top sản phẩm bán chạy
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {getPeriodLabel()}
              </Text>
            </Flex>
          }>
            {stats.topProducts.length > 0 ? (
              <Table
                columns={topProductsColumns}
                dataSource={stats.topProducts}
                rowKey="productId"
                pagination={false}
                size="small"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">Chưa có dữ liệu bán hàng</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card
        title={
          <Flex justify="space-between" align="center">
            <Text strong style={{ fontSize: 16 }}>
              Đơn hàng gần đây ({getPeriodLabel()})
            </Text>
            <Link href="/admin/orders">
              <Text style={{ color: '#6366f1', cursor: 'pointer' }}>Xem tất cả →</Text>
            </Link>
          </Flex>
        }
      >
        <Table
          columns={recentOrdersColumns}
          dataSource={stats.recentOrders}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}
