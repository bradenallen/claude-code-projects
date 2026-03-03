import { CheckSquare } from "lucide-react";
import { C } from "../../data/constants.js";
import Badge from "../ui/Badge.jsx";
import Btn from "../ui/Btn.jsx";

export default function Sidebar({ screens, activeScreen, setScreen, auth }) {
  const visibleScreens = screens.filter(s => auth.can(s.requiredAction));
  const activeId = typeof activeScreen === "string" ? activeScreen : activeScreen?.screen;

  return (
    <div style={{
      width: 240, background: C.navyDark, display: "flex", flexDirection: "column",
      height: "100vh", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CheckSquare size={22} color={C.blue} />
          <span style={{ color: C.white, fontWeight: 700, fontSize: 15, fontFamily: "Poppins, sans-serif" }}>
            Process Cert
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {visibleScreens.map(s => {
          const Icon = s.icon;
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "11px 20px",
                background: isActive ? C.blueLight + "18" : "transparent",
                border: "none",
                borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
                cursor: "pointer",
                color: isActive ? C.blue : "rgba(255,255,255,0.65)",
                fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                fontFamily: "Inter, sans-serif",
                textAlign: "left",
              }}
            >
              <Icon size={17} />
              {s.label}
            </button>
          );
        })}

        {/* Operator-only note */}
        {auth.hasRole("operator") && (
          <div style={{
            margin: "16px 16px 0",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8, padding: "10px 12px",
            fontSize: 11.5, color: "rgba(255,255,255,0.45)",
            fontFamily: "Inter, sans-serif", lineHeight: 1.5,
          }}>
            Your work queue is on the Dashboard
          </div>
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ color: C.white, fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
          {auth.user?.displayName}
        </div>
        <div style={{ marginBottom: 10 }}>
          <Badge type="role" value={auth.user?.role} />
        </div>
        <Btn variant="ghost" size="sm" onClick={auth.logout}
          style={{ width: "100%", justifyContent: "center", color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.15)" }}
        >
          Sign Out
        </Btn>
      </div>
    </div>
  );
}
