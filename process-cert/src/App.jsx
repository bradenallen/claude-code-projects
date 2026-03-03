import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, GitBranch, Calendar, Users, Shield,
} from "lucide-react";

import { C, SK } from "./data/constants.js";
import { ACTIONS } from "./data/permissions.js";
import { load, persist } from "./hooks/useStorage.js";
import { useAuth } from "./hooks/useAuth.js";
import { useToast } from "./hooks/useToast.js";

import AppShell from "./components/layout/AppShell.jsx";
import Toast from "./components/ui/Toast.jsx";
import LoginScreen from "./components/screens/LoginScreen.jsx";
import DashboardScreen from "./components/screens/DashboardScreen.jsx";
import StepsScreen from "./components/screens/StepsScreen.jsx";
import ProcessesScreen from "./components/screens/ProcessesScreen.jsx";
import AssignmentsScreen from "./components/screens/AssignmentsScreen.jsx";
import ExecutionScreen from "./components/screens/ExecutionScreen.jsx";
import UsersScreen from "./components/screens/UsersScreen.jsx";
import RolesScreen from "./components/screens/RolesScreen.jsx";

// ─── Global Styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

      * { box-sizing: border-box; }

      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: ${C.blue} !important;
        box-shadow: 0 0 0 3px ${C.blueLight};
      }

      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${C.grayLine}; border-radius: 3px; }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

// ─── Screen registry ──────────────────────────────────────────────────────────
const SCREENS = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard, requiredAction: ACTIONS.VIEW_DASHBOARD },
  { id: "steps",       label: "Steps",       icon: ClipboardList,   requiredAction: ACTIONS.VIEW_STEPS },
  { id: "processes",   label: "Processes",   icon: GitBranch,       requiredAction: ACTIONS.VIEW_PROCESSES },
  { id: "assignments", label: "Assignments", icon: Calendar,        requiredAction: ACTIONS.VIEW_ASSIGNMENTS },
  { id: "users",       label: "Users",       icon: Users,           requiredAction: ACTIONS.VIEW_USERS },
  { id: "roles",       label: "Roles",       icon: Shield,          requiredAction: ACTIONS.VIEW_ROLES },
];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const auth   = useAuth();
  const toast  = useToast();
  const [screen, setScreen] = useState("dashboard");

  // Entity state
  const [steps,       setSteps]       = useState(() => load(SK.STEPS,       []));
  const [processes,   setProcesses]   = useState(() => load(SK.PROCESSES,   []));
  const [assignments, setAssignments] = useState(() => load(SK.ASSIGNMENTS, []));
  const [executions,  setExecutions]  = useState(() => load(SK.EXECUTIONS,  []));
  const [users,       setUsers]       = useState(() => load(SK.USERS,       []));
  const [roles,       setRoles]       = useState(() => load(SK.ROLES,       []));

  // Save helpers
  function saveSteps(s)       { setSteps(s);       persist(SK.STEPS,       s); }
  function saveProcesses(s)   { setProcesses(s);   persist(SK.PROCESSES,   s); }
  function saveAssignments(s) { setAssignments(s); persist(SK.ASSIGNMENTS, s); }
  function saveExecutions(s)  { setExecutions(s);  persist(SK.EXECUTIONS,  s); }
  function saveUsers(s)       { setUsers(s);       persist(SK.USERS,       s); }
  function saveRoles(s)       { setRoles(s);       persist(SK.ROLES,       s); }

  // Active screen id
  const activeId = typeof screen === "string" ? screen : screen?.screen;
  const screenTitle = SCREENS.find(s => s.id === activeId)?.label || "";

  // ─── Login ───────────────────────────────────────────────────────────────
  if (!auth.user) {
    return (
      <>
        <GlobalStyles />
        <LoginScreen auth={auth} />
        <Toast toasts={toast.toasts} remove={toast.remove} />
      </>
    );
  }

  // ─── Execution (full-page takeover) ──────────────────────────────────────
  if (screen?.screen === "execution") {
    const exec = executions.find(e => e.id === screen.executionId);
    return (
      <>
        <GlobalStyles />
        <ExecutionScreen
          execution={exec}
          processes={processes}
          steps={steps}
          auth={auth}
          executions={executions}
          saveExecutions={saveExecutions}
          onExit={() => setScreen("dashboard")}
          toast={toast}
        />
        <Toast toasts={toast.toasts} remove={toast.remove} />
      </>
    );
  }

  // ─── Main App Shell ───────────────────────────────────────────────────────
  function renderScreen() {
    switch (activeId) {
      case "dashboard":
        return (
          <DashboardScreen
            auth={auth} steps={steps} processes={processes}
            assignments={assignments} executions={executions}
            setScreen={setScreen} saveExecutions={saveExecutions}
          />
        );
      case "steps":
        return (
          <StepsScreen
            auth={auth} steps={steps} saveSteps={saveSteps} toast={toast}
          />
        );
      case "processes":
        return (
          <ProcessesScreen
            auth={auth} processes={processes} steps={steps}
            saveProcesses={saveProcesses} toast={toast}
          />
        );
      case "assignments":
        return (
          <AssignmentsScreen
            auth={auth} assignments={assignments} processes={processes}
            users={users} saveAssignments={saveAssignments} toast={toast}
          />
        );
      case "users":
        return (
          <UsersScreen
            auth={auth} users={users} saveUsers={saveUsers} toast={toast} roles={roles}
          />
        );
      case "roles":
        return (
          <RolesScreen
            auth={auth} roles={roles} saveRoles={saveRoles} toast={toast}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <GlobalStyles />
      <AppShell
        screens={SCREENS} activeScreen={screen}
        setScreen={setScreen} auth={auth} title={screenTitle}
      >
        {renderScreen()}
      </AppShell>
      <Toast toasts={toast.toasts} remove={toast.remove} />
    </>
  );
}
