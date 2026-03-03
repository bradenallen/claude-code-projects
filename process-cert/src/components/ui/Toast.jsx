import { CheckCircle, AlertCircle, X } from "lucide-react";
import { C } from "../../data/constants.js";

const TYPE_STYLES = {
  success: { borderColor: C.success,  bg: C.successBg, Icon: CheckCircle, iconColor: C.success },
  error:   { borderColor: C.red,      bg: C.redLight,  Icon: AlertCircle,  iconColor: C.red },
  info:    { borderColor: C.blue,     bg: C.blueLight, Icon: AlertCircle,  iconColor: C.blue },
};

function ToastItem({ toast, remove }) {
  const { borderColor, bg, Icon, iconColor } = TYPE_STYLES[toast.type] || TYPE_STYLES.success;
  return (
    <div style={{
      background: C.white,
      borderLeft: `5px solid ${borderColor}`,
      borderRadius: 8,
      padding: "14px 16px",
      boxShadow: "0 4px 16px rgba(0,26,87,0.12)",
      display: "flex", alignItems: "center", gap: 10,
      backgroundColor: bg,
      animation: "slideUp 0.2s ease",
      minWidth: 280, maxWidth: 380,
    }}>
      <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13.5, color: C.dark, fontFamily: "Inter, sans-serif" }}>{toast.msg}</span>
      <button
        onClick={() => remove(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: C.grayMid, padding: 2 }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, remove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} remove={remove} />)}
    </div>
  );
}
