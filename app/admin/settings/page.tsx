"use client"

import { useState, useEffect } from "react"
import { Button, Input, Card, message, Typography, Space, Divider, Modal } from "antd"
import { MailOutlined, SaveOutlined, ReloadOutlined, RobotOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { longApiClient } from "@/lib/api-client"
import apiClient from "@/lib/api-client"

const { Title, Text, Paragraph } = Typography

export default function AdminSettingsPage() {
  const [adminEmail, setAdminEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)

  useEffect(() => {
    loadAdminEmail()
  }, [])

  const loadAdminEmail = async () => {
    try {
      setLoading(true)
      // apiClient response interceptor returns response.data directly
      const data = await apiClient.get('/admin/system-settings/admin_email') as any
      console.log('Loaded admin email:', data)
      setAdminEmail(data.value || "")
    } catch (error: any) {
      // If setting doesn't exist yet, that's okay
      if (error.response?.status !== 404) {
        console.error('Error loading admin email:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmail = async () => {
    if (!adminEmail || !adminEmail.includes('@')) {
      message.error('Vui lòng nhập email hợp lệ')
      return
    }

    setSaving(true)
    try {
      console.log('Saving admin email:', adminEmail)
      // apiClient response interceptor returns response.data directly
      const data = await apiClient.post('/admin/system-settings', {
        key: 'admin_email',
        value: adminEmail,
        description: 'Email nhận thông báo đơn hàng và hệ thống'
      }) as any
      console.log('Save response:', data)
      message.success("Đã lưu email thông báo")
    } catch (error: any) {
      console.error('Error saving admin email:', error)
      message.error(error.response?.data?.error || error.message || 'Có lỗi xảy ra khi lưu email')
    } finally {
      setSaving(false)
    }
  }

  const handleReindex = async (force: boolean = false) => {
    Modal.confirm({
      title: 'Xác nhận reindex chatbot',
      icon: <ExclamationCircleOutlined />,
      content: force 
        ? 'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu cũ và reindex lại từ đầu? Quá trình này có thể mất vài phút.'
        : 'Bạn có chắc chắn muốn reindex chatbot? Chỉ các tài liệu mới sẽ được thêm vào.',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: force },
      onOk: async () => {
        setReindexing(true)
        try {
          // longApiClient response interceptor already returns response.data
          const data = await longApiClient.post('/admin/chat/reindex', { force }) as any
          
          if (data?.success) {
            message.success({
              content: (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Reindex thành công!
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Đã xử lý {data.documentsProcessed} tài liệu, tạo {data.embeddingsCreated} embeddings
                  </div>
                </div>
              ),
              duration: 5,
            })
          } else {
            message.error(data?.message || 'Có lỗi xảy ra khi reindex')
          }
        } catch (error: any) {
          console.error('Reindex error:', error)
          message.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi reindex chatbot')
        } finally {
          setReindexing(false)
        }
      },
    })
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          Cài đặt hệ thống
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Quản lý email thông báo và cài đặt hệ thống
        </Text>
      </div>

      {/* Main Card */}
      <Card
        style={{
          maxWidth: 800,
          borderRadius: 16,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Email Section */}
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <MailOutlined style={{ fontSize: 24, color: '#6366f1' }} />
              <Title level={4} style={{ margin: 0 }}>
                Email thông báo Admin
              </Title>
            </Space>
            
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Email này sẽ nhận thông báo về:
            </Paragraph>

            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Địa chỉ Email
                </Text>
                <Input
                  size="large"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ borderRadius: 8 }}
                  disabled={loading}
                />
              </div>

              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSaveEmail}
                loading={saving}
                disabled={loading}
                style={{ borderRadius: 8 }}
              >
                Lưu cài đặt
              </Button>
            </Space>
          </div>

          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              📌 Lưu ý
            </Title>
            <Space direction="vertical" size={8}>
              <Text type="secondary">
                • Email phải hợp lệ và có thể nhận thư
              </Text>
              <Text type="secondary">
                • Kiểm tra thư mục spam nếu không nhận được thông báo
              </Text>
            </Space>
          </div>

          <Divider />

          {/* Chatbot Reindex Section */}
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <RobotOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
              <Title level={4} style={{ margin: 0 }}>
                Chatbot & Tư vấn AI
              </Title>
            </Space>
            
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Cập nhật lại dữ liệu cho chatbot khi có thay đổi về sản phẩm, danh mục, hoặc thông tin tư vấn.
            </Paragraph>

            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <Card 
                size="small" 
                style={{ 
                  background: '#fafafa', 
                  border: '1px solid #e8e8e8',
                  borderRadius: 8 
                }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong>📊 Dữ liệu được reindex:</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Sản phẩm (Products)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Câu hỏi thường gặp (FAQs)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Chính sách (Policies)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Hướng dẫn (Guides)
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Kiến thức tư vấn phong thủy (Consultation)
                  </Text>
                </Space>
              </Card>

              <Card 
                size="small" 
                style={{ 
                  background: '#fafafa', 
                  border: '1px solid #e8e8e8',
                  borderRadius: 8 
                }}
              >
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text strong>📊 Khi nào cần reindex?</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Thêm/sửa/xóa sản phẩm
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Thay đổi thông tin danh mục, tags
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Cập nhật kiến thức tư vấn phong thủy
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • Chatbot trả lời không chính xác
                  </Text>
                </Space>
              </Card>

              <Space size={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => handleReindex(false)}
                  loading={reindexing}
                  style={{ 
                    borderRadius: 8,
                    background: '#8b5cf6',
                    borderColor: '#8b5cf6'
                  }}
                >
                  Reindex (Cập nhật)
                </Button>

                <Button
                  danger
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => handleReindex(true)}
                  loading={reindexing}
                  style={{ borderRadius: 8 }}
                >
                  Reindex (Xóa & Tạo mới)
                </Button>
              </Space>

              <Card 
                size="small" 
                style={{ 
                  background: '#fff7e6', 
                  border: '1px solid #ffd591',
                  borderRadius: 8 
                }}
              >
                <Space direction="vertical" size={4}>
                  <Text strong style={{ color: '#d46b08' }}>⚠️ Lưu ý:</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • <strong>Reindex (Cập nhật)</strong>: Chỉ thêm tài liệu mới, nhanh hơn
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    • <strong>Reindex (Xóa & Tạo mới)</strong>: Xóa toàn bộ và tạo lại, chậm hơn nhưng đảm bảo dữ liệu mới nhất
                  </Text>
                </Space>
              </Card>
            </Space>
          </div>

        </Space>
      </Card>
    </div>
  )
}
