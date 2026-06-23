import type { Category, Tag, Product, User, Order, Review, DashboardStats } from '@/types'

export const categories: Category[] = [
  {
    id: '1',
    name: 'Vòng Tay',
    slug: 'vong-tay',
    description: 'Bộ sưu tập vòng tay đá phong thủy cao cấp',
    image: '/images/categories/bracelet.jpg'
  },
  {
    id: '2',
    name: 'Vòng Cổ',
    slug: 'vong-co',
    description: 'Vòng cổ đá tự nhiên sang trọng',
    image: '/images/categories/necklace.jpg'
  },
  {
    id: '3',
    name: 'Mặt Dây Chuyền',
    slug: 'mat-day-chuyen',
    description: 'Mặt dây chuyền đá quý tinh xảo',
    image: '/images/categories/pendant.jpg'
  },
  {
    id: '4',
    name: 'Nhẫn',
    slug: 'nhan',
    description: 'Nhẫn đá phong thủy độc đáo',
    image: '/images/categories/ring.jpg'
  }
]

export const tags: Tag[] = [
  { id: '1', name: 'Hot', slug: 'hot' },
  { id: '2', name: 'New Arrival', slug: 'new-arrival' },
  { id: '3', name: 'Best Seller', slug: 'best-seller' },
  { id: '4', name: 'Limited Edition', slug: 'limited-edition' },
  { id: '5', name: 'Sale', slug: 'sale' },
  { id: '6', name: 'Handmade', slug: 'handmade' },
  { id: '7', name: 'Premium', slug: 'premium' },
  { id: '8', name: 'Unisex', slug: 'unisex' },
  { id: '9', name: 'Nam', slug: 'nam' },
  { id: '10', name: 'Nữ', slug: 'nu' }
]

export const products: Product[] = [
  {
    id: '1',
    name: 'Vòng tay Tỳ Hưu Obsidian',
    slug: 'vong-tay-ty-huu-obsidian',
    description: 'Vòng tay Tỳ Hưu đá Obsidian đen tự nhiên, mang lại may mắn và tài lộc. Phù hợp cho cả nam và nữ.',
    price: 299000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
    categoryId: '1',
    category: categories[0],
    tags: [tags[0], tags[8]], // Hot, Nam
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    soldCount: 45,
    stockQuantity: 100,
    createdAt: '2025-12-07 07:59:06'
  },
  {
    id: '2',
    name: 'Vòng tay Phật Di Lặc',
    slug: 'vong-tay-phat-di-lac',
    description: 'Vòng tay khắc tượng Phật Di Lặc, mang ý nghĩa bình an, hạnh phúc và giải trừ muôn phiền.',
    price: 450000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
    categoryId: '1',
    category: categories[0],
    tags: [tags[5]], // Handmade
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-07 07:59:06'
  },
  {
    id: '3',
    name: 'Vòng tay Rồng Vàng',
    slug: 'vong-tay-rong-vang',
    description: 'Vòng tay khắc hình rồng vàng, biểu tượng quyền lực và thịnh vượng trong phong thủy.',
    price: 380000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
    categoryId: '1',
    category: categories[0],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2025-12-24 07:59:06'
  },
  {
    id: '4',
    name: 'Vòng tay da bện vintage',
    slug: 'vong-tay-da-ben-vintage',
    description: 'Vòng tay da bò thật bện tay thủ công, phong cách vintage cá tính dành cho nam giới.',
    price: 199000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'],
    categoryId: '2',
    category: categories[1],
    tags: [tags[8]], // Nam
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-08 07:59:06'
  },
  {
    id: '5',
    name: 'Vòng tay charm ngôi sao',
    slug: 'vong-tay-charm-ngoi-sao',
    description: 'Vòng tay nữ tính với charm ngôi sao lấp lánh, phù hợp cho các bạn gái yêu thích phong cách nhẹ nhàng.',
    price: 350000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'],
    categoryId: '2',
    category: categories[1],
    tags: [tags[9]], // Nu
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-18 07:59:06'
  },
  {
    id: '6',
    name: 'Vòng tay dây thép không gỉ',
    slug: 'vong-tay-day-thep-khong-gi',
    description: 'Vòng tay thép không gỉ cao cấp, thiết kế tối giản hiện đại, bền đẹp theo thời gian.',
    price: 280000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'],
    categoryId: '2',
    category: categories[1],
    tags: [tags[7]], // Unisex
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-23 07:59:06'
  },
  {
    id: '7',
    name: 'Vòng tay thạch anh hồng',
    slug: 'vong-tay-thach-anh-hong',
    description: 'Vòng tay đá thạch anh hồng tự nhiên cao cấp, giúp thu hút tình yêu và cải thiện các mối quan hệ.',
    price: 550000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
    categoryId: '3',
    category: categories[2],
    tags: [tags[0], tags[9], tags[3]], // Hot, Nu
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    soldCount: 32,
    stockQuantity: 100,
    createdAt: '2026-01-07 07:59:06'
  },
  {
    id: '8',
    name: 'Vòng tay đá mắt hổ nâu',
    slug: 'vong-tay-da-mat-ho-nau',
    description: 'Vòng tay đá mắt hổ tự nhiên, tăng cường sự tự tin và mang lại may mắn trong công việc.',
    price: 420000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
    categoryId: '3',
    category: categories[2],
    tags: [tags[2]], // Best Seller
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    soldCount: 12,
    stockQuantity: 100,
    createdAt: '2025-12-29 07:59:06'
  },
  {
    id: '9',
    name: 'Vòng tay đá Lapis Lazuli',
    slug: 'vong-tay-da-lapis-lazuli',
    description: 'Vòng tay đá Lapis Lazuli xanh dương quý hiếm, tăng cường trí tuệ và khả năng giao tiếp.',
    price: 680000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
    categoryId: '3',
    category: categories[2],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-13 07:59:06'
  },
  {
    id: '10',
    name: 'Vòng tay couple nam châm',
    slug: 'vong-tay-couple-nam-cham',
    description: 'Bộ đôi vòng tay có nam châm hút nhau, biểu tượng cho tình yêu gắn kết. Giá cho 2 chiếc.',
    price: 680000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'],
    categoryId: '4',
    category: categories[3],
    tags: [tags[7]], // Unisex
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-28 07:59:06'
  },
  {
    id: '11',
    name: 'Vòng tay couple trái tim khóa',
    slug: 'vong-tay-couple-trai-tim-khoa',
    description: 'Một chiếc là trái tim, một chiếc là chìa khóa - biểu tượng hoàn hảo cho tình yêu đôi lứa.',
    price: 590000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'],
    categoryId: '4',
    category: categories[3],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-03 07:59:06'
  },
  {
    id: '12',
    name: 'Vòng tay couple dây đỏ may mắn',
    slug: 'vong-tay-couple-day-do-may-man',
    description: 'Vòng tay couple dây đỏ truyền thống, mang ý nghĩa duyên phận và may mắn trong tình yêu.',
    price: 450000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80'],
    categoryId: '4',
    category: categories[3],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2025-12-19 07:59:06'
  },
  {
    id: '13',
    name: 'Vòng tay bạc 925 Italy',
    slug: 'vong-tay-bac-925-italy',
    description: 'Vòng tay bạc 925 cao cấp nhập khẩu Italy, thiết kế tinh xảo và sang trọng.',
    price: 890000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'],
    categoryId: '5',
    category: categories[0], // Fallback
    tags: [tags[0], tags[6]], // Hot, Premium
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: true,
    isBestSeller: false,
    isNew: false,
    soldCount: 88,
    stockQuantity: 100,
    createdAt: '2025-12-07 07:59:06'
  },
  {
    id: '14',
    name: 'Vòng tay bạc nữ đính đá CZ',
    slug: 'vong-tay-bac-nu-dinh-da-cz',
    description: 'Vòng tay bạc ta đính đá CZ cao cấp, thiết kế nhẹ nhàng thanh lịch dành cho phái đẹp.',
    price: 750000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'],
    categoryId: '5',
    category: categories[0],
    tags: [tags[9]], // Nu
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-20 07:59:06'
  },
  {
    id: '15',
    name: 'Vòng tay bạc khắc kinh Phật',
    slug: 'vong-tay-bac-khac-kinh-phat',
    description: 'Vòng tay bạc khắc kinh Phật, mang ý nghĩa tâm linh sâu sắc và phong cách độc đáo.',
    price: 820000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
    categoryId: '5',
    category: categories[0],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'active',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2026-01-10 07:59:06'
  },
  {
    id: '16',
    name: 'Vòng tay cũ đã ngừng bán',
    slug: 'vong-tay-cu-da-ngung-ban',
    description: 'Sản phẩm này đã ngừng kinh doanh.',
    price: 150000,
    originalPrice: 0,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
    categoryId: '2',
    category: categories[1],
    tags: [],
    rating: 0,
    reviewCount: 0,
    status: 'archived',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    soldCount: 0,
    stockQuantity: 100,
    createdAt: '2025-08-07 07:59:06'
  }
]

export const mockUsers: (User & { role: string; avatar?: string; orderCount: number })[] = [
  {
    id: 1,
    fullName: 'Admin',
    email: 'admin@gemstone.vn',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2025-01-01',
    orderCount: 0
  },
  {
    id: 2,
    fullName: 'Nguyen Van A',
    email: 'nguyenvana@gmail.com',
    role: 'USER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    createdAt: '2025-06-15',
    orderCount: 5
  },
  {
    id: 3,
    fullName: 'Tran Thi B',
    email: 'tranthib@gmail.com',
    role: 'USER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    createdAt: '2025-08-20',
    orderCount: 3
  },
  {
    id: 4,
    fullName: 'Le Van C',
    email: 'levanc@gmail.com',
    role: 'USER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    createdAt: '2025-10-05',
    orderCount: 8
  },
  {
    id: 5,
    fullName: 'Pham Thi D',
    email: 'phamthid@gmail.com',
    role: 'USER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    createdAt: '2025-11-12',
    orderCount: 2
  }
]

export const mockOrders: any[] = [
  {
    id: '1',
    customerName: 'Nguyen Van A',
    phone: '0901234567',
    address: '123 Nguyen Hue, Quan 1, Ben Nghe, Ho Chi Minh',
    totalAmount: 1920000,
    status: 'Done',
    paymentStatus: 'Paid',
    createdAt: '2026-01-25T10:00:00Z',
    items: [
      {
        id: 1,
        productId: 1,
        productNameSnapshot: 'Vong Tay Thach Anh Tim - Amethyst Premium',
        unitPriceSnapshot: 1890000,
        quantity: 1,
        lineTotal: 1890000
      }
    ]
  }
]

export const mockReviews: Review[] = [
  {
    id: 1,
    rating: 5,
    comment: 'Sản phẩm rất đẹp, đá tím trong vắt và màu sắc rất tuyệt. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ tiếp!',
    createdAt: '2026-01-26',
    userName: 'Nguyễn Văn A',
    userId: 2
  },
  {
    id: 2,
    rating: 5,
    comment: 'Ngọc bích thật sự chất lượng, màu xanh rất đẹp. Tôi đã mua nhiều nơi nhưng đây là nơi uy tín nhất.',
    createdAt: '2026-01-29',
    userName: 'Trần Thị B',
    userId: 3
  },
  {
    id: 3,
    rating: 4,
    comment: 'Đá mắt hổ đẹp, hiệu ứng mắt mèo rõ. Chỉ tiếc là size hộp nhỏ hơn mong đợi một chút.',
    createdAt: '2026-01-20',
    userName: 'Lê Văn C',
    userId: 4
  }
]

export const getDashboardStats = (): DashboardStats => {
  const paidOrders = mockOrders.filter(o => o.status === 'Paid' || o.status === 'Done')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  const today = new Date().toISOString().split('T')[0]
  const todayOrders = mockOrders.filter(o => o.createdAt.startsWith(today))
  const todayRevenue = todayOrders.filter(o => o.status === 'Paid' || o.status === 'Done').reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  return {
    totalOrders: mockOrders.length,
    todayOrders: todayOrders.length,
    totalRevenue,
    todayRevenue,
    totalProducts: products.length,
    totalUsers: mockUsers.filter(u => u.role === 'USER').length,
    recentOrders: mockOrders.slice(0, 5),
    chartData: [
      { date: '01/26', revenue: 1920000, orders: 1 },
      { date: '01/27', revenue: 0, orders: 0 },
      { date: '01/28', revenue: 6700000, orders: 1 },
      { date: '01/29', revenue: 0, orders: 0 },
      { date: '01/30', revenue: 8400000, orders: 1 },
      { date: '01/31', revenue: 0, orders: 0 },
      { date: '02/01', revenue: 4040000, orders: 1 },
      { date: '02/02', revenue: 0, orders: 0 },
      { date: '02/03', revenue: 2600000, orders: 1 },
      { date: '02/04', revenue: 0, orders: 0 }
    ]
  }
}

// ─── Shipping Config ────────────────────────────────────────────────
export const SHIPPING_CONFIG = {
  fee: 0,                    // Phí vận chuyển mặc định (VND) - Miễn phí
  freeThreshold: 0,          // Miễn phí ship cho tất cả đơn hàng
}

export function calculateShippingFee(subtotal: number): number {
  return 0 // Miễn phí vận chuyển cho tất cả đơn hàng
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug)
}

export const getProductsByCategory = (categorySlug: string): Product[] => {
  const category = categories.find(c => c.slug === categorySlug)
  if (!category) return []
  return products.filter(p => p.categoryId === category.id)
}

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.isFeatured)
}

export const getBestSellers = (): Product[] => {
  return products.filter(p => p.isBestSeller)
}

export const getNewProducts = (): Product[] => {
  return products.filter(p => p.isNew)
}

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q)) ||
    (p.tags && p.tags.some(t => t.name.toLowerCase().includes(q)))
  )
}

// Alias exports for compatibility
export const mockProducts = products
export const mockCategories = categories
export const mockCustomers = mockUsers.filter(u => u.role === 'USER')
