import {
    authReducer,
    markLoggedOut,
    resetAuthError,
    selectAuthError,
    selectAuthLoading,
    selectIsAuthed,
    signIn,
    signUp,
} from "./authSlice";

describe("authSlice reducer", () => {
    const initial = { isLoading: false, error: null as string | null, isAuthed: false };

    it("should return initial state on unknown action", () => {
        expect(authReducer(undefined, { type: "UNKNOWN" })).toEqual(initial);
    });

    it("resetAuthError should set error to null", () => {
        const prev = { ...initial, error: "Boom" };
        const next = authReducer(prev, resetAuthError());
        expect(next.error).toBeNull();
    });

    it("markLoggedOut should set isAuthed to false", () => {
        const prev = { ...initial, isAuthed: true };
        const next = authReducer(prev, markLoggedOut());
        expect(next.isAuthed).toBe(false);
    });

    it("signIn.pending should set loading=true and reset error", () => {
        const prev = { ...initial, error: "Old error" };
        const action = signIn.pending("req-1", { email: "boris@britva.com", password: "123" });
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(true);
        expect(next.error).toBeNull();
    });

    it("signIn.fulfilled should set isAuthed=true and loading=false", () => {
        const prev = { ...initial, isLoading: true, isAuthed: false };
        const action = signIn.fulfilled(undefined, "req-1", { email: "boris@britva.com", password: "123" });
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(false);
        expect(next.isAuthed).toBe(true);
    });

    it("signIn.rejected should set loading=false, isAuthed=false and set payload error", () => {
        const prev = { ...initial, isLoading: true, isAuthed: true };
        const action = signIn.rejected(new Error("fail"), "req-1", { email: "boris@britva.com", password: "123" }, "Bad creds");
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(false);
        expect(next.isAuthed).toBe(false);
        expect(next.error).toBe("Bad creds");
    });

    it("signIn.rejected should use default message if payload is empty", () => {
        const prev = { ...initial, isLoading: true };
        const action = signIn.rejected(new Error("fail"), "req-1", { email: "boris@britva.com", password: "123" });
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(false);
        expect(next.error).toBe("Login failed");
    });

    it("signUp.pending should set loading=true and reset error", () => {
        const prev = { ...initial, error: "Old error" };
        const action = signUp.pending("req-2", { email: "brand@gmail.com", password: "456" });
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(true);
        expect(next.error).toBeNull();
    });

    it("signUp.fulfilled should set loading=false (does not authenticate)", () => {
        const prev = { ...initial, isLoading: true, isAuthed: false };
        const action = signUp.fulfilled(undefined, "req-2", { email: "brand@gmail.com", password: "456" });
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(false);
        expect(next.isAuthed).toBe(false);
    });

    it("signUp.rejected should set loading=false and set payload error", () => {
        const prev = { ...initial, isLoading: true };
        const action = signUp.rejected(new Error("fail"), "req-2", { email: "brand@gmail.com", password: "456" }, "Email exists");
        const next = authReducer(prev, action);

        expect(next.isLoading).toBe(false);
        expect(next.error).toBe("Email exists");
    });

    it("selectors should read state correctly", () => {
        const state = { auth: { isLoading: true, error: "x", isAuthed: true } };

        expect(selectAuthLoading(state)).toBe(true);
        expect(selectAuthError(state)).toBe("x");
        expect(selectIsAuthed(state)).toBe(true);
    });
});
