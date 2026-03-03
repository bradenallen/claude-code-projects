import { C } from "../../data/constants.js";

const ROLE_STYLES = {
  admin:       { background: "#EDE9FE", color: "#5B21B6" },
  engineer:    { background: C.blueLight, color: C.navy },
  operator:    { background: "#DBEAFE", color: "#1D4ED8" },
  viewer:      { background: C.grayLine, color: C.grayText },
  super_admin: { background: "#F3E8FF", color: "#7C3AED" },
};

const STATUS_STYLES = {
  published: { background: C.successBg, color: C.success },
  draft:     { background: "#FEF3C7",   color: "#92400E" },
  active:    { background: C.successBg, color: C.success },
  inactive:  { background: C.redLight,  color: C.red },
  in_progress: { background: C.blueLight, color: C.navy },
  completed:   { background: C.successBg, color: C.success },
};

export default function Badge({ type, value, style }) {
  const styles = type === "role"
    ? (ROLE_STYLES[value] || ROLE_STYLES.viewer)
    : (STATUS_STYLES[value] || STATUS_STYLES.draft);

  const label = type === "role"
    ? (value ? value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "")
    : (value ? value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "");

  return (
    <span style={{
      ...styles,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      display: "inline-block",
      fontFamily: "Inter, sans-serif",
      ...style,
    }}>
      {label}
    </span>
  );
}
