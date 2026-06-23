"use client"

import React, { useState, useEffect } from "react"
import {
    Table,
    Button,
    Space,
    Card,
    Typography,
    Tag,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Flex,
    Tooltip,
    Divider,
} from "antd"
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    CheckOutlined,
} from "@ant-design/icons"
import * as LucideIcons from "lucide-react"
import { adminPurposesApi, Purpose } from "@/lib/api/admin-purposes"

const { Title, Text } = Typography

// Helper to render Lucide icon by name
const IconRenderer = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return <LucideIcons.HelpCircle size={size} className={className} />;
    return <IconComponent size={size} className={className} />;
}

const PRESET_ICONS = [
    "Heart", "HeartPulse", "Coins", "Briefcase", "Target", "Leaf",
    "GraduationCap", "Shield", "Zap", "Flame", "Moon", "Sun", "Star", "Gem",
    "Crown", "Anchor", "Bell", "Bird", "Cloud", "Coffee", "Compass"
]

const PRESET_GRADIENTS = [
    "from-red-500 to-pink-500",
    "from-yellow-400 to-orange-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-indigo-600",
    "from-green-400 to-emerald-600",
    "from-amber-500 to-orange-600",
    "from-pink-400 to-rose-600",
    "from-slate-700 to-slate-900",
    "from-indigo-500 to-purple-600",
    "from-cyan-400 to-blue-500",
    "from-rose-500 to-orange-500",
    "from-teal-400 to-emerald-500",
    "from-violet-500 to-purple-500",
]

const GRADIENT_MAP: Record<string, string> = {
    "from-red-500 to-pink-500": "linear-gradient(to right, #ef4444, #ec4899)",
    "from-yellow-400 to-orange-500": "linear-gradient(to right, #fbbf24, #f97316)",
    "from-blue-500 to-cyan-500": "linear-gradient(to right, #3b82f6, #06b6d4)",
    "from-purple-500 to-indigo-600": "linear-gradient(to right, #a855f7, #4f46e5)",
    "from-green-400 to-emerald-600": "linear-gradient(to right, #4ade80, #059669)",
    "from-amber-500 to-orange-600": "linear-gradient(to right, #f59e0b, #ea580c)",
    "from-pink-400 to-rose-600": "linear-gradient(to right, #f472b6, #e11d48)",
    "from-slate-700 to-slate-900": "linear-gradient(to right, #334155, #0f172a)",
    "from-indigo-500 to-purple-600": "linear-gradient(to right, #6366f1, #9333ea)",
    "from-cyan-400 to-blue-500": "linear-gradient(to right, #22d3ee, #3b82f6)",
    "from-rose-500 to-orange-500": "linear-gradient(to right, #f43f5e, #f97316)",
    "from-teal-400 to-emerald-500": "linear-gradient(to right, #2dd4bf, #10b981)",
    "from-violet-500 to-purple-500": "linear-gradient(to right, #8b5cf6, #a855f7)",
}

const getGradientStyle = (gradientStr: string) => {
    if (GRADIENT_MAP[gradientStr]) return GRADIENT_MAP[gradientStr];

    // Fallback: try to parse if it's a simple from-X to-Y
    try {
        const parts = gradientStr.split(' ');
        if (parts.length >= 2) {
            // Very basic fallback, doesn't handle all Tailwind colors but better than nothing
            return `linear-gradient(to right, var(--${parts[0].replace('from-', '')}, #ccc), var(--${parts[1].replace('to-', '')}, #999))`;
        }
    } catch (e) { }

    return '#eee'; // Default
}

export default function PurposesPage() {
    const [purposes, setPurposes] = useState<Purpose[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null)
    const [form] = Form.useForm()

    // Watch form values for dynamic preview
    const iconValue = Form.useWatch('icon', form);
    const gradientValue = Form.useWatch('gradient', form);

    const fetchPurposes = async () => {
        setLoading(true)
        try {
            const data = await adminPurposesApi.getAll()
            setPurposes(data)
        } catch (error: any) {
            message.error("Không thể tải danh sách mục đích")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPurposes()
    }, [])

    const showModal = (purpose?: Purpose) => {
        if (purpose) {
            setEditingPurpose(purpose)
            form.setFieldsValue({
                name: purpose.name,
                description: purpose.description,
                icon: purpose.icon,
                gradient: purpose.gradient,
                isActive: purpose.isActive,
            })
        } else {
            setEditingPurpose(null)
            form.resetFields()
            form.setFieldsValue({ isActive: true })
        }
        setIsModalVisible(true)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        setEditingPurpose(null)
        form.resetFields()
    }

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa?",
            content: "Bạn có chắc chắn muốn xóa mục đích này?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await adminPurposesApi.delete(id)
                    message.success("Xóa mục đích thành công")
                    fetchPurposes()
                } catch (error: any) {
                    message.error("Không thể xóa mục đích")
                }
            },
        })
    }

    const handleSubmit = async (values: any) => {
        setSubmitting(true)
        try {
            if (editingPurpose) {
                await adminPurposesApi.update(editingPurpose.id, values)
                message.success("Cập nhật mục đích thành công")
            } else {
                await adminPurposesApi.create(values)
                message.success("Thêm mục đích mới thành công")
            }
            setIsModalVisible(false)
            fetchPurposes()
        } catch (error: any) {
            message.error(error.response?.data?.message || "Đã có lỗi xảy ra")
        } finally {
            setSubmitting(false)
        }
    }

    const columns = [
        {
            title: "Tên mục đích",
            dataIndex: "name",
            key: "name",
            render: (text: string, record: Purpose) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.slug}</Text>
                </Space>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Icon / Màu sắc",
            key: "style",
            render: (_: any, record: Purpose) => (
                <Space size="large">
                    <div style={{
                        padding: '8px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0'
                    }}>
                        <IconRenderer name={record.icon} size={24} />
                    </div>
                    <div
                        style={{
                            width: 80,
                            height: 32,
                            borderRadius: 8,
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                            background: getGradientStyle(record.gradient)
                        }}
                        title={record.gradient}
                    />
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Đang hoạt động" : "Tạm ngưng"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: Purpose) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Quản lý Mục đích</Title>
                    <Text type="secondary">Quản lý các mục đích mua sắm (Sức khỏe, Tài lộc, Tình duyên...)</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => showModal()}
                >
                    Thêm mục đích
                </Button>
            </Flex>

            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Table
                    columns={columns}
                    dataSource={purposes}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingPurpose ? "Chỉnh sửa mục đích" : "Thêm mục đích mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ isActive: true }}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="name"
                        label="Tên mục đích"
                        rules={[{ required: true, message: "Vui lòng nhập tên mục đích" }]}
                    >
                        <Input placeholder="VD: Sức khỏe / Tài lộc" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả mục đích này..." />
                    </Form.Item>

                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: 'block', marginBottom: 12 }}>Chọn Icon gợi ý:</Text>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
                            {PRESET_ICONS.map(icon => (
                                <Tooltip title={icon} key={icon}>
                                    <div
                                        onClick={() => form.setFieldValue('icon', icon)}
                                        style={{
                                            padding: '12px 8px',
                                            border: '1px solid',
                                            borderColor: iconValue === icon ? '#6366f1' : '#f0f0f0',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: iconValue === icon ? '#f0f0ff' : 'white',
                                            position: 'relative',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <IconRenderer name={icon} size={24} />
                                        {iconValue === icon && (
                                            <CheckOutlined style={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
                                                fontSize: 10,
                                                background: '#6366f1',
                                                color: 'white',
                                                borderRadius: '50%',
                                                padding: '2px',
                                                border: '2px solid white'
                                            }} />
                                        )}
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                        <Form.Item
                            name="icon"
                            label="Icon (Lucide)"
                            style={{ marginTop: 12, marginBottom: 0 }}
                            rules={[{ required: true, message: "Vui lòng chọn hoặc nhập icon" }]}
                        >
                            <Input placeholder="Nhập tên icon" />
                        </Form.Item>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ display: 'block', marginBottom: 12 }}>Chọn Gradient gợi ý:</Text>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                            {PRESET_GRADIENTS.map(grad => (
                                <div
                                    key={grad}
                                    onClick={() => form.setFieldValue('gradient', grad)}
                                    style={{
                                        height: '32px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        border: '2px solid',
                                        borderColor: gradientValue === grad ? '#000' : 'transparent',
                                        background: getGradientStyle(grad)
                                    }}
                                >
                                    {gradientValue === grad && (
                                        <CheckOutlined style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: 'white',
                                            fontSize: 14,
                                            textShadow: '0 0 4px rgba(0,0,0,0.5)'
                                        }} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <Form.Item
                            name="gradient"
                            label="Gradient (Tailwind classes)"
                            style={{ marginTop: 12, marginBottom: 0 }}
                            rules={[{ required: true, message: "Vui lòng chọn hoặc nhập gradient" }]}
                        >
                            <Input placeholder="from-... to-..." />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái hoạt động"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Divider style={{ margin: '12px 0' }} />

                    <Flex justify="end" gap={8}>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting} size="large">
                            {editingPurpose ? "Cập nhật" : "Lưu mục đích"}
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    )
}
