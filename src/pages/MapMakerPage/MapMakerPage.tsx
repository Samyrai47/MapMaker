import React, {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {createMap, getMap, saveMap, type MapResponse, type SaveMapRequest} from "../../api/maps";
import {ReactComponent as HandIcon} from "../../assets/icons/glove.svg";
import {ReactComponent as EraseIcon} from "../../assets/icons/eraser.svg";
import {ReactComponent as SelectIcon} from "../../assets/icons/select.svg";
import {ReactComponent as PencilIcon} from "../../assets/icons/pencil.svg";

import shell1Png from "../../assets/furniture/item_001.png";
import shell2Png from "../../assets/furniture/item_002.png";
import shell3Png from "../../assets/furniture/item_003.png";
import shell4Png from "../../assets/furniture/item_004.png";
import shell5Png from "../../assets/furniture/item_005.png";
import shell6Png from "../../assets/furniture/item_006.png";
import boxesPng from "../../assets/furniture/item_020.png";
import shieldPng from "../../assets/furniture/item_114.png";

import "./MapMakerPage.css";

type Tool = "pan" | "draw" | "erase" | "select";

type Tile = { x: number; y: number };

type FurnitureItem = {
    id: string;
    name: string;
    src: string;
};

type FurniturePlacement = {
    id: string;
    itemId: string;
    x: number;
    y: number;
};

const CELL = 64;

function keyOf(x: number, y: number) {
    return `${x}:${y}`;
}

function parseKey(k: string): Tile {
    const [x, y] = k.split(":").map(Number);
    return {x, y};
}

export function MapMakerPage() {
    const navigate = useNavigate();

    // Пример стартовой карты
    const initialTiles = useMemo(() => {
        const set = new Set<string>();
        const addRect = (x0: number, y0: number, w: number, h: number) => {
            for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set.add(keyOf(x, y));
        };
        const addLine = (x0: number, y0: number, x1: number, y1: number) => {
            if (x0 === x1) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) set.add(keyOf(x0, y));
            if (y0 === y1) for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) set.add(keyOf(x, y0));
        };

        addRect(2, 3, 4, 4);
        addLine(3, 0, 3, 3);

        addLine(6, 4, 9, 4);

        addRect(10, 3, 4, 4);

        addLine(12, 6, 12, 9);
        addLine(12, 9, 15, 9);
        addLine(15, 9, 15, 6);
        addLine(15, 6, 16, 6);
        addRect(16, 6, 2, 2);

        return set;
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const idStr = params.get("mapId");
        if (!idStr) return;

        const id = Number(idStr);
        if (!Number.isFinite(id)) return;

        (async () => {
            try {
                const data = await getMap(id);
                applyMapResponse(data);
            } catch (e) {
                console.error(e);
                setSaveError((e as Error).message);
            }
        })();
    }, []);

    const [tiles, setTiles] = useState<Set<string>>(initialTiles);
    const [tool, setTool] = useState<Tool>("pan");

    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({x: 0, y: 0});

    const viewportRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const dragStartRef = useRef({x: 0, y: 0});
    const offsetStartRef = useRef({x: 0, y: 0});

    type SelectionBox = { x0: number; y0: number; x1: number; y1: number };

    const [selection, setSelection] = useState<SelectionBox | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isMovingSelection, setIsMovingSelection] = useState(false);
    const [moveDelta, setMoveDelta] = useState({dx: 0, dy: 0});

    const selectStartRef = useRef<{ x: number; y: number } | null>(null);
    const moveStartRef = useRef<{ x: number; y: number } | null>(null);
    const selectionAtMoveStartRef = useRef<SelectionBox | null>(null);

    function normalizeBox(a: { x: number; y: number }, b: { x: number; y: number }): SelectionBox {
        const x0 = Math.min(a.x, b.x);
        const y0 = Math.min(a.y, b.y);
        const x1 = Math.max(a.x, b.x);
        const y1 = Math.max(a.y, b.y);
        return {x0, y0, x1, y1};
    }

    function isCellInside(box: SelectionBox, c: { x: number; y: number }) {
        return c.x >= box.x0 && c.x <= box.x1 && c.y >= box.y0 && c.y <= box.y1;
    }

    const [mapId, setMapId] = useState<number | null>(null);
    const [mapName, setMapName] = useState("Untitled map");
    const [mapVersion, setMapVersion] = useState(1);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [draftMapName, setDraftMapName] = useState(mapName);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const FURNITURE: FurnitureItem[] = [
        {id: "shell1", name: "Shell-1", src: shell1Png},
        {id: "shell2", name: "Shell-2", src: shell2Png},
        {id: "shell3", name: "Shell-3", src: shell3Png},
        {id: "shell4", name: "Shell-4", src: shell4Png},
        {id: "shell5", name: "Shell-5", src: shell5Png},
        {id: "shell6", name: "Shell-6", src: shell6Png},
        {id: "boxes", name: "Boxes", src: boxesPng},
        {id: "shield", name: "Shield", src: shieldPng},
    ];

    const [isFurnitureOpen, setFurnitureOpen] = useState(false);
    const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
    const [furniture, setFurniture] = useState<FurniturePlacement[]>([]);

    function FurnitureModal(props: {
        items: FurnitureItem[];
        onClose: () => void;
        onPick: (item: FurnitureItem) => void;
    }) {
        return (
            <div className="mmModalOverlay" onMouseDown={props.onClose}>
                <div className="mmModal" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="mmModalHeader">
                        <div className="mmModalTitle">Furniture</div>
                        <button className="mmModalClose" type="button" onClick={props.onClose}>
                            ✕
                        </button>
                    </div>

                    <div className="mmFurnitureGrid">
                        {props.items.map((it) => (
                            <button
                                key={it.id}
                                type="button"
                                className="mmFurnitureCard"
                                onClick={() => props.onPick(it)}
                                title={it.name}
                            >
                                <img className="mmFurnitureImg" src={it.src} alt={it.name}/>
                                <div className="mmFurnitureName">{it.name}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mmModalHint">Pick an item, then click on the map to place it.</div>
                </div>
            </div>
        );
    }

    function clampZoom(z: number) {
        return Math.min(2.5, Math.max(0.4, z));
    }

    function screenToWorldCell(clientX: number, clientY: number): Tile | null {
        const el = viewportRef.current;
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;

        const wx = (sx - offset.x) / zoom;
        const wy = (sy - offset.y) / zoom;

        const x = Math.floor(wx / CELL);
        const y = Math.floor(wy / CELL);

        return {x, y};
    }

    useEffect(() => {
        setDraftMapName(mapName);
    }, [mapName]);

    function onPointerDown(e: React.PointerEvent) {
        const cell = screenToWorldCell(e.clientX, e.clientY);
        if (!cell) return;

        if (tool === "pan") {
            draggingRef.current = true;
            dragStartRef.current = {x: e.clientX, y: e.clientY};
            offsetStartRef.current = {...offset};
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            return;
        }

        if (tool === "select") {
            // если клик внутри текущего выделения — начинаем перемещение
            if (selection && isCellInside(selection, cell)) {
                setIsMovingSelection(true);
                setMoveDelta({dx: 0, dy: 0});
                moveStartRef.current = cell;
                selectionAtMoveStartRef.current = selection;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                return;
            }

            // иначе начинаем новое выделение
            setIsSelecting(true);
            setMoveDelta({dx: 0, dy: 0});
            selectStartRef.current = cell;
            setSelection({x0: cell.x, y0: cell.y, x1: cell.x, y1: cell.y});
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            return;
        }
    }

    function SaveMapModal(props: {
        name: string;
        isSaving: boolean;
        onNameChange: (v: string) => void;
        onClose: () => void;
        onConfirm: () => void;
    }) {
        const canSave = props.name.trim().length > 0 && !props.isSaving;

        return (
            <div className="mmModalOverlay" onMouseDown={props.onClose}>
                <div className="mmModal" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="mmModalHeader">
                        <div className="mmModalTitle">Save map</div>
                        <button className="mmModalClose" type="button" onClick={props.onClose}>
                            ✕
                        </button>
                    </div>

                    <label className="mmModalLabel">
                        Map name
                        <input
                            className="mmModalInput"
                            value={props.name}
                            onChange={(e) => props.onNameChange(e.target.value)}
                            placeholder="Enter name…"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && canSave) props.onConfirm();
                                if (e.key === "Escape") props.onClose();
                            }}
                        />
                    </label>

                    <div className="mmModalActions">
                        <button className="mmModalBtnGhost" type="button" onClick={props.onClose}
                                disabled={props.isSaving}>
                            Cancel
                        </button>
                        <button className="mmModalBtn" type="button" onClick={props.onConfirm} disabled={!canSave}>
                            {props.isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    function applyMapResponse(data: MapResponse) {
        setMapId(data.id);
        setMapName(data.name);
        setMapVersion(data.version);

        setTiles(tilesFromDto(data.tiles));
        setFurniture(
            data.furniture.map((f) => ({
                id: String(f.id ?? crypto.randomUUID()),
                itemId: f.itemId,
                x: f.x,
                y: f.y,
                rotation: f.rotation,
            }))
        );
    }

    function onPointerMove(e: React.PointerEvent) {
        if (draggingRef.current) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setOffset({x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy});
            return;
        }

        const cell = screenToWorldCell(e.clientX, e.clientY);
        if (!cell) return;

        if (isSelecting && selectStartRef.current) {
            setSelection(normalizeBox(selectStartRef.current, cell));
            return;
        }

        if (isMovingSelection && moveStartRef.current) {
            setMoveDelta({dx: cell.x - moveStartRef.current.x, dy: cell.y - moveStartRef.current.y});
            return;
        }
    }

    function onPointerUp(e: React.PointerEvent) {
        if (draggingRef.current) {
            draggingRef.current = false;
            try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
            }
            return;
        }

        if (isSelecting) {
            setIsSelecting(false);
            selectStartRef.current = null;
            try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
            }
            return;
        }

        if (isMovingSelection) {
            setIsMovingSelection(false);

            const base = selectionAtMoveStartRef.current;
            const {dx, dy} = moveDelta;

            if (base && (dx !== 0 || dy !== 0)) {
                setTiles((prev) => {
                    const next = new Set(prev);

                    const selected: Array<{ x: number; y: number; k: string }> = [];
                    prev.forEach((k) => {
                        const {x, y} = parseKey(k);
                        if (x >= base.x0 && x <= base.x1 && y >= base.y0 && y <= base.y1) {
                            selected.push({x, y, k});
                        }
                    });

                    for (const t of selected) next.delete(t.k);
                    for (const t of selected) next.add(keyOf(t.x + dx, t.y + dy));

                    return next;
                });

                setFurniture((prev) =>
                    prev.map((p) => {
                        if (p.x >= base.x0 && p.x <= base.x1 && p.y >= base.y0 && p.y <= base.y1) {
                            return {...p, x: p.x + dx, y: p.y + dy};
                        }
                        return p;
                    })
                );

                setSelection({
                    x0: base.x0 + dx,
                    y0: base.y0 + dy,
                    x1: base.x1 + dx,
                    y1: base.y1 + dy,
                });
            }

            setMoveDelta({dx: 0, dy: 0});
            moveStartRef.current = null;
            selectionAtMoveStartRef.current = null;

            try {
                (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
            }
            return;
        }
    }

    function onClickViewport(e: React.MouseEvent) {
        if (tool === "select" || isSelecting || isMovingSelection) return;
        const cell = screenToWorldCell(e.clientX, e.clientY);
        if (!cell) return;

        if (selectedFurniture) {
            const placement: FurniturePlacement = {
                id: crypto.randomUUID(),
                itemId: selectedFurniture.id,
                x: cell.x,
                y: cell.y,
            };

            setFurniture((prev) => [...prev, placement]);

            setSelectedFurniture(null);
            setTool("draw");

            return;
        }

        if (tool === "pan") return;

        if (tool === "erase") {
            const hasFurnitureHere = furniture.some((p) => p.x === cell.x && p.y === cell.y);

            if (hasFurnitureHere) {
                setFurniture((prev) => prev.filter((p) => !(p.x === cell.x && p.y === cell.y)));
                return;
            }

            const k = keyOf(cell.x, cell.y);
            setTiles((prev) => {
                const next = new Set(prev);
                next.delete(k);
                return next;
            });

            return;
        }


        if (tool === "draw") {
            const k = keyOf(cell.x, cell.y);
            setTiles((prev) => {
                const next = new Set(prev);
                next.add(k);
                return next;
            });
        }
    }

    function tilesToDto(tiles: Set<string>) {
        return Array.from(tiles).map((k) => {
            const [x, y] = k.split(":").map(Number);
            return {x, y, type: "FLOOR" as const};
        });
    }

    function tilesFromDto(dto: Array<{ x: number; y: number }>) {
        return new Set(dto.map((t) => `${t.x}:${t.y}`));
    }

    function clearSelection() {
        setSelection(null);
        setIsSelecting(false);
        setIsMovingSelection(false);
        setMoveDelta({dx: 0, dy: 0});
        selectStartRef.current = null;
        moveStartRef.current = null;
        selectionAtMoveStartRef.current = null;
    }

    function setToolSafe(next: Tool) {
        clearSelection();
        setSelectedFurniture(null);
        setTool(next);
    }

    function onWheel(e: React.WheelEvent) {
        e.preventDefault();

        const direction = e.deltaY > 0 ? -1 : 1;

        const factor = direction > 0 ? 1.1 : 1 / 1.1;

        const oldZoom = zoom;
        const newZoom = clampZoom(Number((oldZoom * factor).toFixed(3)));

        if (newZoom === oldZoom) return;

        const el = viewportRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        const wx = (sx - offset.x) / oldZoom;
        const wy = (sy - offset.y) / oldZoom;

        const nextOffsetX = sx - wx * newZoom;
        const nextOffsetY = sy - wy * newZoom;

        setZoom(newZoom);
        setOffset({x: nextOffsetX, y: nextOffsetY});
    }

    function getCssVar(name: string, fallback: string) {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return v || fallback;
    }

    function loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async function exportPng() {
        if (tiles.size === 0 && furniture.length === 0) {
            alert("No tiles or furniture for export");
            return;
        }

        const ORANGE = getCssVar("--mm-orange", "#eda031");
        const TILE = getCssVar("--mm-tile", "#d9d9d9");
        const BG = getCssVar("--mm-bg", "#f2f2f2");

        const tileList = Array.from(tiles).map(parseKey);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const t of tileList) {
            minX = Math.min(minX, t.x);
            minY = Math.min(minY, t.y);
            maxX = Math.max(maxX, t.x);
            maxY = Math.max(maxY, t.y);
        }
        for (const p of furniture) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        const padCells = 1;
        const startX = minX - padCells;
        const startY = minY - padCells;
        const cellsW = (maxX - minX + 1) + padCells * 2;
        const cellsH = (maxY - minY + 1) + padCells * 2;

        const width = cellsW * CELL;
        const height = cellsH * CELL;

        const dpr = Math.min(2, window.devicePixelRatio || 1);

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, width, height);

        const dotStep = 14;
        const dotR = 1.2;
        const patternCanvas = document.createElement("canvas");
        patternCanvas.width = dotStep;
        patternCanvas.height = dotStep;
        const pctx = patternCanvas.getContext("2d");
        if (pctx) {
            pctx.clearRect(0, 0, dotStep, dotStep);
            pctx.fillStyle = ORANGE;
            pctx.beginPath();
            pctx.arc(dotStep / 2, dotStep / 2, dotR, 0, Math.PI * 2);
            pctx.fill();

            const pattern = ctx.createPattern(patternCanvas, "repeat");
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, width, height);
            }
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = ORANGE;
        ctx.fillStyle = TILE;

        for (const t of tileList) {
            const x = (t.x - startX) * CELL;
            const y = (t.y - startY) * CELL;
            ctx.fillRect(x, y, CELL, CELL);
            ctx.strokeRect(x, y, CELL, CELL);
        }

        const byId = new Map(FURNITURE.map((it) => [it.id, it]));
        const uniqueSrc = new Map<string, string>();

        for (const p of furniture) {
            const item = byId.get(p.itemId);
            if (item) uniqueSrc.set(item.id, item.src);
        }

        const images = new Map<string, HTMLImageElement>();
        await Promise.all(
            Array.from(uniqueSrc.entries()).map(async ([itemId, src]) => {
                images.set(itemId, await loadImage(src));
            })
        );

        for (const p of furniture) {
            const img = images.get(p.itemId);
            if (!img) continue;

            const x = (p.x - startX) * CELL;
            const y = (p.y - startY) * CELL;

            ctx.drawImage(img, x, y, CELL, CELL);
        }

        const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/png")
        );
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "map.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    const tileList = useMemo(() => Array.from(tiles).map(parseKey), [tiles]);

    async function onSaveMap(nameOverride?: string) {
        setIsSaving(true);
        setSaveError(null);

        const req = {
            name: (nameOverride ?? mapName).trim() || "Untitled map",
            version: mapVersion,
            tiles: tilesToDto(tiles),
            furniture: furniture.map((p) => ({
                id: null,
                itemId: p.itemId,
                x: p.x,
                y: p.y,
                rotation: 0,
            })),
        };

        try {
            const data = mapId == null ? await createMap(req) : await saveMap(mapId, req);
            setMapId(data.id);
            setMapVersion(data.version);
            setMapName(data.name);
        } catch (e) {
            setSaveError((e as Error).message);
            throw e;
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="mmRoot">
            {/* Верхняя панель */}
            <div className="mmTop">
                <div className="mmMenuWrap">
                    <div className="mmBrand">Map Maker</div>

                    <div className="mmMenu">
                        <button
                            className="mmMenuItem"
                            type="button"
                            onClick={() => setIsSaveModalOpen(true)}
                            disabled={isSaving}
                        >
                            Save map
                        </button>
                        <button className="mmMenuItem" type="button" onClick={exportPng}>
                            Export…
                        </button>
                        <button
                            className="mmMenuItem"
                            type="button"
                            onClick={() => navigate("/maps")}
                        >
                            Get to my maps
                        </button>
                    </div>
                </div>
            </div>

            {/* Сохранение карты */}
            {isSaveModalOpen && (
                <SaveMapModal
                    name={draftMapName}
                    isSaving={isSaving}
                    onNameChange={setDraftMapName}
                    onClose={() => setIsSaveModalOpen(false)}
                    onConfirm={async () => {
                        const trimmed = draftMapName.trim();
                        if (!trimmed) return;

                        setMapName(trimmed);
                        await onSaveMap(trimmed);
                        setIsSaveModalOpen(false);
                    }}
                />
            )}

            {/* Сообщение об ошибке сохранения */}
            {saveError && <div className="mmSaveError">{saveError}</div>}

            {/* Вьюпорт */}
            <div
                ref={viewportRef}
                className="mmViewport"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onClick={onClickViewport}
                onWheel={onWheel}
            >
                <div
                    className="mmScene"
                    style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        transformOrigin: "0 0",
                    }}
                >
                    {/* Тайлы */}
                    {tileList.map((t) => (
                        <div
                            key={keyOf(t.x, t.y)}
                            className="mmTile"
                            style={{
                                left: t.x * CELL,
                                top: t.y * CELL,
                                width: CELL,
                                height: CELL,
                            }}
                        />
                    ))}

                    {/* Мебель */}
                    {furniture.map((p) => {
                        const item = FURNITURE.find((i) => i.id === p.itemId);
                        if (!item) return null;

                        return (
                            <img
                                key={p.id}
                                className="mmFurnitureOnMap"
                                src={item.src}
                                alt={item.name}
                                style={{
                                    left: p.x * CELL,
                                    top: p.y * CELL,
                                    width: CELL,
                                    height: CELL,
                                }}
                            />
                        );
                    })}

                    {/* Выделение */}
                    {selection && (
                        <div
                            className="mmSelectionRect"
                            style={{
                                left: (selection.x0 + moveDelta.dx) * CELL,
                                top: (selection.y0 + moveDelta.dy) * CELL,
                                width: (selection.x1 - selection.x0 + 1) * CELL,
                                height: (selection.y1 - selection.y0 + 1) * CELL,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Нижний тулбар */}
            <div className="mmBottomBar">
                <button
                    className={`mmToolBtn ${tool === "pan" ? "isActive" : ""}`}
                    onClick={() => setToolSafe("pan")}
                    title="Hand (pan)"
                >
                    <HandIcon className="mmIcon"/>
                </button>

                <div className="mmDivider"/>

                <button
                    className={`mmToolBtn ${tool === "draw" ? "isActive" : ""}`}
                    onClick={() => setToolSafe("draw")}
                    title="Pencil (draw)"
                >
                    <PencilIcon className="mmIcon"/>
                </button>

                <button
                    className={`mmToolBtn ${tool === "select" ? "isActive" : ""}`}
                    onClick={() => setToolSafe("select")}
                    title="Select"
                >
                    <SelectIcon className="mmIcon"/>
                </button>

                <button
                    className={`mmToolBtn ${tool === "erase" ? "isActive" : ""}`}
                    onClick={() => setToolSafe("erase")}
                    title="Erase"
                >
                    <EraseIcon className="mmIcon"/>
                </button>

                <div className="mmDivider"/>

                <button
                    className={`mmToolBtn ${selectedFurniture ? "isActive" : ""}`}
                    type="button"
                    title="Furniture"
                    onClick={() => setFurnitureOpen(true)}
                >
                    <span className="mmToolText">🪑</span>
                </button>
            </div>

            {isFurnitureOpen && (
                <FurnitureModal
                    items={FURNITURE}
                    onClose={() => setFurnitureOpen(false)}
                    onPick={(item) => {
                        setSelectedFurniture(item);
                        setFurnitureOpen(false);
                    }}
                />
            )}
        </div>
    );
}
