import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, products as mockProducts, getProductsByCategory } from '@/lib/data'
import { ProductDetailClient } from './product-detail-client'
import apiClient from '@/lib/api-client'
import { Product } from '@/types'

export const dynamic = 'force-dynamic' // Disable caching to fetch fresh stock


interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string): Promise<Product | undefined> {
  // 1. Try mock data first for static slugs
  const mockProduct = getProductBySlug(slug)
  if (mockProduct) return mockProduct

  // 2. Try fetching from API if slug is numeric ID
  if (!isNaN(Number(slug))) {
    try {
      const data = await apiClient.get<any, any>(`/products/${slug}`)
      console.log('API Response for PDP:', JSON.stringify(data, null, 2)) // Debug log
      // Transform API response to Product interface
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description,
        detailedDescription: data.detailedDescription,
        imageUrl: data.imageUrl,
        imageUrls: data.imageUrls || [], // Multiple images from API
        images: data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : (data.imageUrl ? [data.imageUrl] : []), // Fallback to imageUrl if imageUrls is empty
        policy: data.policy, // Product policy
        category: data.category ? {
          id: data.category.id, // Ensure type match
          name: data.category.name,
          slug: data.category.name.toLowerCase().replace(/ /g, '-'), // Mock slug
          isActive: data.category.isActive
        } : undefined,
        tags: data.tags?.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.name.toLowerCase().replace(/ /g, '-'), // Mock slug
          isActive: t.isActive
        })) || [],
        rating: 5, // Default for now
        reviewCount: 0,
        isActive: data.isActive,
        createdAt: data.createdAt,
        stock: data.stockQuantity, // Real stock from API
        stockQuantity: data.stockQuantity, // Also map to stockQuantity field
        isNew: false,
        bestSeller: false,
        // Ensure slug is present for links
        slug: slug
      } as Product
    } catch (e) {
      console.error('Failed to fetch product from API', e)
    }
  }
  return undefined
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'San pham khong ton tai' }
  }

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || product.name,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || product.name,
      images: product.images || [],
    },
  }
}

export function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Get related products (same category, excluding current)
  // Logic: if mock product, use mock related. If API product, use mock related for now as fallback
  // or simple filtering if we fetched categories.
  // For simplicity using mock related products matching category if possible.
  const relatedProducts = mockProducts
    .filter(p => p.category?.name === product.category?.name && p.id !== product.id)
    .slice(0, 4)

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />
}
