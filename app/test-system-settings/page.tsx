"use client"

import { useState } from "react"
import { Button, Input, Card, Typography, Space } from "antd"
import apiClient from "@/lib/api-client"

const { Title, Text } = Typography

export default function TestSystemSettingsPage() {
  const [email, setEmail] = useState("test@example.com")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testGet = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get('/admin/system-settings/admin_email') as any
      console.log('GET Response:', data)
      setResult({ success: true, data })
    } catch (error: any) {
      console.error('GET Error:', error)
      setResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const testPost = async () => {
    setLoading(true)
    try {
      const data = await apiClient.post('/admin/system-settings', {
        key: 'admin_email',
        value: email,
        description: 'Test email'
      }) as any
      console.log('POST Response:', data)
      setResult({ success: true, data })
    } catch (error: any) {
      console.error('POST Error:', error)
      setResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const testGetAll = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get('/admin/system-settings') as any
      console.log('GET ALL Response:', data)
      setResult({ success: true, data })
    } catch (error: any) {
      console.error('GET ALL Error:', error)
      setResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get('/auth/me') as any
      console.log('Auth Response:', data)
      setResult({ success: true, data })
    } catch (error: any) {
      console.error('Auth Error:', error)
      setResult({ 
        success: false, 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <Title level={2}>Test System Settings API</Title>
      
      <Card style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Email to save:</Text>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          
          <Space>
            <Button onClick={checkAuth} loading={loading}>
              Check Auth
            </Button>
            <Button onClick={testGetAll} loading={loading}>
              GET All Settings
            </Button>
            <Button onClick={testGet} loading={loading}>
              GET admin_email
            </Button>
            <Button type="primary" onClick={testPost} loading={loading}>
              POST Save Email
            </Button>
          </Space>
        </Space>
      </Card>

      {result && (
        <Card title="Result">
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
