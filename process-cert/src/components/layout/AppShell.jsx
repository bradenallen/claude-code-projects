import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";
import { C } from "../../data/constants.js";

export default function AppShell({ screens, activeScreen, setScreen, auth, title, children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar screens={screens} activeScreen={activeScreen} setScreen={setScreen} auth={auth} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title={title} auth={auth} />
        <main style={{ flex: 1, overflowY: "auto", background: C.grayBg, padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
