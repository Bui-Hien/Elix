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
import { gemstoneApi } from "@/lib/api/gemstones"
import { productsApi } from "@/lib/api/products"
import { adminProductsApi } from "@/lib/api/admin-products"
import { adminPurposesApi, Purpose } from "@/lib/api/admin-purposes"
import { Category, Tag as TagType } from "@/types"
import { getImageUrl } from "@/lib/utils"

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
  const [purposes, setPurposes] = useState<Purpose[]>([])
  const [gemstoneTypes, setGemstoneTypes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for product ID:", productId)

        const [categoriesData, tagsData, productData, purposesData, gemstonesData] = await Promise.all([
          categoriesApi.getAll(),
          tagsApi.getAll(),
          productsApi.getById(productId),
          adminPurposesApi.getAll(),
          gemstoneApi.getAll(),
        ])

        console.log("Product data loaded:", productData)

        setCategories(categoriesData)
        setTags(tagsData.filter((t) => t.isActive))
        setPurposes(purposesData.filter((p) => p.isActive))
        setGemstoneTypes(gemstonesData.filter((g) => g.isActive))

        // Populate form with product data
        const initialValues = {
          name: productData.name,
          price: productData.price,
          description: productData.description || "",
          detailedDescription: productData.detailedDescription || "",
          policy: productData.policy || "",
          categoryId: productData.categoryId ? Number(productData.categoryId) : undefined,
          gemstoneTypeId: productData.gemstoneTypeId ? Number(productData.gemstoneTypeId) : undefined,
          tagIds: productData.tags?.map((t) => Number(t.id)) || [],
          purposeIds: productData.purposes?.map((p) => Number(p.id)) || [],
          isActive: productData.isActive ?? true,
          isFeatured: productData.isFeatured ?? false,
          isBestSeller: productData.isBestSeller ?? false,
          stockQuantity: productData.stockQuantity || 0,
          elements: productData.element ? productData.element.split(', ').filter(Boolean) : [],
        }

        console.log("Initial form values:", initialValues)

        setImageUrl(productData.imageUrl || "")
        form.setFieldsValue(initialValues)
      } catch (error: any) {
        console.error("Error loading product data:", error)
        console.error("Error response:", error.response?.data)
        message.error("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message))
        router.push("/admin/products")
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [productId, router, form])

  const handleUploadImage = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/upload/image?folder=products`, {
        method: "POST",
        body: formData,
        credentials: 'include', // Send cookies (accessToken)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Upload failed")
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)
      form.setFieldValue("imageUrl", data.imageUrl)
      message.success("Upload ảnh thành công!")
    } catch (error: any) {
      console.error("Upload error:", error)
      message.error(error.message || "Không thể upload ảnh")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      message.error("Kích thước file không được vượt quá 10MB")
      return
    }

    handleUploadImage(file)
  }

  const handleSubmit = async (values: any) => {
    setIsLoading(true)

    try {
      // Ensure price is integer
      const price = Math.round(values.price || 0)

      const payload = {
        name: values.name,
        price: price,
        description: values.description || undefined,
        detailedDescription: values.detailedDescription || undefined,
        imageUrl: imageUrl || undefined,
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        isBestSeller: values.isBestSeller,
        policy: values.policy || undefined,
        categoryId: values.categoryId || undefined,
        tagIds: values.tagIds || undefined,
        purposeIds: values.purposeIds || undefined,
        element: values.elements ? values.elements.join(', ') : undefined,
        gemstoneTypeId: values.gemstoneTypeId || undefined,
        stockQuantity: values.stockQuantity || 0,
      }

      console.log("Submitting update with payload:", payload)

      await adminProductsApi.update(productId, payload)

      message.success("Cập nhật sản phẩm thành công!")
      router.push("/admin/products")
    } catch (error: any) {
      console.error("Update product error:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)
      const errorMsg = error.response?.data?.message || error.message || "Không thể cập nhật sản phẩm"
      message.error(errorMsg)
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

                <Form.Item label="Loại đá" name="gemstoneTypeId">
                  <Select
                    size="large"
                    placeholder="Chọn loại đá"
                    allowClear
                    style={{ borderRadius: 8 }}
                  >
                    {gemstoneTypes.map((g) => (
                      <Select.Option key={g.id} value={g.id}>
                        {g.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item label="Mô tả ngắn" name="description">
                <Input
                  size="large"
                  placeholder="Mô tả ngắn hiển thị ở danh sách..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item label="Mô tả chi tiết" name="detailedDescription">
                <TextArea
                  rows={6}
                  placeholder="Mô tả đầy đủ về sản phẩm, đặc điểm, công dụng..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item label="Chính sách & Bảo hành" name="policy">
                <TextArea
                  rows={3}
                  placeholder="Thông tin bảo hành, đổi trả riêng cho sản phẩm này..."
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
                      src={getImageUrl(imageUrl)}
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

                <label
                  htmlFor="image-upload-edit"
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    border: "2px dashed #d9d9d9",
                    background: uploading ? "#f0f0f0" : "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: uploading ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    opacity: uploading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading) {
                      e.currentTarget.style.borderColor = "#6366f1"
                      e.currentTarget.style.background = "#f0f0ff"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!uploading) {
                      e.currentTarget.style.borderColor = "#d9d9d9"
                      e.currentTarget.style.background = "#fafafa"
                    }
                  }}
                >
                  <input
                    id="image-upload-edit"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <Spin />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Đang upload...
                      </Text>
                    </>
                  ) : (
                    <>
                      <PictureOutlined style={{ fontSize: 32, color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Upload ảnh
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        JPG, PNG, GIF, WebP
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Max 10MB
                      </Text>
                    </>
                  )}
                </label>
              </div>
            </Card>

            {/* Elements */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Mệnh phù hợp</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item name="elements">
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Chọn mệnh phù hợp (Kim, Mộc...)"
                  style={{ width: "100%" }}
                  options={[
                    { label: "Kim", value: "Kim" },
                    { label: "Mộc", value: "Moc" },
                    { label: "Thủy", value: "Thuy" },
                    { label: "Hỏa", value: "Hoa" },
                    { label: "Thổ", value: "Tho" },
                  ]}
                />
              </Form.Item>
            </Card>

            {/* Tags */}
            <Card
              title={<Text strong style={{ fontSize: 16 }}>Tags / Mục đích</Text>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Form.Item label="Tags" name="tagIds">
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

              <Form.Item label="Mục đích (Phong thủy)" name="purposeIds">
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Chọn mục đích"
                  style={{ width: "100%" }}
                  options={purposes.map((p) => ({
                    label: p.name,
                    value: p.id,
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
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
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
              <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Text>Hiển thị sản phẩm</Text>
                <Form.Item name="isActive" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Flex>
              <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <Text>Sản phẩm nổi bật</Text>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text>Sản phẩm bán chạy</Text>
                <Form.Item name="isBestSeller" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </Flex>
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
