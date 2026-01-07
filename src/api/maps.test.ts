export {};

type FetchResp = {
    ok: boolean;
    status: number;
    json: jest.Mock<Promise<any>, []>;
    text: jest.Mock<Promise<string>, []>;
};

function mockFetchOnce(partial: Partial<FetchResp>) {
    const resp: FetchResp = {
        ok: partial.ok ?? true,
        status: partial.status ?? 200,
        json: partial.json ?? jest.fn().mockResolvedValue({}),
        text: partial.text ?? jest.fn().mockResolvedValue(""),
    };

    (global as any).fetch = jest.fn().mockResolvedValue(resp);
    return (global as any).fetch as jest.Mock;
}

describe("api/maps.ts", () => {
    const prevEnv = process.env.REACT_APP_API_BASE_URL;

    beforeEach(() => {
        jest.resetModules();
        process.env.REACT_APP_API_BASE_URL = "http://test-api";
        jest.resetAllMocks();
    });

    afterEach(() => {
        process.env.REACT_APP_API_BASE_URL = prevEnv;
    });

    it("createMap: POST /maps with JSON body and credentials", async () => {
        const fetchMock = mockFetchOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: 1 }),
        });

        const { createMap } = require("./maps") as typeof import("./maps");

        const req: import("./maps").SaveMapRequest = {
            name: "My map",
            version: 1,
            tiles: [{ x: 1, y: 2, type: "FLOOR" }],
            furniture: [],
        };

        await createMap(req);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://test-api/maps");

        expect(init).toEqual(
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(req),
                credentials: "include",
            })
        );

        expect(init.headers).toEqual(
            expect.objectContaining({
                "Content-Type": "application/json",
            })
        );
    });

    it("getMap: GET /maps/:id", async () => {
        const fetchMock = mockFetchOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: 10 }),
        });

        const { getMap } = require("./maps") as typeof import("./maps");

        await getMap(10);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://test-api/maps/10");
        expect(init).toEqual(
            expect.objectContaining({
                method: "GET",
                credentials: "include",
            })
        );
    });

    it("saveMap: PUT /maps/:id with JSON body", async () => {
        const fetchMock = mockFetchOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: 10 }),
        });

        const { saveMap } = require("./maps") as typeof import("./maps");

        const req: import("./maps").SaveMapRequest = {
            name: "Updated",
            version: 2,
            tiles: [],
            furniture: [],
        };

        await saveMap(10, req);

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://test-api/maps/10");

        expect(init).toEqual(
            expect.objectContaining({
                method: "PUT",
                body: JSON.stringify(req),
                credentials: "include",
            })
        );

        expect(init.headers).toEqual(
            expect.objectContaining({
                "Content-Type": "application/json",
            })
        );
    });

    it("listMaps: GET /maps", async () => {
        const fetchMock = mockFetchOnce({
            ok: true,
            json: jest.fn().mockResolvedValue([]),
        });

        const { listMaps } = require("./maps") as typeof import("./maps");

        await listMaps();

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("http://test-api/maps");
        expect(init).toEqual(
            expect.objectContaining({
                method: "GET",
                credentials: "include",
            })
        );
    });

    it("throws Error(text) on not ok when text is not empty", async () => {
        mockFetchOnce({
            ok: false,
            status: 400,
            text: jest.fn().mockResolvedValue("Bad request"),
        });

        const { listMaps } = require("./maps") as typeof import("./maps");

        await expect(listMaps()).rejects.toThrow("Bad request");
    });

    it("throws Error(HTTP <status>) on not ok when text is empty", async () => {
        mockFetchOnce({
            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue(""),
        });

        const { listMaps } = require("./maps") as typeof import("./maps");

        await expect(listMaps()).rejects.toThrow("HTTP 500");
    });
});
