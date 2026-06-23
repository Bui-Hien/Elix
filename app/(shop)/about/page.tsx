import Image from 'next/image'
import { BadgeCheck, Truck, FileBadge } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="bg-[#F7EEEC] min-h-screen" suppressHydrationWarning>
            {/* Hero Section */}
            <section className="relative w-full -mt-16 md:-mt-20">
                <div className="flex flex-col lg:flex-row items-stretch border-b border-[#e5ccd0]/30 pt-16">
                    {/* Left Content */}
                    <div className="w-full lg:w-[60%] px-6 sm:px-8 lg:px-24 py-6 sm:py-8 flex flex-col justify-center order-2 lg:order-1">
                        <div className="max-w-2xl mx-auto lg:mx-0 lg:pl-12 space-y-12 sm:space-y-20 lg:space-y-32">
                            <div className="space-y-6 sm:space-y-8 lg:space-y-12">
                                <h1
                                    className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] leading-none tracking-tight"
                                    style={{
                                        fontFamily: "'1FTV VIP Classy Vogue', serif",
                                        color: '#4E332D'
                                    }}
                                >
                                    TRANG SỨC
                                </h1>
                                <p
                                    className="text-lg sm:text-2xl md:text-3xl lg:text-[2.5rem] tracking-[0.05em] uppercase leading-relaxed lg:whitespace-nowrap"
                                    style={{
                                        fontFamily: "'1FTV VIP Classy Vogue', serif",
                                        color: '#4E332D'
                                    }}
                                >
                                    CHO SỰ CÂN BẰNG VÀ AN NHIÊN
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="w-full lg:w-[40%] order-1 lg:order-2">
                        <Image
                            src="/about/anh1.png"
                            alt="About Hero"
                            width={1000}
                            height={1250}
                            className="w-full h-auto block"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section */}
            <section className="py-10 sm:py-16 bg-white">
                <div className="container mx-auto px-5 sm:px-6 lg:px-24">
                    <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
                        <div className="space-y-10 sm:space-y-16 order-2 lg:order-1">
                            <div className="space-y-4 sm:space-y-8">
                                <h2 
                                    className="text-3xl sm:text-[40px] lg:text-[50px] uppercase tracking-[0.1em]"
                                    style={{
                                        fontFamily: "'1FTV VIP Classy Vogue', serif",
                                        color: '#4E332D'
                                    }}
                                >
                                    VISION
                                </h2>
                                <p className="leading-relaxed text-base sm:text-lg lg:text-[24px] text-justify font-roboto lg:pr-8" style={{ color: '#754C43' }}>
                                    Seravian hướng tới trở thành thương hiệu trang sức đá năng lượng hàng đầu Việt Nam, kết hợp tinh hoa khoáng vật tự nhiên với thiết kế hiện đại. Chúng tôi mong muốn tái định nghĩa lối sống cân bằng và an nhiên, đưa liệu pháp năng lượng tự nhiên trở thành một phần của đời sống hiện đại. Đồng thời xây dựng cộng đồng sống tích cực, tỉnh thức và bền vững.
                                </p>
                            </div>
                            <div className="space-y-4 sm:space-y-8">
                                <h2 
                                    className="text-3xl sm:text-[40px] lg:text-[50px] uppercase tracking-[0.1em]"
                                    style={{
                                        fontFamily: "'1FTV VIP Classy Vogue', serif",
                                        color: '#4E332D'
                                    }}
                                >
                                    MISSION
                                </h2>
                                <p className="leading-relaxed text-base sm:text-lg lg:text-[24px] text-justify font-roboto lg:pr-8" style={{ color: '#754C43' }}>
                                    Seravian ứng dụng tri thức bát tự để giúp mỗi người tìm ra loại đá năng lượng phù hợp, mang lại trải nghiệm trang sức cá nhân hóa đơn giản và khoa học. Chúng tôi trao quyền cho khách hàng tự thiết kế trang sức độc bản, kết hợp năng lượng phong thủy với phong cách cá nhân. Trong 3 năm tới, ELIX hướng tới phục vụ hơn 100.000 khách hàng, xây dựng hệ sinh thái trang sức đá tự nhiên minh bạch, chất lượng và bền vững.
                                </p>
                            </div>
                        </div>
                        <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full order-1 lg:order-2">
                            <Image
                                src="/about/anh2.jpg"
                                alt="Vision and Mission"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="bg-white py-10 sm:py-16">
                <div className="container mx-auto px-5 sm:px-6 lg:px-24">
                    <div className="relative w-full aspect-[2/1] sm:aspect-[16/9] lg:aspect-[16/5] mb-10 sm:mb-20 overflow-hidden">
                        <Image
                            src="/about/anh3.jpg"
                            alt="Jewelry Connection"
                            fill
                            className="object-cover scale-110"
                            style={{ objectPosition: '80% 57%' }}
                        />
                    </div>
                    <div className="max-w-6xl mx-auto text-center px-4 sm:px-6">
                        <p 
                            className="text-[11px] sm:text-lg lg:text-[28px] font-serif leading-[1.7] sm:leading-[1.6] lg:leading-[1.8] tracking-[0.02em] sm:tracking-[0.03em] font-semibold"
                            style={{ color: '#754C43' }}
                        >
                            &ldquo; Việc lựa chọn đúng loại đá và màu sắc tương hợp không chỉ là một
                            <br />
                            lựa chọn thẩm mỹ, mà còn góp phần điều hòa cảm xúc, tối ưu hóa sức mạnh
                            <br />
                            nội tại và hướng đến một lối sống an nhiên bền vững. &rdquo;
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits Bar */}
            <section className="bg-white border-t border-gray-100 py-5">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-8 md:gap-[120px]">
                        <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-[#4E332D] stroke-[1px]" />
                            <span className="text-[12px] sm:text-[14px] uppercase tracking-[0.2em] font-medium text-[#4E332D]">Free ship toàn quốc</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FileBadge className="w-5 h-5 text-[#4E332D] stroke-[1px]" />
                            <span className="text-[12px] sm:text-[14px] uppercase tracking-[0.2em] font-medium text-[#4E332D]">Đá được kiểm nghiệm 100%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <BadgeCheck className="w-5 h-5 text-[#4E332D] stroke-[1px]" />
                            <span className="text-[12px] sm:text-[14px] uppercase tracking-[0.2em] font-medium text-[#4E332D]">Bảo hành trong vòng 12 tháng</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
