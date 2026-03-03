import { C } from "../../data/constants.js";

export const iStyle = {
  width: "100%",
  background: C.white,
  border: `1.5px solid ${C.grayLine}`,
  borderRadius: 8,
  padding: "10px 14px",
  color: C.dark,
  fontSize: 14,
  display: "block",
  fontFamily: "Inter, sans-serif",
};

export const taStyle = { ...iStyle, resize: "vertical", lineHeight: 1.6 };

export const thStyle = {
  textAlign: "left",
  padding: "14px 18px",
  fontSize: 11.5,
  color: "rgba(255,255,255,0.65)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export const tdStyle = {
  padding: "14px 18px",
  fontSize: 13.5,
  color: C.grayText,
  verticalAlign: "middle",
};

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
