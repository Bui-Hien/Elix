import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HowToMeasureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HowToMeasureModal({ isOpen, onClose }: HowToMeasureModalProps) {
    const [step, setStep] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const measureImages = {
        step1: '/logo/t1.png',
        step2: '/logo/t2.png'
    };

    React.useEffect(() => {
        if (isOpen) setStep(1);
    }, [isOpen]);

    if (!isOpen) return null;
    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 200 : -200,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 200 : -200,
            opacity: 0
        })
    };

    // Reference Table Data
    const weightRanges = ['40-50', '50-60', '60-70', '70-80', '80-90', '90-100'];
    const heightRanges = [
        { label: '150-155', values: ['13.5', '15', '16', '-', '-', '-'] },
        { label: '155-160', values: ['14', '15', '16', '17', '-', '-'] },
        { label: '160-165', values: ['-', '15', '16', '17.5', '18', '19'] },
        { label: '165-170', values: ['-', '15', '16', '17', '18', '19'] },
        { label: '170-175', values: ['-', '15.5', '16.5', '17', '18', '19.5'] },
        { label: '175-180', values: ['-', '-', '17.5', '18', '18.5', '19.5'] },
        { label: '180-185', values: ['-', '-', '17.5', '18', '18.5', '19.5'] },
        { label: '185-190', values: ['-', '-', '-', '17.5', '18.5', '20'] }
    ];

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-[90vw] max-w-[480px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col pointer-events-auto"
                    style={{ fontFamily: 'var(--font-roboto), Roboto, sans-serif' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">Cách đo</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-[300px]">
                        <AnimatePresence mode="wait" custom={step}>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4 h-full flex flex-col"
                                >
                                    <h3 className="text-lg font-bold text-gray-800">Phương pháp đo cổ tay</h3>
                                    <div className="w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 flex items-center justify-center">
                                        <img src={measureImages.step1} alt="Cách đo" className="w-full max-w-md h-auto object-contain" style={{ borderRadius: '1px' }} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4 h-full flex flex-col"
                                >
                                    <h3 className="text-lg font-bold text-gray-800">So sánh kích thước hạt</h3>
                                    <div className="w-full rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 flex items-center justify-center">
                                        <img src={measureImages.step2} alt="Kích thước vòng" className="w-full max-w-md h-auto object-contain" style={{ borderRadius: '1px' }} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.2 }}
                                    className="space-y-4 h-full flex flex-col"
                                >
                                    <h3 className="text-lg font-bold text-gray-800">Cách 3: Ước lượng theo chiều cao và cân nặng</h3>
                                    <p className="text-gray-600 text-sm">Tra cứu theo khoảng chiều cao và cân nặng để ước lượng chu vi cổ tay.</p>

                                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                                        <table className="w-full text-xs text-center border-collapse bg-white">
                                            <thead>
                                                <tr>
                                                    <th className="p-2 border-b border-r bg-gray-50 font-bold text-gray-700 min-w-[70px]">
                                                        Chiều cao/Cân nặng
                                                    </th>
                                                    {weightRanges.map((w, i) => (
                                                        <th key={i} className="p-2 border-b bg-gray-50 font-medium text-gray-600 min-w-[50px]">{w}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {heightRanges.map((row, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="p-2 border-r font-medium text-gray-700">{row.label}</td>
                                                        {row.values.map((val, j) => (
                                                            <td key={j} className="p-2 text-gray-600">
                                                                {val !== '-' ? val : <span className="text-gray-200">-</span>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <p className="text-xs font-medium text-gray-500 italic text-center">
                                        Chỉ mang tính tham khảo, có thể sai số
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                        <span className="text-sm font-medium text-gray-500 tabular-nums">
                            {step} / {totalSteps}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={step === 1}
                                className={cn(
                                    "w-24 h-9 text-sm font-medium rounded-lg border transition-colors",
                                    step === 1 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                Trước
                            </button>
                            {step < totalSteps ? (
                                <button
                                    onClick={handleNext}
                                    className="w-24 h-9 flex items-center justify-center gap-1 bg-gray-800 text-white hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    Tiếp <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="w-24 h-9 bg-gray-800 text-white hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    Đóng
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
