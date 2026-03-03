import { C } from "../../data/constants.js";

const VARIANTS = {
  primary: { background: C.navy,    color: C.white,    border: "none" },
  outline: { background: C.white,   color: C.navy,     border: `1.5px solid ${C.navy}` },
  ghost:   { background: "transparent", color: C.grayText, border: `1.5px solid ${C.grayLine}` },
  danger:  { background: C.red,     color: C.white,    border: "none" },
  success: { background: C.success, color: C.white,    border: "none" },
  amber:   { background: "#F59E0B", color: C.white,    border: "none" },
};

export default function Btn({ children, variant = "primary", onClick, disabled, style, size = "md" }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const padding = size === "sm" ? "6px 14px" : "10px 20px";
  const fontSize = size === "sm" ? 13 : 14;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...v,
        padding,
        fontSize,
        fontWeight: 700,
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontFamily: "Inter, sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
