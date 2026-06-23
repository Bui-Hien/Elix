'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

export default function ContactPage() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.')
        setLoading(false)
        // Reset form logic here if needed
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold mb-4">Liên hệ với chúng tôi</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Bạn có câu hỏi hoặc cần hỗ trợ? Hãy điền vào biểu mẫu bên dưới hoặc liên hệ trực tiếp qua các kênh thông tin của chúng tôi.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
                        <p className="text-muted-foreground mb-6">
                            Elix luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngần ngại liên hệ nếu bạn có bất kỳ thắc mắc nào về sản phẩm hay dịch vụ.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Địa chỉ</h4>
                                <p className="text-muted-foreground">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Điện thoại</h4>
                                <p className="text-muted-foreground">090 123 4567</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Email</h4>
                                <p className="text-muted-foreground">support@elix.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium text-foreground">Giờ làm việc</h4>
                                <p className="text-muted-foreground">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                                <p className="text-muted-foreground">Thứ 7: 9:00 - 12:00</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Gửi tin nhắn</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ và tên</Label>
                                <Input id="name" placeholder="Nguyễn Văn A" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input id="phone" type="tel" placeholder="0901234567" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="email@example.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Nội dung</Label>
                            <Textarea
                                id="message"
                                placeholder="Nội dung cần hỗ trợ..."
                                rows={5}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Map (Optional - scalable placeholder) */}
            <Separator className="my-16" />
            <div className="h-80 bg-muted rounded-xl flex items-center justify-center">
                <p className="text-muted-foreground">Bản đồ Google Maps sẽ được hiển thị tại đây</p>
            </div>
        </div>
    )
}
