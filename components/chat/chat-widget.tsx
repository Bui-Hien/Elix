'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn, formatPrice } from '@/lib/utils';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);
  const dragControls = useDragControls();

  const { messages, isLoading, error, sendMessage, isReady } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Constraints Wrapper */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />

      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            drag
            dragConstraints={constraintsRef}
            dragElastic={0}
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#F2E0DC] to-[#BD7C6F] text-[#774E45] shadow-2xl shadow-[#BD7C6F]/30 items-center justify-center ring-2 ring-[#BD7C6F]/20 hover:ring-[#BD7C6F]/40 transition-all cursor-grab active:cursor-grabbing pointer-events-auto",
              pathname === '/customize' ? "hidden md:flex" : "flex"
            )}
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-[#BD7C6F] rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={constraintsRef}
            dragElastic={0}
            dragMomentum={false}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden bg-[#faf9f7] shadow-2xl shadow-[#BD7C6F]/20 rounded-3xl border border-[#BD7C6F]/10 pointer-events-auto w-[calc(100vw-2rem)] h-[70vh] max-h-[700px] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[620px]"
          >
            {/* Header - Drag Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="relative cursor-grab active:cursor-grabbing px-6 py-5 bg-gradient-to-r from-[#F2E0DC] to-[#BD7C6F] text-[#774E45] select-none flex-shrink-0"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#774E45]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#774E45]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">ELIX Concierge</h3>
                    <p className="text-[10px] text-[#774E45]/80 font-medium tracking-widest uppercase">Tư Vấn Cao Cấp</p>
                  </div>
                </div>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors pointer-events-auto"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4 text-[#774E45]/60" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide bg-[#faf9f7]">
              {!isReady && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#BD7C6F] mx-auto" />
                    <p className="text-xs text-gray-400">Đang kết nối...</p>
                  </div>
                </div>
              )}

              {isReady && messages.length === 0 && (
                <div className="space-y-5 pt-2">
                  <div className="text-center space-y-2 pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#BD7C6F]/20 to-[#BD7C6F]/5 flex items-center justify-center mx-auto border border-[#BD7C6F]/10">
                      <Sparkles className="w-7 h-7 text-[#BD7C6F]" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                    <p className="text-[11px] text-gray-400">Hỏi về sản phẩm, giá cả, chính sách...</p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/tu-van"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#F2E0DC] to-[#BD7C6F] text-[#774E45] hover:shadow-lg transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#774E45]/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-[#774E45]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Tư Vấn Mệnh Phong Thủy</p>
                        <p className="text-[10px] text-[#774E45]/50">Xem mệnh ngũ hành & gợi ý đá phù hợp</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#774E45] group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                      onClick={() => sendMessage('Cho tôi xem các sản phẩm vòng tay')}
                      className="w-full text-left px-4 py-3 rounded-2xl bg-white border border-gray-100 hover:border-[#BD7C6F]/30 hover:shadow-sm transition-all text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="text-base">💎</span>
                      <span>Xem sản phẩm vòng tay</span>
                    </button>
                    <button
                      onClick={() => sendMessage('Chính sách vận chuyển như thế nào?')}
                      className="w-full text-left px-4 py-3 rounded-2xl bg-white border border-gray-100 hover:border-[#BD7C6F]/30 hover:shadow-sm transition-all text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="text-base">🚚</span>
                      <span>Chính sách vận chuyển</span>
                    </button>
                    <button
                      onClick={() => sendMessage('Làm sao để chọn size vòng tay?')}
                      className="w-full text-left px-4 py-3 rounded-2xl bg-white border border-gray-100 hover:border-[#BD7C6F]/30 hover:shadow-sm transition-all text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span className="text-base">📏</span>
                      <span>Hướng dẫn chọn size</span>
                    </button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-gradient-to-r from-[#BD7C6F] to-[#774E45] text-white rounded-br-md'
                      : 'bg-white border border-gray-100 shadow-sm rounded-bl-md'
                      }`}
                  >
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#BD7C6F]">Gợi ý cho bạn</p>
                        {message.suggestedProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex items-center gap-3 p-2 rounded-xl bg-[#faf9f7] hover:bg-[#f5f3ef] transition-colors"
                          >
                            {product.imageUrl && (
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={44}
                                height={44}
                                className="rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate text-gray-800">
                                {product.name}
                              </p>
                              <p className="text-[11px] font-bold text-[#BD7C6F]">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#BD7C6F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#BD7C6F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#BD7C6F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center">
                  <p className="text-xs text-red-400 bg-red-50 px-4 py-2 rounded-xl inline-block">{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* InputArea */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-[#faf9f7] rounded-2xl border border-gray-100 px-4 py-1 focus-within:border-[#BD7C6F]/30 focus-within:ring-2 focus-within:ring-[#BD7C6F]/10 transition-all">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi..."
                  disabled={!isReady || isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-sm py-3 placeholder:text-gray-300 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!isReady || isLoading || !inputValue.trim()}
                  className="w-9 h-9 rounded-xl bg-[#BD7C6F] text-white flex items-center justify-center hover:bg-[#774E45] disabled:opacity-30 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
