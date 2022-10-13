import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../pages/Main";
import Welcome from "../pages/Welcome";

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/main" element={<Main />} />
            </Routes>
        </BrowserRouter>
    )
}