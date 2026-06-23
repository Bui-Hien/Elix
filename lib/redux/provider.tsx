'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchUser, stopLoading } from './slices/authSlice';

function AuthLoader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const path = pathname || '';

        // Skip auth check for specific routes if needed
        if (path.startsWith('/login') || path.startsWith('/register')) {
            store.dispatch(stopLoading());
            return;
        }

        // @ts-ignore
        store.dispatch(fetchUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only check auth once on mount, not on every route change

    return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthLoader>{children}</AuthLoader>
        </Provider>
    );
}
