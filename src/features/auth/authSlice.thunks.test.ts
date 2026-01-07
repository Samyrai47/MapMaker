import { configureStore } from "@reduxjs/toolkit";
import { authReducer, signIn, signUp } from "./authSlice";

type MockFetchResponse = {
    ok: boolean;
    status: number;
    text: jest.Mock<Promise<string>, []>;
    json: jest.Mock<Promise<unknown>, []>;
};

function makeStore() {
    return configureStore({
        reducer: { auth: authReducer },
    });
}

function mockFetchOnce(resp: Partial<MockFetchResponse>) {
    const response: MockFetchResponse = {
        ok: resp.ok ?? true,
        status: resp.status ?? 200,
        text: resp.text ?? jest.fn().mockResolvedValue(""),
        json: resp.json ?? jest.fn().mockResolvedValue(null),
    };

    (global as any).fetch = jest.fn().mockResolvedValue(response);
    return (global as any).fetch as jest.Mock;
}

describe("auth thunks (unit, fetch mocked)", () => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080";

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("signIn should call fetch with correct params and fulfill on ok", async () => {
        const fetchMock = mockFetchOnce({ ok: true, text: jest.fn().mockResolvedValue("") });
        const store = makeStore();

        const payload = { email: "boris@britva.com", password: "123" };
        const action = await store.dispatch(signIn(payload));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/users/sign-in`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        expect(action.type).toBe("auth/signIn/fulfilled");
        expect(store.getState().auth.isAuthed).toBe(true);
    });

    it("signIn should reject with text body when not ok", async () => {
        const fetchMock = mockFetchOnce({
            ok: false,
            status: 401,
            text: jest.fn().mockResolvedValue("Invalid credentials"),
        });

        const store = makeStore();
        const action = await store.dispatch(signIn({ email: "boris@britva.com", password: "wrongPassword" }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(action.type).toBe("auth/signIn/rejected");
        expect((action as any).payload).toBe("Invalid credentials");
        expect(store.getState().auth.error).toBe("Invalid credentials");
        expect(store.getState().auth.isAuthed).toBe(false);
    });

    it("signIn should reject with HTTP <status> when not ok and text is empty", async () => {
        const fetchMock = mockFetchOnce({
            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue(""),
        });

        const store = makeStore();
        const action = await store.dispatch(signIn({ email: "boris@britva.com", password: "x" }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(action.type).toBe("auth/signIn/rejected");
        expect((action as any).payload).toBe("HTTP 500");
        expect(store.getState().auth.error).toBe("HTTP 500");
    });

    it("signUp should call fetch with correct params and fulfill on ok", async () => {
        const fetchMock = mockFetchOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ any: "value" }),
        });

        const store = makeStore();
        const payload = { email: "brand@gmail.com", password: "456" };
        const action = await store.dispatch(signUp(payload));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/users/sign-up`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        expect(action.type).toBe("auth/signUp/fulfilled");
        expect(store.getState().auth.isLoading).toBe(false);
    });

    it("signUp should reject with text body when not ok", async () => {
        const fetchMock = mockFetchOnce({
            ok: false,
            status: 409,
            text: jest.fn().mockResolvedValue("User already exists"),
        });

        const store = makeStore();
        const action = await store.dispatch(signUp({ email: "brand@gmail.com", password: "456" }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(action.type).toBe("auth/signUp/rejected");
        expect((action as any).payload).toBe("User already exists");
        expect(store.getState().auth.error).toBe("User already exists");
    });
});
