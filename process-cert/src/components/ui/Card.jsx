import { C } from "../../data/constants.js";

export default function Card({ children, style }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.grayLine}`,
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,47,167,0.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}
