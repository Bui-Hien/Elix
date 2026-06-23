import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/types';
import apiClient from '@/lib/api-client';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: null;
    loading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: true, 
};

// Async Thunk to fetch user profile using cookie
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/auth/me');
            return response as unknown as User;
        } catch (error: any) {
            // If 401/403 (Guest), just return null silently. Don't spam console.
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                return rejectWithValue(null);
            }
            // For other real errors (500, network), let them be known if needed, or just fail silently too for auth check.
            return rejectWithValue(null);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            // state.token = action.payload.token; // verification only
            state.isAuthenticated = true;
            state.loading = false; // Stop loading after credentials are set

            // Save accessToken to localStorage explicitly for API client fallback
            // since the backend's HttpOnly cookie might use Domain=.elix.io.vn and fail on localhost
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', action.payload.token);
            }

            // Save minimal info to localStorage for admin users (only for UI persistence)
            const roles = action.payload.user.role || (action.payload.user as any).Role || "";
            if (typeof window !== 'undefined' && roles.includes('Admin')) {
                const minimalUser = {
                    id: action.payload.user.id,
                    email: action.payload.user.email,
                    fullName: action.payload.user.fullName,
                    role: roles
                };
                localStorage.setItem('adminUser', JSON.stringify(minimalUser));
            }
        },
        // Optimistic logout
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false; // Stop loading after logout

            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('adminUser');
                localStorage.removeItem('accessToken');
            }
        },
        stopLoading: (state) => {
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(fetchUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                // Clear stale info from localStorage if auth fails
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('accessToken');
                }
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false; // Stop loading after logout
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('accessToken');
                }
            });
    },
});

export const { setCredentials, logout, stopLoading } = authSlice.actions;
export default authSlice.reducer;
