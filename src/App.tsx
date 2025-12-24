import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";

import MyMapsPage from "./pages/MyMapsPage/MyMapsPage";
import {MapMakerPage} from "./pages/MapMakerPage/MapMakerPage";
import {LoginPage} from "./pages/LoginPage/LoginPage";
import {RegisterPage} from "./pages/RegisterPage/RegisterPage";
import {RequireAuth} from "./auth/RequireAuth";

export default function App() {
    return (
        <Routes>
            <Route
                path="/maps"
                element={
                    <RequireAuth>
                        <MyMapsPage/>
                    </RequireAuth>
                }
            />

            <Route
                path="/editor"
                element={
                    <RequireAuth>
                        <MapMakerPage/>
                    </RequireAuth>
                }
            />

            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>

            <Route path="/" element={<Navigate to="/maps" replace/>}/>
            <Route path="*" element={<Navigate to="/maps" replace/>}/>
        </Routes>
    );
}
