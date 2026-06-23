'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { ProductsSection } from '@/components/home/products-section'
import { ProductsByElementSection } from '@/components/home/products-by-element-section'
import { FatePopup } from '@/components/home/fate-popup'
import { useProducts } from '@/hooks/use-products'
import { StorySection } from '@/components/home/story-section'

export default function HomePage() {
  // Get best sellers by isBestSeller flag
  const { products: bestSellers, isLoading: loadingBestSellers } = useProducts({ isBestSeller: true, pageSize: 4 })
  // Get new products by newest sort
  const { products: newProducts, isLoading: loadingNew } = useProducts({ sort: 'newest', pageSize: 4 })
  
  // Get products for element filtering (reduced from 100 to 20)
  const { products: allProducts, isLoading: loadingAllProducts } = useProducts({ pageSize: 20 })

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Products by Element (Mệnh) - NEW */}
      <ProductsByElementSection 
        allProducts={allProducts as any}
        loading={loadingAllProducts}
      />

      {/* Best Sellers */}
      <ProductsSection
        title="SẢN PHẨM BÁN CHẠY"
        products={bestSellers as any}
        viewAllLink="/products"
        loading={loadingBestSellers}
      />

      {/* New Arrivals */}
      <ProductsSection
        title="SẢN PHẨM MỚI"
        products={newProducts as any}
        viewAllLink="/products"
        loading={loadingNew}
      />

      {/* Testimonials */}
      {/* <TestimonialsSection /> */}


      <StorySection />

      <Footer />
      <FatePopup />
    </main>
  )
}
