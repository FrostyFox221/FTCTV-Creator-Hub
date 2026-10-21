import { createRoot } from "react-dom/client";
import { Component, type ReactNode, type ErrorInfo } from "react";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "#7c3aed", color: "#fff",
          fontFamily: "system-ui,-apple-system,sans-serif",
          padding: "2rem", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
            Произошла ошибка
          </h1>
          <p style={{ maxWidth: "28rem", lineHeight: 1.6, marginBottom: "1.5rem", opacity: 0.9 }}>
            Приложение столкнулось с непредвиденной ошибкой.<br />
            Попробуйте перезагрузить страницу.
          </p>
          <button
            onClick={() => location.reload()}
            style={{
              background: "#fff", color: "#7c3aed", border: "none",
              padding: "0.75rem 2rem", borderRadius: "0.5rem",
              fontWeight: 600, fontSize: "1rem", cursor: "pointer",
            }}
          >
            Перезагрузить страницу
          </button>
          <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", opacity: 0.7 }}>
            Если проблема сохраняется — очистите кэш браузера или зайдите позже
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Скрываем HTML-fallback при успешном монтировании
const fallback = document.getElementById("load-fallback");
if (fallback) fallback.style.display = "none";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
