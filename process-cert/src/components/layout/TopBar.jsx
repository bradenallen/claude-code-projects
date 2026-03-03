import { C } from "../../data/constants.js";
import Badge from "../ui/Badge.jsx";

export default function TopBar({ title, auth }) {
  return (
    <div style={{
      height: 56, background: C.white,
      borderBottom: `1px solid ${C.grayLine}`,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px", flexShrink: 0,
    }}>
      <h1 style={{
        margin: 0, fontSize: 17, fontWeight: 700,
        color: C.dark, fontFamily: "Poppins, sans-serif",
      }}>
        {title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: C.grayText, fontFamily: "Inter, sans-serif" }}>
          {auth.user?.displayName}
        </span>
        <Badge type="role" value={auth.user?.role} />
      </div>
    </div>
  );
}
