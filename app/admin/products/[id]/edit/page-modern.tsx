"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  Space,
  message,
  Spin,
  Typography,
  Flex,
  Tag,
  Image,
} from "antd"
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { categoriesApi } from "@/lib/api/categories"
import { tagsApi } from "@/lib/api/tags"
import { productsApi } from "@/lib/api/products"
import { adminProductsApi } from "@/lib/api/admin-products"
import { Category, Tag as TagType } from "@/types"

const { TextArea } = Input
const { Title, Text } = Typography

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = Number(params.id)

  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData, productData] = await Promise.all([
          categoriesApi.getAll(),
          tagsApi.getAll(),
          productsApi.getById(productId),
        ])

        setCategories(categoriesData)
        setTags(tagsData.filter((t) => t.isActive))

        // Populate form
        setImageUrl(productData.imageUrl || "")
        form.setFieldsValue({
          name: productData.name,
          price: productData.price,
          description: productData.description || "",
          imageUrl: productData.imageUrl || "",
          categoryId: productData.categoryId || undefined,
          tagIds: productData.tags?.map((t) => Number(t.id)) || [],
          isActive: productData.isActive ?? true,
        })
      } catch (error: any) {
        message.error("Không thể tải dữ liệu")
        router.push("/admin/products")
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [productId, router, form])

  const handleAddImage = () => {
    const url = prompt("Nhập URL hình ảnh:")
    if (url) {
      setImageUrl(url)
      form.setFieldValue("imageUrl", url)
    }
  }

  const handleSubmit = async (values: any) => {
    setIsLoading(true)

    try {
      await adminProductsApi.update(productId, {
        name: values.name,
        price: values.price,
        description: values.description || undefined,
        imageUrl: imageUrl || undefined,
        isActive: values.isActive,
        categoryId: values.categoryId || undefined,
        tagIds: values.tagIds || undefined,
      })

      message.success("Cập nhật sản phẩm thành công!")
      router.push("/admin/products")
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật sản phẩm")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 400 }}>
        <Spin size="large" />
      </Flex>
    )
  }

  return (
    <div>
      {/* Page header */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 32 }}>
        <Space size={16}>
          <Link href="/admin/products">
            <Button icon={<ArrowLeftOutlined />} size="large" />
          </Link>
          <div>
            <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              Chỉnh sửa sản phẩm
            </Title>
            <Text type="secondary" style={{ fontSize: 15 }}>
              Cập nhật thông tin sản phẩm
            </Text>
          </div>
        </Space>
      </Flex>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>
          {/* Main content */}
          <Space orientation="vertical" size={24} style={{ width: "100%" }}>
            {/* Basic Info */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Thông tin cơ bản</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
              >
                <Input
                  size="large"
                  placeholder="VD: Vòng tay thạch anh tím"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item label="Danh mục" name="categoryId">
                <Select
                  size="large"
                  placeholder="Chọn danh mục"
                  allowClear
                  style={{ borderRadius: 8 }}
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Mô tả chi tiết" name="description">
                <TextArea
                  rows={6}
                  placeholder="Mô tả đầy đủ về sản phẩm..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Card>

            {/* Image */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Hình ảnh sản phẩm</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item name="imageUrl" hidden>
                <Input />
              </Form.Item>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {imageUrl && (
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt="Product"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      preview={false}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                      onClick={() => {
                        setImageUrl("")
                        form.setFieldValue("imageUrl", "")
                      }}
                    />
                    <Tag
                      color="blue"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                      }}
                    >
                      Ảnh chính
                    </Tag>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddImage}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    border: "2px dashed #d9d9d9",
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1"
                    e.currentTarget.style.background = "#f0f0ff"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d9d9d9"
                    e.currentTarget.style.background = "#fafafa"
                  }}
                >
                  <PictureOutlined style={{ fontSize: 32, color: "#8c8c8c" }} />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Thêm hình ảnh
                  </Text>
                </button>
              </div>
            </Card>

            {/* Tags */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Tags</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item name="tagIds">
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Chọn tags"
                  style={{ width: "100%" }}
                  options={tags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))}
                />
              </Form.Item>
            </Card>
          </Space>

          {/* Sidebar */}
          <Space orientation="vertical" size={24} style={{ width: "100%" }}>
            {/* Price */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Giá sản phẩm</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item
                label="Giá (VND)"
                name="price"
                rules={[
                  { required: true, message: "Vui lòng nhập giá" },
                  { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
                ]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%", borderRadius: 8 }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="0"
                  min={0}
                  step={1000}
                />
              </Form.Item>
            </Card>

            {/* Status */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Trạng thái</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item
                label="Hiển thị sản phẩm"
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>

            {/* Actions */}
            <Card bordered={false} style={{ borderRadius: 16 }}>
              <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={isLoading}
                  block
                >
                  Cập nhật sản phẩm
                </Button>
                <Link href="/admin/products">
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    disabled={isLoading}
                    block
                  >
                    Hủy bỏ
                  </Button>
                </Link>
              </Space>
            </Card>
          </Space>
        </div>
      </Form>
    </div>
  )
}
