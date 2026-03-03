import { ShieldOff } from "lucide-react";
import { C } from "../../data/constants.js";

export default function AccessDenied({ message = "You don't have permission to view this page." }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", gap: 16, color: C.grayMid, padding: 40,
    }}>
      <ShieldOff size={56} />
      <p style={{ margin: 0, fontSize: 15, textAlign: "center", maxWidth: 320, fontFamily: "Inter, sans-serif" }}>
        {message}
      </p>
    </div>
  );
}
