import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "faceufsc_token";

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
if (apiBase) {
  setBaseUrl(apiBase);
}

// Inject JWT token into every API hook automatically
setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));

createRoot(document.getElementById("root")!).render(<App />);
