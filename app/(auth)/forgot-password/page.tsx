"use client"

import { useState, useEffect } from "react"
import { Form, Input, Button, message } from "antd"
import {
    UserOutlined,
    LockOutlined,
    KeyOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined
} from "@ant-design/icons"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"

type Step = "Email" | "OTP" | "Reset" | "Success"

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("Email")
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const handleSendOtp = async (values: { email: string }) => {
        setLoading(true)
        try {
            console.log("Submitting forgot password for:", values.email);
            const response: any = await apiClient.post("/auth/forgot-password", { email: values.email })

            if (response.success === false) {
                message.error(response.message);
                return;
            }

            console.log("Forgot password success response:", response);
            setEmail(values.email)
            message.success("Mã OTP đã được gửi đến email của bạn")
            setStep("OTP")
        } catch (error: any) {
            console.error("Forgot password error caught:", error);
            console.error("Error response data:", error.response?.data);
            const msg = error.response?.data?.message || "Không thể gửi OTP"
            message.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (values: { otp: string }) => {
        setLoading(true)
        try {
            await apiClient.post("/auth/verify-otp", { email, otp: values.otp })
            setOtp(values.otp)
            message.success("Xác thực OTP thành công")
            setStep("Reset")
        } catch (error: any) {
            message.error(error.response?.data?.message || "OTP không chính xác hoặc đã hết hạn")
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            return message.error("Mật khẩu xác nhận không khớp")
        }
        setLoading(true)
        try {
            await apiClient.post("/auth/reset-password", {
                email,
                otp,
                newPassword: values.newPassword
            })
            message.success("Đặt lại mật khẩu thành công!")
            setStep("Success")
            setTimeout(() => router.push("/login"), 3000)
        } catch (error: any) {
            message.error(error.response?.data?.message || "Đặt lại mật khẩu thất bại")
        } finally {
            setLoading(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case "Email":
                return (
                    <motion.div
                        key="email"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        <Form onFinish={handleSendOtp} layout="vertical" size="large" requiredMark={false}>
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập Email" },
                                    { type: "email", message: "Email không hợp lệ" }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Nhập Email của bạn"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                />
                            </Form.Item>
                            <div className="pt-6">
                                <Button
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="h-14 bg-[#FC3955] hover:bg-[#e02e48] border-none text-white text-xl font-normal rounded-[4px] shadow-[0_4px_15px_rgba(252,57,85,0.4)] transition-all tracking-wide"
                                >
                                    GỬI MÃ OTP
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )

            case "OTP":
                return (
                    <motion.div
                        key="otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        <p className="text-white/80 text-center mb-6 font-light">
                            Mã OTP đã được gửi tới <b>{email}</b>
                        </p>
                        <Form onFinish={handleVerifyOtp} layout="vertical" size="large" requiredMark={false}>
                            <Form.Item
                                name="otp"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mã OTP" },
                                    { len: 6, message: "Mã OTP phải có 6 chữ số" }
                                ]}
                            >
                                <Input
                                    prefix={<KeyOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Nhập 6 số OTP"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                    maxLength={6}
                                />
                            </Form.Item>
                            <div className="pt-6">
                                <Button
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="h-14 bg-[#FC3955] hover:bg-[#e02e48] border-none text-white text-xl font-normal rounded-[4px] shadow-[0_4px_15px_rgba(252,57,85,0.4)] transition-all tracking-wide"
                                >
                                    XÁC NHẬN OTP
                                </Button>
                            </div>
                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep("Email")}
                                    className="text-white/60 hover:text-white text-sm font-light transition-colors"
                                >
                                    Dùng email khác?
                                </button>
                            </div>
                        </Form>
                    </motion.div>
                )

            case "Reset":
                return (
                    <motion.div
                        key="reset"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        <Form onFinish={handleResetPassword} layout="vertical" size="large" requiredMark={false}>
                            <Form.Item
                                name="newPassword"
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Mật khẩu mới"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                />
                            </Form.Item>
                            <Form.Item
                                name="confirmPassword"
                                rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới" }]}
                            >
                                <Input.Password
                                    prefix={<CheckCircleOutlined className="text-white text-xl mr-4 opacity-80" />}
                                    placeholder="Xác nhận mật khẩu"
                                    className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                                />
                            </Form.Item>
                            <div className="pt-6">
                                <Button
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className="h-14 bg-[#FC3955] hover:bg-[#e02e48] border-none text-white text-xl font-normal rounded-[4px] shadow-[0_4px_15px_rgba(252,57,85,0.4)] transition-all tracking-wide"
                                >
                                    ĐẶT LẠI MẬT KHẨU
                                </Button>
                            </div>
                        </Form>
                    </motion.div>
                )

            case "Success":
                return (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center w-full"
                    >
                        <div className="mb-6 text-6xl text-green-400">
                            <CheckCircleOutlined />
                        </div>
                        <h2 className="text-2xl text-white font-light mb-4">Thành công!</h2>
                        <p className="text-white/70 font-light mb-8">
                            Mật khẩu của bạn đã được cập nhật. Bạn đang được chuyển hướng về trang đăng nhập...
                        </p>
                        <Button
                            onClick={() => router.push("/login")}
                            className="h-14 bg-white/10 hover:bg-white/20 border-white/30 text-white text-lg font-light rounded-[4px] w-full"
                        >
                            ĐĂNG NHẬP NGAY
                        </Button>
                    </motion.div>
                )
        }
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* --- BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/brand/back_login.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-black/30" />

                {/* BACK TO LOGIN */}
                <Link
                    href="/login"
                    className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/10 transition-all">
                        <ArrowLeftOutlined className="text-lg" />
                    </div>
                    <span className="text-sm font-light tracking-wide hidden sm:inline-block">Quay lại Đăng nhập</span>
                </Link>
            </div>

            <div className="container relative z-10 px-4 flex flex-col items-center w-full max-w-[450px]">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-14"
                >
                    <h1 className="text-4xl md:text-5xl text-white font-light tracking-wide mb-2 drop-shadow-md" style={{ fontFamily: '"Segoe UI", "Open Sans", sans-serif' }}>
                        Quên mật khẩu
                    </h1>
                    <p className="text-white/60 font-light italic">Khôi phục quyền truy cập tài khoản</p>
                </motion.div>

                {/* MAIN AREA */}
                <div className="w-full min-h-[300px] flex items-center">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>
            </div>

            {/* FOOTER */}
            <div className="relative z-10 mt-16 text-center opacity-70 pb-6">
                <p className="text-white text-sm font-light tracking-wider">
                    © 2026 Elix. All rights reserved | Designed for Security
                </p>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600&display=swap');
        
        body {
            font-family: 'Open Sans', sans-serif;
            background-color: #000;
        }

        /* CLEAN INPUT STYLE */
        /* Transparent background, single white bottom border. No messy fills. */
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
        
        /* UPDATED: Target both nested input and direct input.clean-input */
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

        /* Focus State: White Border */
        .clean-input:hover, .clean-input:focus, .clean-input:focus-within {
            border-bottom-color: #ffffff !important;
        }
        
        /* Error State */
        .ant-form-item-explain-error {
            color: #ff6b6b !important;
            margin-top: 8px;
            font-size: 13px;
            text-align: left;
            font-weight: 400;
        }
        
        /* Autofill Fix: Force transparent background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
            -webkit-text-fill-color: white !important;
            -webkit-box-shadow: 0 0 0 30px rgba(0,0,0,0) inset !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: white;
        }

        /* Ant Design Password Icon */
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
