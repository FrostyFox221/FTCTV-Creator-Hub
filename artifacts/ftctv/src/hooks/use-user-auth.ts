import { useState, useEffect } from "react";

export interface UserSession {
  username: string;
  displayName: string;
  token: string;
}

const KEY = "ftctv_user_session";

function readSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useUserAuth() {
  const [session, setSession] = useState<UserSession | null>(readSession);

  const login = (s: UserSession) => {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setSession(null);
  };

  return { session, login, logout, isLoggedIn: !!session };
}
