import { useState } from "react";
import { LayoutDashboard, ClipboardList, GitBranch, Calendar, Users, Shield } from "lucide-react";
import { C } from "../../data/constants.js";
import { FEATURE_GROUPS, SCREEN_FLAGS, ADDITIONAL_PERMISSIONS } from "../../data/permissions.js";
import Btn from "../ui/Btn.jsx";

const SCREEN_ICONS = {
  LayoutDashboard, ClipboardList, GitBranch, Calendar, Users, Shield,
};

const labelStyle = {
  display: "block", marginBottom: 5,
  fontSize: 12, fontWeight: 600, color: C.grayMid,
  textTransform: "uppercase", letterSpacing: "0.05em",
  fontFamily: "Inter, sans-serif",
};

const sectionHeadStyle = {
  fontSize: 16, fontWeight: 700, color: C.dark,
  fontFamily: "Poppins, sans-serif", marginBottom: 4,
};

const sectionDescStyle = {
  fontSize: 13, color: C.grayMid, fontFamily: "Inter, sans-serif", marginBottom: 0,
};

function pill(on, disabled) {
  if (disabled) return {
    background: C.white, border: `1.5px solid ${C.grayLine}`, color: C.grayText,
    borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600,
    cursor: "not-allowed", opacity: 0.4, fontFamily: "Inter, sans-serif",
    display: "inline-block",
  };
  if (on) return {
    background: C.navy, border: `1.5px solid ${C.navy}`, color: C.white,
    borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "Inter, sans-serif", display: "inline-block",
  };
  return {
    background: C.white, border: `1.5px solid ${C.grayLine}`, color: C.grayText,
    borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "Inter, sans-serif", display: "inline-block",
  };
}

export default function RoleBuilderScreen({ role: initialRole, onSave, onCancel }) {
  const [name, setName] = useState(initialRole?.name || "New Role");
  const [allowedActions, setAllowedActions] = useState(
    () => new Set(initialRole?.allowedActions || [])
  );

  function toggle(action) {
    setAllowedActions(prev => {
      const next = new Set(prev);
      if (next.has(action)) {
        next.delete(action);
        // If it was a screenAction, remove all ops for that feature group
        const group = FEATURE_GROUPS.find(g => g.screenAction === action);
        if (group) group.ops.forEach(op => next.delete(op.action));
      } else {
        next.add(action);
        // If it was a feature op, auto-enable the screen
        const group = FEATURE_GROUPS.find(g => g.ops.some(op => op.action === action));
        if (group) next.add(group.screenAction);
      }
      return next;
    });
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), allowedActions: Array.from(allowedActions) });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: C.grayBg, display: "flex", flexDirection: "column",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        height: 56, background: C.navyDark, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
      }}>
        <Shield size={18} color={C.blue} />
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: C.white, fontSize: 16, fontWeight: 700, fontFamily: "Poppins, sans-serif",
          }}
          placeholder="Role name…"
        />
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <Btn variant="ghost" onClick={onCancel}
            style={{ color: C.grayMid, borderColor: "rgba(255,255,255,0.15)" }}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} disabled={!name.trim()}>
            Save Role
          </Btn>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Screen Access */}
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.grayLine}`,
            boxShadow: "0 2px 12px rgba(0,47,167,0.06)", padding: 28,
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>Screen Access</div>
              <p style={sectionDescStyle}>Control which navigation screens are visible to this role.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {SCREEN_FLAGS.map(sf => {
                const on = allowedActions.has(sf.action);
                const Icon = SCREEN_ICONS[sf.icon] || Shield;
                return (
                  <button key={sf.id} onClick={() => toggle(sf.action)} style={{
                    background: on ? C.blueLight : C.white,
                    border: `1.5px solid ${on ? C.blue : C.grayLine}`,
                    borderRadius: 10, padding: "14px 16px",
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} color={on ? C.blue : C.grayMid} />
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: on ? C.blue : C.grayText,
                        fontFamily: "Inter, sans-serif",
                      }}>
                        {sf.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature Permissions */}
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.grayLine}`,
            boxShadow: "0 2px 12px rgba(0,47,167,0.06)", padding: 28,
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={sectionHeadStyle}>Feature Permissions</div>
              <p style={sectionDescStyle}>Fine-grained CRUD control per feature area.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {FEATURE_GROUPS.map(group => {
                const screenOn = allowedActions.has(group.screenAction);
                return (
                  <div key={group.key}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.dark, fontFamily: "Inter, sans-serif" }}>
                        {group.label}
                      </span>
                      <div style={{ flex: 1, height: 1, background: C.grayLine }} />
                    </div>
                    <p style={{ ...sectionDescStyle, marginBottom: 10, fontSize: 12 }}>{group.desc}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {group.ops.map(op => {
                        const on = allowedActions.has(op.action);
                        const disabled = !screenOn;
                        return (
                          <button
                            key={op.action}
                            onClick={() => !disabled && toggle(op.action)}
                            style={pill(on, disabled)}
                          >
                            {op.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Permissions */}
          <div style={{
            background: C.white, borderRadius: 14, border: `1px solid ${C.grayLine}`,
            boxShadow: "0 2px 12px rgba(0,47,167,0.06)", padding: 28,
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={sectionHeadStyle}>Additional Permissions</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ADDITIONAL_PERMISSIONS.map(ap => {
                const on = allowedActions.has(ap.action);
                return (
                  <div key={ap.action} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => toggle(ap.action)} style={pill(on, false)}>
                      {ap.label}
                    </button>
                    <span style={{ fontSize: 13, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>
                      {ap.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
