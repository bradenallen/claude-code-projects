import { C } from "../../data/constants.js";
import { fmtDate } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Badge from "../ui/Badge.jsx";

// ─── Operator View ────────────────────────────────────────────────────────────
function OperatorDashboard({ auth, assignments, processes, executions, setScreen, saveExecutions }) {
  const myAssignments = assignments.filter(a => a.operatorId === auth.user.id && a.active);

  function countCompletions(assignmentId) {
    return executions.filter(e => e.assignmentId === assignmentId && e.status === "completed").length;
  }

  function getInProgress(assignmentId) {
    return executions.find(e => e.assignmentId === assignmentId && e.status === "in_progress");
  }

  function startExecution(assignment) {
    const newExec = {
      id: "exec_" + Date.now(),
      assignmentId: assignment.id,
      processId: assignment.processId,
      operatorId: auth.user.id,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: "in_progress",
      currentStepIndex: 0,
      stepCompletions: [],
    };
    const updated = [...executions, newExec];
    saveExecutions(updated);
    setScreen({ screen: "execution", executionId: newExec.id });
  }

  function resumeExecution(exec) {
    setScreen({ screen: "execution", executionId: exec.id });
  }

  if (myAssignments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: 16 }}>No active assignments. Check back later.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
        Your Work Queue
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {myAssignments.map(a => {
          const process = processes.find(p => p.id === a.processId);
          const completedCount = countCompletions(a.id);
          const inProgress = getInProgress(a.id);
          const isDone = completedCount >= a.quantity;
          const progressPct = Math.min((completedCount / a.quantity) * 100, 100);

          return (
            <Card key={a.id} style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif", marginBottom: 4 }}>
                    {process?.title || "Unknown Process"}
                  </div>
                  <div style={{ fontSize: 13, color: C.grayMid, fontFamily: "Inter, sans-serif", marginBottom: 10 }}>
                    {process?.componentName} · Due {fmtDate(a.dueDate)}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>Completions</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? C.success : C.navy, fontFamily: "Inter, sans-serif" }}>
                        {completedCount} / {a.quantity}
                      </span>
                    </div>
                    <div style={{ height: 6, background: C.grayLine, borderRadius: 3 }}>
                      <div style={{
                        height: "100%", width: `${progressPct}%`,
                        background: isDone ? C.success : C.blue,
                        borderRadius: 3, transition: "width 0.4s",
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <span style={{
                      background: C.successBg, color: C.success,
                      borderRadius: 20, padding: "6px 14px",
                      fontSize: 13, fontWeight: 700, fontFamily: "Inter, sans-serif",
                    }}>
                      Complete ✓
                    </span>
                  ) : inProgress ? (
                    <Btn variant="outline" onClick={() => resumeExecution(inProgress)}>
                      Resume →
                    </Btn>
                  ) : (
                    <Btn onClick={() => startExecution(a)}>
                      Start
                    </Btn>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Engineer / Admin / Viewer View ──────────────────────────────────────────
function EngineerDashboard({ steps, processes, assignments, executions }) {
  const today = new Date().toDateString();
  const todayAssignments = assignments.filter(a => {
    const d = a.assignedAt ? new Date(a.assignedAt).toDateString() : null;
    return d === today;
  });

  const recentExecs = [...executions].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 5);

  const statCards = [
    { label: "Total Steps", value: steps.length, color: C.navy },
    { label: "Published Processes", value: processes.filter(p => p.status === "published").length, color: C.success },
    { label: "Today's Assignments", value: todayAssignments.length, color: "#F59E0B" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {statCards.map(sc => (
          <Card key={sc.label} style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 13, color: C.grayMid, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
              {sc.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: sc.color, fontFamily: "Poppins, sans-serif" }}>
              {sc.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.grayLine}` }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
            Recent Activity
          </h3>
        </div>
        {recentExecs.length === 0 ? (
          <div style={{ padding: "24px", color: C.grayMid, fontSize: 14, fontFamily: "Inter, sans-serif", textAlign: "center" }}>
            No executions yet
          </div>
        ) : (
          <div>
            {recentExecs.map(e => {
              const proc = processes.find(p => p.id === e.processId);
              return (
                <div key={e.id} style={{
                  padding: "14px 24px", borderBottom: `1px solid ${C.grayLine}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.dark, fontFamily: "Inter, sans-serif" }}>
                      {proc?.title || "Unknown"}
                    </div>
                    <div style={{ fontSize: 12, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>
                      {fmtDate(e.startedAt)}
                    </div>
                  </div>
                  <Badge type="status" value={e.status} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function DashboardScreen({ auth, steps, processes, assignments, executions, setScreen, saveExecutions }) {
  if (auth.hasRole("operator")) {
    return (
      <OperatorDashboard
        auth={auth} assignments={assignments} processes={processes}
        executions={executions} setScreen={setScreen} saveExecutions={saveExecutions}
      />
    );
  }
  return (
    <EngineerDashboard
      steps={steps} processes={processes}
      assignments={assignments} executions={executions}
    />
  );
}
