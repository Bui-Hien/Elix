"use client"

import { useState } from "react"
import { Form, Input, Button, message, Divider, Modal } from "antd"
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [isTermsVisible, setIsTermsVisible] = useState(false)
    const router = useRouter()

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            await apiClient.post("/auth/register", {
                fullName: values.fullName,
                email: values.email,
                password: values.password,
                phone: values.phone,
            })
            message.success("Đăng ký thành công! Vui lòng đăng nhập.")
            router.push("/login")
        } catch (error: any) {
            message.error(error.response?.data?.message || "Đăng ký thất bại")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* --- BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-[url('/brand/back_login.jpg')] bg-cover bg-center"
                />
                <div className="absolute inset-0" style={{ backgroundColor: '#404040', opacity: 0.53 }} />

                {/* BACK TO HOME LINK */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 transition-colors group"
                    style={{ color: '#271916' }}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ border: '1px solid #271916' }}>
                        <ArrowLeftOutlined className="text-lg" />
                    </div>
                    <span className="text-sm font-light tracking-wide hidden sm:inline-block">Về Trang Chủ</span>
                </Link>
            </div>

            <div className="container relative z-10 px-4 flex flex-col items-center w-full max-w-[500px] max-[640px]:max-w-[90vw] max-[640px]:px-6">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 max-[640px]:mb-6"
                >
                    <h1 className="text-4xl md:text-5xl max-[640px]:text-2xl text-white font-light tracking-wide mb-2 drop-shadow-md" style={{ fontFamily: '"Segoe UI", "Open Sans", sans-serif' }}>
                        Đăng Ký Tài Khoản
                    </h1>
                </motion.div>

                {/* MAIN FORM */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full"
                >
                    <Form
                        name="register"
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                        requiredMark={false}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
                            {/* NAME */}
                            <div className="relative group">
                                <Form.Item
                                    name="fullName"
                                    rules={[{ required: true, message: "Nhập họ tên" }]}
                                    className="mb-0"
                                >
                                    <Input
                                        placeholder="Họ và tên"
                                        className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                    />
                                </Form.Item>
                            </div>
                            {/* PHONE */}
                            <div className="relative group">
                                <Form.Item name="phone" className="mb-0">
                                    <Input
                                        placeholder="Số điện thoại"
                                        className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="relative group">
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: "Nhập Email" }, { type: "email", message: "Email không hợp lệ" }]}
                                className="mb-0"
                            >
                                <Input
                                    prefix={<MailOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Địa chỉ Email"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                />
                            </Form.Item>
                        </div>

                        {/* PASSWORD */}
                        <div className="relative group">
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}
                                className="mb-0"
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Mật khẩu"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                />
                            </Form.Item>
                        </div>

                        {/* TERMS CHECKBOX */}
                        <div className="flex justify-start text-white/90 text-sm mt-3 px-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-opacity opacity-90 hover:opacity-100">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" className="peer w-4 h-4 cursor-pointer appearance-none border border-white rounded-[2px] checked:bg-white transition-all" />
                                    <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span className="font-light tracking-wide">
                                    Tôi đồng ý với{' '}
                                    <span
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsTermsVisible(true);
                                        }}
                                        className="underline hover:text-white font-normal cursor-pointer"
                                    >
                                        Điều khoản dịch vụ
                                    </span>
                                </span>
                            </label>
                        </div>

                        {/* REGISTER BUTTON */}
                        <div className="pt-6">
                            <Button
                                htmlType="submit"
                                loading={loading}
                                block
                                className="h-14 bg-[#FC3955] hover:bg-[#e02e48] border-none text-white text-xl font-normal rounded-[4px] shadow-[0_4px_15px_rgba(252,57,85,0.4)] transition-all tracking-wide"
                            >
                                ĐĂNG KÝ
                            </Button>
                        </div>
                    </Form>

                    <div className="mt-8 text-center">
                        <p className="text-white font-light text-sm">
                            Đã có tài khoản?{" "}
                            <Link href="/login" className="font-bold hover:underline transition-all ml-1" style={{ color: '#271916' }}>
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* TERMS MODAL */}
            <Modal
                title={<span className="text-xl font-bold">Điều khoản & Dịch vụ</span>}
                open={isTermsVisible}
                onOk={() => setIsTermsVisible(false)}
                onCancel={() => setIsTermsVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsTermsVisible(false)} className="bg-gray-200 hover:bg-gray-300 text-black border-none">
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => setIsTermsVisible(false)} className="bg-[#FC3955] hover:bg-[#e02e48] border-none">
                        Tôi Đã Hiểu
                    </Button>,
                ]}
                centered
            >
                <div className="h-[400px] overflow-y-auto pr-2 text-justify text-gray-700 leading-relaxed space-y-3">
                    <p>Chào mừng bạn đến với <strong>Elix</strong>. Khi bạn đăng ký và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây:</p>

                    <h3 className="font-bold text-gray-900 mt-2">1. Tài khoản người dùng</h3>
                    <p>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn là trách nhiệm của bạn.</p>

                    <h3 className="font-bold text-gray-900 mt-2">2. Quyền riêng tư</h3>
                    <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo Chính sách bảo mật. Thông tin của bạn sẽ không được chia sẻ với bên thứ ba nếu không có sự đồng ý của bạn, trừ khi pháp luật yêu cầu.</p>

                    <h3 className="font-bold text-gray-900 mt-2">3. Hành vi bị cấm</h3>
                    <p>Bạn không được sử dụng dịch vụ để thực hiện các hành vi vi phạm pháp luật, lừa đảo, phát tán mã độc, hoặc gây hại cho hệ thống và người dùng khác.</p>

                    <h3 className="font-bold text-gray-900 mt-2">4. Thay đổi điều khoản</h3>
                    <p>Chúng tôi có quyền thay đổi các điều khoản này bất kỳ lúc nào. Những thay đổi sẽ được thông báo trên website hoặc qua email.</p>

                    <p className="italic mt-4">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của Elix!</p>
                </div>
            </Modal>

            {/* FOOTER */}
            <div className="relative z-10 mt-12 text-center opacity-70 pb-6">
                <p className="text-white text-sm font-light tracking-wider">
                    © 2026 Seravian. Bản quyền đã được bảo hộ | Thiết kế bởi <Link href="/" className="transition-colors underline" style={{ color: '#271916' }}>Seravian</Link>
                </p>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap');
        
        body {
            font-family: 'Open Sans', sans-serif;
            background-color: #000;
        }

        /* CLEAN INPUT STYLE */
        .clean-input {
            background-color: transparent !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 2px solid rgba(255, 255, 255, 0.5) !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
        }
        
        /* Selector for inputs inside wrapper OR direct inputs */
        .clean-input input,
        input.clean-input {
             background-color: transparent !important;
             color: white !important;
             padding-left: 0 !important;
             font-size: 18px !important;
             font-weight: 300 !important;
        }

        /* Force White Placeholders */
        .clean-input input::placeholder,
        input.clean-input::placeholder {
            color: rgba(255, 255, 255, 0.8) !important;
            opacity: 1 !important;
        }

        .clean-input .ant-input-prefix {
            margin-right: 12px;
            margin-left: 4px;
        }

        .clean-input:hover, .clean-input:focus, .clean-input:focus-within {
            border-bottom-color: #ffffff !important;
        }
        
        .ant-form-item-explain-error {
            color: #ff6b6b !important;
            margin-top: 8px;
            font-size: 13px;
            text-align: left;
            font-weight: 400;
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-text-fill-color: white !important;
            -webkit-box-shadow: 0 0 0 30px rgba(0,0,0,0) inset !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }

        .ant-input-password-icon {
            color: rgba(255,255,255,0.7) !important;
        }
        .ant-input-password-icon:hover {
            color: white !important;
        }
      `}</style>
        </div>
    )
}
