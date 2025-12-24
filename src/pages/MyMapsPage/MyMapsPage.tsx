import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMaps, type MapListItemResponse } from "../../api/maps";
import styles from "./MyMapsPage.module.css";

export default function MyMapsPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<MapListItemResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await listMaps();
            setItems(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <div className={styles.title}>My maps</div>

                <div className={styles.actions}>
                    <button
                        className={styles.btn}
                        type="button"
                        onClick={() => navigate("/editor")}
                        title="Create new map"
                    >
                        New map
                    </button>

                    <button className={styles.btnGhost} type="button" onClick={load}>
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.muted}>Loading…</div>
                ) : items.length === 0 ? (
                    <div className={styles.muted}>No maps yet. Click “New map”.</div>
                ) : (
                    items.map((m) => (
                        <div key={m.id} className={styles.card}>
                            <div className={styles.cardMain}>
                                <div className={styles.cardName}>{m.name}</div>
                                <div className={styles.cardMeta}>
                                    id: {m.id} · v{m.version} · updated: {new Date(m.updatedAt).toLocaleString()}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.btn}
                                    type="button"
                                    onClick={() => navigate(`/editor?mapId=${m.id}`)}
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
