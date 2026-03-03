import { useState } from "react";
import { CheckSquare } from "lucide-react";
import { C } from "../../data/constants.js";
import { iStyle } from "../ui/styles.js";
import Btn from "../ui/Btn.jsx";

const DEMO_USERS = [
  { label: "Admin",       username: "admin",      password: "admin123", role: "admin",       color: "#5B21B6" },
  { label: "Engineer",    username: "engineer",   password: "eng123",   role: "engineer",    color: C.navy },
  { label: "Operator",    username: "operator",   password: "op123",    role: "operator",    color: "#1D4ED8" },
  { label: "Viewer",      username: "viewer",     password: "view123",  role: "viewer",      color: C.grayText },
  { label: "Super Admin", username: "superadmin", password: "sa123",    role: "super_admin", color: "#7C3AED" },
];

export default function LoginScreen({ auth }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = auth.login(username.trim(), password);
      if (!result.ok) setError(result.error);
      setLoading(false);
    }, 200);
  }

  function quickLogin(u) {
    setUsername(u.username);
    setPassword(u.password);
    setTimeout(() => {
      const result = auth.login(u.username, u.password);
      if (!result.ok) setError(result.error);
    }, 100);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.grayBg,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <CheckSquare size={32} color={C.navy} />
            <span style={{ fontSize: 24, fontWeight: 800, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
              Process Cert
            </span>
          </div>
          <p style={{ margin: 0, color: C.grayMid, fontSize: 14, fontFamily: "Inter, sans-serif" }}>
            Process Certification Portal
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: C.white, borderRadius: 16, padding: "36px 36px",
          boxShadow: "0 4px 24px rgba(0,47,167,0.08)", border: `1px solid ${C.grayLine}`,
        }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
                Username
              </label>
              <input
                style={iStyle}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
                Password
              </label>
              <input
                type="password"
                style={iStyle}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: C.redLight, border: `1px solid ${C.red}`, borderRadius: 8,
                padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red,
                fontFamily: "Inter, sans-serif",
              }}>
                {error}
              </div>
            )}

            <Btn type="submit" disabled={loading || !username || !password} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign In"}
            </Btn>
          </form>
        </div>

        {/* Quick login cards */}
        <div style={{ marginTop: 24 }}>
          <p style={{ textAlign: "center", fontSize: 12, color: C.grayMid, marginBottom: 12, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Demo Accounts
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {DEMO_USERS.map(u => (
              <button
                key={u.username}
                onClick={() => quickLogin(u)}
                style={{
                  background: C.white, border: `1px solid ${C.grayLine}`,
                  borderRadius: 10, padding: "12px 14px",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: "0 1px 4px rgba(0,26,87,0.05)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: u.color, fontFamily: "Inter, sans-serif", marginBottom: 2 }}>
                  {u.label}
                </div>
                <div style={{ fontSize: 11.5, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>
                  {u.username} / {u.password}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
