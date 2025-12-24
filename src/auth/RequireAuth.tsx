import React, {JSX, useEffect, useState} from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8080";

async function checkAuth(): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/maps`, {
        method: "GET",
        credentials: "include",
    });

    if (res.status === 401) return false;
    return res.ok;
}

export function RequireAuth(props: { children: JSX.Element }) {
    const location = useLocation();
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const ok = await checkAuth();
                if (alive) setIsAuthed(ok);
            } catch {
                if (alive) setIsAuthed(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    if (isAuthed === null) return null;

    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return props.children;
}
