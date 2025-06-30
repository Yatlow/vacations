import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from "react-redux";
import store, { type RootState } from "./Data/ReduxModule";
import App from './App.tsx';
import './main.css';

function AppWithKey() {
    const isAuthenticated = useSelector((state: RootState) => state);
    if (!isAuthenticated) localStorage.clear();
    return <App key={isAuthenticated ? "true" : "false"} />;
}




createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <AppWithKey />
        </Provider>
    </StrictMode>,
);

