import type { Metadata } from 'next'
import { ProductsClient } from './products-client'

export const metadata: Metadata = {
  title: 'Sản phẩm',
  description: 'Khám phá bộ sưu tập đá phong thủy cao cấp tại GemStone. Vòng tay, vòng cổ, mặt dây chuyền đá tự nhiên 100%.'
}

export default function ProductsPage() {
  return <ProductsClient />
}
