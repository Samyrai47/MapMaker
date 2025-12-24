import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type AuthState = {
    isLoading: boolean;
    error: string | null;
    isAuthed: boolean;
};

const initialState: AuthState = {
    isLoading: false,
    error: null,
    isAuthed: false,
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080";

export type AuthUserRequest = { email: string; password: string };
export type RegisterUserRequest = { email: string; password: string };

export const signIn = createAsyncThunk<void, AuthUserRequest, { rejectValue: string }>(
    "auth/signIn",
    async (payload, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE_URL}/users/sign-in`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        if (!res.ok) return rejectWithValue((await res.text().catch(() => "")) || `HTTP ${res.status}`);
        await res.text().catch(() => "");
    }
);

export const signUp = createAsyncThunk<void, RegisterUserRequest, { rejectValue: string }>(
    "auth/signUp",
    async (payload, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE_URL}/users/sign-up`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        if (!res.ok) return rejectWithValue((await res.text().catch(() => "")) || `HTTP ${res.status}`);

        await res.json().catch(() => null);
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuthError(state) {
            state.error = null;
        },
        markLoggedOut(state) {
            state.isAuthed = false;
        },
    },
    extraReducers: (b) => {
        b.addCase(signIn.pending, (s) => {
            s.isLoading = true;
            s.error = null;
        });
        b.addCase(signIn.fulfilled, (s) => {
            s.isLoading = false;
            s.isAuthed = true;
        });
        b.addCase(signIn.rejected, (s, a) => {
            s.isLoading = false;
            s.isAuthed = false;
            s.error = a.payload ?? "Login failed";
        });

        b.addCase(signUp.pending, (s) => {
            s.isLoading = true;
            s.error = null;
        });
        b.addCase(signUp.fulfilled, (s) => {
            s.isLoading = false;
        });
        b.addCase(signUp.rejected, (s, a) => {
            s.isLoading = false;
            s.error = a.payload ?? "Registration failed";
        });
    },
});

export const { resetAuthError, markLoggedOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAuthLoading = (s: { auth: AuthState }) => s.auth.isLoading;
export const selectAuthError = (s: { auth: AuthState }) => s.auth.error;
export const selectIsAuthed = (s: { auth: AuthState }) => s.auth.isAuthed;
