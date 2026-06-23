"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/footer';

export function ConditionalFooter() {
    const pathname = usePathname();
    
    // Hide footer on design/customize pages for an app-like feel
    if (pathname === '/customize' || pathname?.startsWith('/customize/')) {
        return null;
    }
    
    return <Footer />;
}
