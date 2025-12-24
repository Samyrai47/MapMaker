const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080";

export type TileDto = { x: number; y: number; type: "FLOOR" };
export type FurnitureDto = { id: number | null; itemId: string; x: number; y: number; rotation: number };

export type SaveMapRequest = {
    name: string;
    version: number;
    tiles: TileDto[];
    furniture: FurnitureDto[];
};

export type MapResponse = {
    id: number;
    name: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    tiles: TileDto[];
    furniture: FurnitureDto[];
};

export type MapListItemResponse = {
    id: number;
    name: string;
    version: number;
    updatedAt: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }

    return (await res.json()) as T;
}

export function createMap(req: SaveMapRequest) {
    return api<MapResponse>("/maps", { method: "POST", body: JSON.stringify(req) });
}

export function getMap(id: number) {
    return api<MapResponse>(`/maps/${id}`, { method: "GET" });
}

export function saveMap(id: number, req: SaveMapRequest) {
    return api<MapResponse>(`/maps/${id}`, { method: "PUT", body: JSON.stringify(req) });
}

export function listMaps() {
    return api<MapListItemResponse[]>("/maps", { method: "GET" });
}
