"use client"

import { useState, useEffect, Suspense } from "react"
import { Form, Input, Button, App } from "antd"
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons"
import { GoogleLogin } from '@react-oauth/google'

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import apiClient from "@/lib/api-client"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { setCredentials } from "@/lib/redux/slices/authSlice"
import { ROLES, ROUTES } from "@/lib/constants"

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { message } = App.useApp()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRedirect = (role?: string, userObj?: any) => {
    const callbackUrl = searchParams.get('callbackUrl')
    const finalRole = role || userObj?.role || userObj?.Role || "";
    
    console.log('🔗 [Login] Redirect Check:', { 
      passedRole: role, 
      userObjRole: userObj?.role, 
      userObjRolePascal: userObj?.Role,
      finalRole,
      callbackUrl 
    })
    
    if (finalRole.includes(ROLES.ADMIN) || finalRole.includes(ROLES.SUPER_ADMIN)) {
      if (callbackUrl) {
        const decodedUrl = decodeURIComponent(callbackUrl)
        console.log('🚀 [Login] Force Redirecting Admin to callbackUrl:', decodedUrl)
        window.location.href = decodedUrl
      } else {
        console.log('🚀 [Login] Force Redirecting Admin to Dashboard:', ROUTES.ADMIN_DASHBOARD)
        window.location.href = ROUTES.ADMIN_DASHBOARD
      }
    } else {
      console.log('🚀 [Login] Redirecting non-Admin to Home:', ROUTES.HOME)
      window.location.href = ROUTES.HOME
    }
  }

  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      handleRedirect(user.role, user)
    }
  }, [isAuthenticated, user, router, mounted])

  if (!mounted) return null;

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const data: any = await apiClient.post("/auth/login", {
        email: values.email,
        password: values.password,
        rememberMe: rememberMe
      })

      dispatch(setCredentials({
        user: data.user,
        token: data.accessToken,
      }))

      message.success(`Chào mừng trở lại, ${data.user.fullName || data.user.email}!`)
      handleRedirect(data.user.role, data.user)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại"
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    setLoading(true);
    try {
      const data: any = await apiClient.post("/auth/google-login", {
        credential: credentialResponse.credential
      });

      dispatch(setCredentials({
        user: data.user,
        token: data.accessToken,
      }));

      message.success(`Chào mừng trở lại, ${data.user.fullName || data.user.email}!`);
      handleRedirect(data.user.role, data.user)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Đăng nhập Google thất bại";
      message.error(msg);
    } finally {
      setLoading(false);
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

      <div className="container relative z-10 px-4 sm:px-6 flex flex-col items-center w-full max-w-[90vw] sm:max-w-[450px]">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-14"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-wide mb-2 drop-shadow-md" style={{ fontFamily: '"Segoe UI", "Open Sans", sans-serif' }}>
            Đăng Nhập
          </h1>
        </motion.div>

        {/* MAIN FORM - Floating, Clean */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full"
        >
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            size="large"
            requiredMark={false}
            className="space-y-8"
          >
            {/* USERNAME INPUT */}
            <div className="relative group">
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập Email" }]}
                className="mb-0"
              >
                <Input
                  prefix={<UserOutlined className="text-white text-xl mr-4 opacity-80" />}
                  placeholder="Email"
                  className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                />
              </Form.Item>
            </div>

            {/* PASSWORD INPUT */}
            <div className="relative group">
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                className="mb-0"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-white text-xl mr-4 opacity-80" />}
                  placeholder="Mật khẩu"
                  className="clean-input h-14 bg-transparent text-white placeholder:text-white/70 text-lg font-light"
                />
              </Form.Item>
            </div>

            {/* OPTIONS ROW */}
            <div className="flex justify-between items-center text-white/90 text-sm mt-3 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition-opacity opacity-90 hover:opacity-100">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer w-4 h-4 cursor-pointer appearance-none border border-white rounded-[2px] checked:bg-white transition-all"
                  />
                  <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="font-light tracking-wide">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="font-light tracking-wide opacity-90 hover:opacity-100 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <div className="pt-6">
              <Button
                htmlType="submit"
                loading={loading}
                block
                className="h-14 bg-[#FC3955] hover:bg-[#e02e48] border-none text-white text-xl font-normal rounded-[4px] shadow-[0_4px_15px_rgba(252,57,85,0.4)] transition-all tracking-wide"
              >
                ĐĂNG NHẬP
              </Button>
            </div>
          </Form>

          {/* OR SEPARATOR */}
          <div className="relative my-10 h-10 flex items-center justify-center">
            <div className="relative z-10 bg-[#FC3955] w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">HOẶC</span>
            </div>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                message.error('Đăng nhập Google thất bại');
              }}
              theme="filled_blue"
              shape="rectangular"
              size="large"
              width="300"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-white font-light text-sm opacity-90">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold hover:underline transition-all ml-1" style={{ color: '#271916' }}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-16 text-center opacity-70 pb-6">
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
        
        .clean-input input, 
        input.clean-input {
             background-color: transparent !important;
             color: white !important;
             padding-left: 0 !important;
             font-size: 18px !important;
             font-weight: 300 !important;
        }

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  )
}
