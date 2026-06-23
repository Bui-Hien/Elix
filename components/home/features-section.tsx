import { Shield, Truck, RefreshCcw, HeadphonesIcon, Award, Gem } from 'lucide-react'

const features = [
  {
    icon: Gem,
    title: 'Đá tự nhiên 100%',
    description: 'Sản phẩm từ đá tự nhiên, không qua xử lý hóa chất',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200'
  },
  {
    icon: Award,
    title: 'Kiểm định chất lượng',
    description: 'Kiểm định từ cơ quan uy tín',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200'
  },
  {
    icon: Shield,
    title: 'Bảo hành lâu dài',
    description: 'Cam kết bảo hành, sửa chữa miễn phí',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    icon: Truck,
    title: 'Giao hàng nhanh',
    description: 'Giao hàng toàn quốc, thanh toán khi nhận',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    icon: RefreshCcw,
    title: 'Đổi trả dễ dàng',
    description: 'Đổi trả miễn phí',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200'
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ trợ tận tâm',
    description: 'Tư vấn phong thủy miễn phí',
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F3E5E2] to-[#E7CCC6] text-[#754C43] text-sm font-medium mb-4">
            Tại sao chọn chúng tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#271916] mb-3">
            Cam kết của Elix
          </h2>
          <p className="text-[#4E332D] max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến sản phẩm chất lượng với dịch vụ tốt nhất
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.bgColor} border-2 ${feature.borderColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:-translate-y-1`}>
                <feature.icon className={`h-7 w-7 ${feature.iconColor}`} strokeWidth={2.5} />
              </div>
              <h3 className="font-semibold text-[#271916] text-sm mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-[#4E332D] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
