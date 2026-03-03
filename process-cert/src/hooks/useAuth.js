import { useState } from "react";
import { load, persist } from "./useStorage.js";
import { SK } from "../data/constants.js";
import { PERMISSIONS } from "../data/permissions.js";

export function useAuth() {
  const [user, setUser] = useState(() => load(SK.SESSION, null));

  function login(username, password) {
    const users = load(SK.USERS, []);
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return { ok: false, error: "Invalid username or password." };
    if (!found.active) return { ok: false, error: "This account has been deactivated." };

    const updated = users.map(u =>
      u.id === found.id ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    persist(SK.USERS, updated);

    const sessionUser = { ...found, lastLogin: new Date().toISOString() };
    persist(SK.SESSION, sessionUser);
    setUser(sessionUser);
    return { ok: true };
  }

  function logout() {
    persist(SK.SESSION, null);
    setUser(null);
  }

  function can(action) {
    if (!user) return false;
    const roles = load(SK.ROLES, []);
    const role = roles.find(r => r.id === user.role);
    if (role) return (role.allowedActions || []).includes(action);
    return (PERMISSIONS[user.role] || []).includes(action); // fallback
  }

  function hasRole(role) {
    if (!user) return false;
    return user.role === role;
  }

  return { user, login, logout, can, hasRole };
}
