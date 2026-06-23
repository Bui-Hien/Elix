"use client"

import React, { useState, useEffect } from "react"
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  message,
  Spin,
  Typography,
  Flex,
  Tag,
  Image,
  Space,
} from "antd"
import {
  PictureOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { categoriesApi } from "@/lib/api/categories"
import { tagsApi } from "@/lib/api/tags"
import { productsApi } from "@/lib/api/products"
import { adminProductsApi } from "@/lib/api/admin-products"
import { adminPurposesApi, Purpose } from "@/lib/api/admin-purposes"
import { gemstoneApi } from "@/lib/api/gemstones"
import { Category, Tag as TagType, GemstoneType } from "@/types"
import { getImageUrl } from "@/lib/utils"

const { TextArea } = Input
const { Text } = Typography

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  productId?: number // undefined = create mode, number = edit mode
}

export default function ProductFormModal({
  open,
  onClose,
  onSuccess,
  productId,
}: ProductFormModalProps) {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [purposes, setPurposes] = useState<Purpose[]>([])
  const [gemstones, setGemstones] = useState<GemstoneType[]>([])
  const [elements, setElements] = useState<Array<{ value: string; label: string }>>([])
  const [loadingData, setLoadingData] = useState(false)
  const [imageUrl, setImageUrl] = useState("") // Main image URL
  const [imageUrls, setImageUrls] = useState<string[]>([]) // All images
  const [uploading, setUploading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]) // Files to upload on save
  const [previewUrls, setPreviewUrls] = useState<string[]>([]) // Local previews

  const isEditMode = productId !== undefined
  const hasOpened = React.useRef(false)

  useEffect(() => {
    if (open) {
      hasOpened.current = true
      fetchInitialData()
    } else if (hasOpened.current) {
      // Create mode or close after open - reset form only if it was previously opened
      // This prevents "Instance created by useForm is not connected" warning on initial render
      form.resetFields()
      setImageUrl("")
      setImageUrls([])
      setPendingFiles([])
      setPreviewUrls([])
    }
  }, [open, productId])

  const fetchInitialData = async () => {
    try {
      setLoadingData(true)

      // Fetch categories, tags, gemstones, and elements
      console.log('🔄 Fetching initial data...')
      const [categoriesData, tagsData, gemstonesData, elementsData, purposesData] = await Promise.all([
        categoriesApi.getAll(),
        tagsApi.getAll(),
        gemstoneApi.getAll({ isActive: true }).catch(err => {
          console.error('❌ Failed to fetch gemstones:', err)
          message.error('Không thể tải danh sách loại đá')
          return []
        }),
        gemstoneApi.getElements().catch(err => {
          console.error('❌ Failed to fetch elements:', err)
          message.error('Không thể tải danh sách mệnh')
          return []
        }),
        adminPurposesApi.getAll().catch(err => {
          console.error('❌ Failed to fetch purposes:', err)
          message.error('Không thể tải danh sách mục đích')
          return []
        }),
      ])

      console.log('✅ Categories:', categoriesData.length)
      console.log('✅ Tags:', tagsData.length)
      console.log('✅ Gemstones:', gemstonesData.length, gemstonesData)
      console.log('✅ Elements:', elementsData.length, elementsData)

      setCategories(categoriesData)
      setTags(tagsData.filter((t) => t.isActive))
      setGemstones(gemstonesData)
      setElements(elementsData)
      setPurposes(purposesData.filter((p) => p.isActive))

      // If edit mode, fetch product data
      if (isEditMode) {
        console.log("Fetching product data for ID:", productId)
        const productData = await productsApi.getById(productId)
        console.log("Product data loaded:", productData)

        // Extract categoryId - could be direct or from category object
        const categoryId = productData.categoryId || productData.category?.id
        const gemstoneTypeId = productData.gemstoneType?.id

        const initialValues = {
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice || null,
          stockQuantity: productData.stockQuantity || 0,
          description: productData.description || "",
          detailedDescription: productData.detailedDescription || "",
          policy: productData.policy || "",
          categoryId: categoryId,
          tagIds: productData.tags?.map((t) => t.id) || [],
          purposeIds: productData.purposes?.map((p) => p.id) || [],
          elements: productData.element ? productData.element.split(', ').filter(Boolean) : [],
          gemstoneTypeId: gemstoneTypeId,
          isActive: productData.isActive ?? true,
          isFeatured: productData.isFeatured ?? false,
          isBestSeller: productData.isBestSeller ?? false,
        }

        console.log("Initial form values:", initialValues)
        console.log("ImageUrl:", productData.imageUrl)
        console.log("ImageUrls:", productData.imageUrls)

        // Set image states
        const mainImage = productData.imageUrl || ""
        let allImages = Array.isArray(productData.imageUrls) ? [...productData.imageUrls] : []

        // If imageUrls is empty but imageUrl exists, add it to imageUrls
        if (allImages.length === 0 && mainImage) {
          console.log("⚠️ ImageUrls is empty, migrating imageUrl to imageUrls array")
          allImages = [mainImage]
        }

        console.log("Final mainImage:", mainImage)
        console.log("Final allImages:", allImages)

        setImageUrl(mainImage)
        setImageUrls(allImages)
        form.setFieldsValue(initialValues)
      } else {
        // Create mode - set defaults
        form.setFieldsValue({
          isActive: true,
          isFeatured: false,
          isBestSeller: false,
          stockQuantity: 0,
        })
      }
    } catch (error: any) {
      console.error("Error loading data:", error)
      message.error("Không thể tải dữ liệu: " + (error.response?.data?.message || error.message))
      onClose()
    } finally {
      setLoadingData(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    console.log('📤 Files selected:', files.length)

    // Validate each file
    const validFiles: File[] = []
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        message.error(`${file.name}: Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)`)
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        message.error(`${file.name}: Kích thước file không được vượt quá 10MB`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Store files for later upload and create previews
    setPendingFiles(prev => [...prev, ...validFiles])

    // Create local preview URLs
    const newPreviews: string[] = []
    for (const file of validFiles) {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === validFiles.length) {
          setPreviewUrls(prev => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    }

    message.info(`Đã chọn ${validFiles.length} ảnh. Ảnh sẽ được tải lên khi bạn lưu sản phẩm`)
  }

  const handleRemoveImage = async (index: number, isExisting: boolean) => {
    if (isExisting) {
      // Remove from existing images
      const urlToRemove = imageUrls[index]

      // If it's the main image, clear it
      if (urlToRemove === imageUrl) {
        setImageUrl("")
      }

      // Delete from Cloudinary
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/upload/image?imageUrl=${encodeURIComponent(urlToRemove)}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (response.ok) {
          console.log('✅ Image deleted from Cloudinary')
        }
      } catch (error) {
        console.error('Failed to delete image:', error)
      }

      setImageUrls(prev => prev.filter((_, i) => i !== index))
    } else {
      // Remove from pending files
      const pendingIndex = index - imageUrls.length
      setPendingFiles(prev => prev.filter((_, i) => i !== pendingIndex))
      setPreviewUrls(prev => prev.filter((_, i) => i !== pendingIndex))
    }
  }

  const handleSetMainImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setImageUrl(imageUrls[index])
      message.success('Đã đặt làm ảnh chính')
    } else {
      message.info('Ảnh chưa upload, sẽ tự động đặt làm ảnh chính khi lưu')
    }
  }

  const uploadPendingFiles = async (): Promise<string[]> => {
    if (pendingFiles.length === 0) return []

    const uploadedUrls: string[] = []

    for (const file of pendingFiles) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/upload/image?folder=products`
        console.log('📡 Uploading to Cloudinary:', url)

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        console.log('📥 Response status:', response.status)

        if (!response.ok) {
          const error = await response.json()
          console.error('❌ Upload error response:', error)
          throw new Error(error.message || 'Upload failed')
        }

        const data = await response.json()
        console.log('✅ Upload success:', data)
        uploadedUrls.push(data.imageUrl)
      } catch (error: any) {
        console.error('❌ Upload error:', error)
        throw error
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (values: any) => {
    setIsLoading(true)

    try {
      // Upload pending files first if exists
      let finalImageUrls = [...imageUrls]
      let finalImageUrl = imageUrl

      if (pendingFiles.length > 0) {
        setUploading(true)
        try {
          const uploadedUrls = await uploadPendingFiles()
          finalImageUrls = [...finalImageUrls, ...uploadedUrls]

          // If no main image set, use first uploaded image
          if (!finalImageUrl && uploadedUrls.length > 0) {
            finalImageUrl = uploadedUrls[0]
          }
        } catch (error: any) {
          message.error('Không thể tải ảnh lên: ' + error.message)
          setIsLoading(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      // Ensure main image is in imageUrls
      if (finalImageUrl && !finalImageUrls.includes(finalImageUrl)) {
        finalImageUrls = [finalImageUrl, ...finalImageUrls]
      }

      const price = Math.round(values.price || 0)
      const originalPrice = values.originalPrice ? Math.round(values.originalPrice) : null

      const payload = {
        name: values.name,
        price: price,
        originalPrice: originalPrice,
        stockQuantity: values.stockQuantity || 0,
        description: values.description || undefined,
        detailedDescription: values.detailedDescription || undefined,
        imageUrl: finalImageUrl || undefined,
        imageUrls: finalImageUrls.length > 0 ? finalImageUrls : undefined,
        policy: values.policy || undefined,
        isActive: values.isActive,
        isFeatured: values.isFeatured ?? false,
        isBestSeller: values.isBestSeller ?? false,
        categoryId: values.categoryId || undefined,
        tagIds: values.tagIds || undefined,
        purposeIds: values.purposeIds || undefined,
        element: values.elements ? values.elements.join(', ') : undefined,
        gemstoneTypeId: values.gemstoneTypeId || undefined,
      }

      console.log("📤 Submitting payload:", payload)
      console.log("📤 Element:", values.element)
      console.log("📤 GemstoneTypeId:", values.gemstoneTypeId)

      if (isEditMode) {
        await adminProductsApi.update(productId, payload)
        message.success("Cập nhật sản phẩm thành công!")
      } else {
        await adminProductsApi.create(payload)
        message.success("Thêm sản phẩm thành công!")
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("❌ Submit error:", error)
      console.error("❌ Error response:", error.response?.data)
      const errorMsg = error.response?.data?.message || error.message || "Không thể lưu sản phẩm"
      message.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Text strong style={{ fontSize: 18 }}>
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </Text>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left Column */}
            <div>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Form.Item
                  label="Giá cũ (VND)"
                  name="originalPrice"
                >
                  <InputNumber
                    size="large"
                    style={{ width: "100%", borderRadius: 8 }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, "")) as any}
                    placeholder="0 (bỏ trống nếu không giảm giá)"
                    min={0}
                    step={1000}
                  />
                </Form.Item>

                <Form.Item label="% Giảm giá">
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.price !== cur.price || prev.originalPrice !== cur.originalPrice}>
                    {({ getFieldValue }) => {
                      const price = getFieldValue('price') || 0
                      const originalPrice = getFieldValue('originalPrice')
                      if (originalPrice && originalPrice > 0 && price < originalPrice) {
                        const discount = Math.round((1 - price / originalPrice) * 100)
                        return (
                          <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                            <Tag color="red" style={{ fontSize: 16, padding: '4px 12px' }}>-{discount}%</Tag>
                          </div>
                        )
                      }
                      return (
                        <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                          <Text type="secondary">Không giảm giá</Text>
                        </div>
                      )
                    }}
                  </Form.Item>
                </Form.Item>
              </div>

              <Form.Item
                label="Số lượng tồn kho"
                name="stockQuantity"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  { type: "number", min: 0, message: "Số lượng phải lớn hơn hoặc bằng 0" },
                ]}
              >
                <InputNumber
                  size="large"
                  style={{ width: "100%", borderRadius: 8 }}
                  placeholder="0"
                  min={0}
                  step={1}
                />
              </Form.Item>

              <Form.Item label="Danh mục" name="categoryId">
                <Select
                  size="large"
                  placeholder="Chọn danh mục"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.children ?? '').toString().toLowerCase().localeCompare((optionB?.children ?? '').toString().toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Tags" name="tagIds">
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Tìm kiếm hoặc chọn tags"
                  style={{ width: "100%", borderRadius: 8 }}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
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
                  style={{ width: "100%", borderRadius: 8 }}
                  allowClear
                  options={purposes.map((p) => ({
                    label: p.name,
                    value: p.id,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Mệnh phù hợp" name="elements">
                <Select
                  mode="multiple"
                  size="large"
                  placeholder="Chọn mệnh phù hợp"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                  options={elements}
                />
              </Form.Item>

              <Form.Item label="Loại đá" name="gemstoneTypeId">
                <Select
                  size="large"
                  placeholder="Chọn loại đá"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                  }
                  style={{ borderRadius: 8 }}
                  options={gemstones.map((gem) => ({
                    label: gem.name,
                    value: gem.id,
                  }))}
                />
              </Form.Item>

              {/* Product Status Switches */}
              <div style={{
                background: '#f9fafb',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                marginTop: 8
              }}>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
                  Trạng thái sản phẩm
                </Text>

                <Form.Item
                  label="Hiển thị sản phẩm"
                  name="isActive"
                  valuePropName="checked"
                  style={{ marginBottom: 12 }}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Sản phẩm nổi bật"
                  name="isFeatured"
                  valuePropName="checked"
                  style={{ marginBottom: 12 }}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Sản phẩm bán chạy"
                  name="isBestSeller"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Switch />
                </Form.Item>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <Form.Item label="Hình ảnh sản phẩm" name="imageUrl" hidden>
                <Input />
              </Form.Item>

              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, marginBottom: 8, display: "block" }}>
                  Hình ảnh
                </Text>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {/* Existing images from server */}
                  {imageUrls.map((url, index) => (
                    <div
                      key={`existing-${index}`}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: 12,
                        overflow: "hidden",
                        border: url === imageUrl ? "3px solid #6366f1" : "1px solid #f0f0f0",
                      }}
                    >
                      <Image
                        src={getImageUrl(url)}
                        alt={`Product ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        preview={false}
                      />
                      <Space
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          gap: 4,
                        }}
                      >
                        {url !== imageUrl && (
                          <Button
                            type="primary"
                            size="small"
                            icon={<PictureOutlined />}
                            onClick={() => handleSetMainImage(index, true)}
                            title="Đặt làm ảnh chính"
                          />
                        )}
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveImage(index, true)}
                        />
                      </Space>
                      {url === imageUrl && (
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
                      )}
                    </div>
                  ))}

                  {/* Pending images (not uploaded yet) */}
                  {previewUrls.map((url, index) => (
                    <div
                      key={`pending-${index}`}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "2px dashed #faad14",
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Pending ${index + 1}`}
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
                        onClick={() => handleRemoveImage(imageUrls.length + index, false)}
                      />
                      <Tag
                        color="orange"
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                        }}
                      >
                        Chưa lưu
                      </Tag>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label
                    htmlFor="file-upload"
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
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      multiple
                      style={{ display: "none" }}
                    />
                    <PictureOutlined style={{ fontSize: 32, color: "#8c8c8c" }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Thêm ảnh
                    </Text>
                  </label>
                </div>
              </div>

              <Form.Item label="Mô tả ngắn" name="description">
                <TextArea
                  rows={4}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item label="Mô tả chi tiết" name="detailedDescription">
                <TextArea
                  rows={6}
                  placeholder="Mô tả chi tiết đầy đủ, thông tin kỹ thuật, đặc điểm nổi bật..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item label="Chính sách sản phẩm" name="policy">
                <TextArea
                  rows={4}
                  placeholder="VD: Bảo hành 12 tháng, đổi trả trong 7 ngày..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Footer Actions */}
          <Flex justify="flex-end" gap={12} style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
            <Button size="large" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={isLoading}
            >
              {isEditMode ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Flex>
        </Form>
      </Spin>
    </Modal>
  )
}
