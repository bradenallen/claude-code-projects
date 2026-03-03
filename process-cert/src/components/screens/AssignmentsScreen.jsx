import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { C } from "../../data/constants.js";
import { ACTIONS } from "../../data/permissions.js";
import { iStyle, thStyle, tdStyle, fmtDate } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import AccessDenied from "../ui/AccessDenied.jsx";

const EMPTY = { processId: "", operatorId: "", quantity: 1, dueDate: "", active: true };

function AssignmentModal({ assignment, processes, operators, onSave, onClose, auth }) {
  const [form, setForm] = useState({ ...EMPTY, ...assignment });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSave() {
    if (!form.processId || !form.operatorId) return;
    onSave(form);
  }

  const publishedProcesses = processes.filter(p => p.status === "published");

  return (
    <Modal title={form.id ? "Edit Assignment" : "Create Assignment"} onClose={onClose} width={500}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Process *
          </label>
          <select style={iStyle} value={form.processId} onChange={e => set("processId", e.target.value)}>
            <option value="">Select process…</option>
            {publishedProcesses.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Operator *
          </label>
          <select style={iStyle} value={form.operatorId} onChange={e => set("operatorId", e.target.value)}>
            <option value="">Select operator…</option>
            {operators.map(u => (
              <option key={u.id} value={u.id}>{u.displayName}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Quantity
          </label>
          <input type="number" min={1} style={iStyle} value={form.quantity}
            onChange={e => set("quantity", parseInt(e.target.value) || 1)} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Due Date
          </label>
          <input type="date" style={iStyle} value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={!form.processId || !form.operatorId}>Save Assignment</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function AssignmentsScreen({ auth, assignments, processes, users, saveAssignments, toast }) {
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  if (!auth.can(ACTIONS.VIEW_ASSIGNMENTS)) return <AccessDenied />;

  const operators = users.filter(u => u.role === "operator" && u.active);

  // Operators see only their own assignments
  const visible = auth.hasRole("operator")
    ? assignments.filter(a => a.operatorId === auth.user.id)
    : assignments;

  const canCreate = auth.can(ACTIONS.CREATE_ASSIGNMENT);
  const canEdit   = auth.can(ACTIONS.EDIT_ASSIGNMENT);
  const canDelete = auth.can(ACTIONS.DELETE_ASSIGNMENT);

  function handleSave(form) {
    const now = new Date().toISOString();
    if (form.id) {
      saveAssignments(assignments.map(a => a.id === form.id ? { ...form, updatedAt: now } : a));
      toast.add("Assignment updated.");
    } else {
      const newA = {
        ...form,
        id: "a" + Date.now(),
        assignedBy: auth.user.id,
        assignedAt: now,
      };
      saveAssignments([...assignments, newA]);
      toast.add("Assignment created.");
    }
    setEditItem(null);
  }

  function handleDelete(id) {
    saveAssignments(assignments.filter(a => a.id !== id));
    toast.add("Assignment deleted.", "info");
    setDeleteId(null);
  }

  function getProcess(id) { return processes.find(p => p.id === id); }
  function getOperator(id) { return users.find(u => u.id === id); }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        {canCreate && (
          <Btn onClick={() => setEditItem({})}>
            <Plus size={16} /> New Assignment
          </Btn>
        )}
      </div>

      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.navyDark }}>
              <th style={thStyle}>Operator</th>
              <th style={thStyle}>Process</th>
              <th style={{ ...thStyle, width: 60 }}>Qty</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Assigned By</th>
              <th style={thStyle}>Date</th>
              {(canEdit || canDelete) && <th style={{ ...thStyle, width: 100 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={(canEdit || canDelete) ? 8 : 7} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.grayMid }}>
                  No assignments.
                </td>
              </tr>
            )}
            {visible.map(a => {
              const proc = getProcess(a.processId);
              const op   = getOperator(a.operatorId);
              const by   = getOperator(a.assignedBy);
              return (
                <tr key={a.id} style={{ borderBottom: `1px solid ${C.grayLine}` }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.dark }}>{op?.displayName || "—"}</td>
                  <td style={tdStyle}>{proc?.title || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{a.quantity}</td>
                  <td style={tdStyle}>{fmtDate(a.dueDate)}</td>
                  <td style={tdStyle}><Badge type="status" value={a.active ? "active" : "inactive"} /></td>
                  <td style={tdStyle}>{by?.displayName || "—"}</td>
                  <td style={tdStyle}>{fmtDate(a.assignedAt)}</td>
                  {(canEdit || canDelete) && (
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {canEdit && (
                          <button onClick={() => setEditItem(a)} title="Edit"
                            style={{ background: C.blueLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.navy }}>
                            <Edit2 size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteId(a.id)} title="Delete"
                            style={{ background: C.redLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.red }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {editItem !== null && (
        <AssignmentModal
          assignment={editItem}
          processes={processes}
          operators={operators}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
          auth={auth}
        />
      )}

      {deleteId && (
        <Modal title="Delete Assignment" onClose={() => setDeleteId(null)} width={420}>
          <p style={{ color: C.grayText, fontSize: 14, fontFamily: "Inter, sans-serif", marginTop: 0 }}>
            Delete this assignment? This cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
