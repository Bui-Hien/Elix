export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  createdAt: string
  role?: string
  Role?: string
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// Gemstone Types
export interface GemstoneType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Category {
  id: number | string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

export interface Tag {
  id: number | string;
  name: string;
  slug?: string;
  isActive?: boolean;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  description?: string;
  detailedDescription?: string; // Mô tả chi tiết đầy đủ
  imageUrl?: string;
  imageUrls?: string[]; // Multiple images
  policy?: string; // Product policy (warranty, return, etc.)
  isActive?: boolean;
  createdAt: string;
  categoryId?: number | string;
  category?: Category;
  tags?: Tag[];
  categoryName?: string;
  // Gemstone and Element attributes
  element?: string; // Mệnh (Kim, Mộc, Thủy, Hỏa, Thổ)
  gemstoneType?: GemstoneType; // Loại đá
  gemstoneTypeId?: number;
  gemstoneTypeName?: string;
  // Frontend specific or optional fields
  slug?: string;
  originalPrice?: number;
  discountPercent?: number;
  stock?: number;
  images?: string[]; // Array of strings if multiple images (legacy)
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  status?: string;
  soldCount?: number;
  stockQuantity?: number;
  purposes?: Array<{
    id: number;
    name: string;
    isActive: boolean;
  }>;
}

export interface ProductListDto {
  items: Product[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DashboardSummary {
  ordersToday: number;
  ordersWeek: number;
  revenueToday: number;
  revenueWeek: number;
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  chartData: { date: string; revenue: number; orders: number }[];
}

export interface CartItem {
  id: number;
  product?: Product;
  customProduct?: any; // Define CustomProduct interface if possible, or use any/Product structure
  quantity: number;
  isCustomProduct: boolean;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
  totalQuantity: number;
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl?: string;
  addedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string; // Guid
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipping' | 'Done' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid';
  payosOrderCode?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  userName: string
  userAvatar?: string
  userId: number
}

export interface FeaturedReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userAvatar?: string;
  productId: number;
  productName: string;
  productSlug?: string;
  productImage?: string;
}

export interface RatingBreakdown {
  star5: number
  star4: number
  star3: number
  star2: number
  star1: number
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingBreakdown: RatingBreakdown
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface CursorPaginatedResponse<T> {
  items: T[]
  nextCursor: number | null
  pageSize: number
  hasMore: boolean
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}

export interface PayosPaymentData {
  checkoutUrl: string
  qrCode: string
  orderCode: number
  amount: number
}

export interface OrderPaymentResponse {
  order: Order
  paymentData?: PayosPaymentData
}
