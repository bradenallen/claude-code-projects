import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { C } from "../../data/constants.js";
import { ACTIONS } from "../../data/permissions.js";
import { thStyle, tdStyle, fmtDate } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import AccessDenied from "../ui/AccessDenied.jsx";
import ProcessBuilderScreen from "./ProcessBuilderScreen.jsx";

const EMPTY_PROCESS = {
  title: "", description: "", componentName: "", stepIds: [], status: "draft",
};

export default function ProcessesScreen({ auth, processes, steps, saveProcesses, toast }) {
  const [builderProcess, setBuilderProcess] = useState(null);
  const [deleteId, setDeleteId]             = useState(null);

  if (!auth.can(ACTIONS.VIEW_PROCESSES)) return <AccessDenied />;

  function openCreate() {
    setBuilderProcess({ ...EMPTY_PROCESS });
  }

  function openEdit(p) {
    setBuilderProcess({ ...p });
  }

  function handleSave(draft) {
    const now = new Date().toISOString();
    if (draft.id) {
      const updated = processes.map(p =>
        p.id === draft.id ? { ...draft, updatedAt: now } : p
      );
      saveProcesses(updated);
      toast.add(`Process ${draft.status === "published" ? "published" : "saved"}.`);
    } else {
      const newProc = {
        ...draft,
        id: "p" + Date.now(),
        createdBy: auth.user.id,
        createdAt: now,
        updatedAt: now,
      };
      saveProcesses([...processes, newProc]);
      toast.add(`Process ${draft.status === "published" ? "published" : "saved as draft"}.`);
    }
    setBuilderProcess(null);
  }

  function handleDelete(id) {
    saveProcesses(processes.filter(p => p.id !== id));
    toast.add("Process deleted.", "info");
    setDeleteId(null);
  }

  const canCreate = auth.can(ACTIONS.CREATE_PROCESS);
  const canEdit   = auth.can(ACTIONS.EDIT_PROCESS);
  const canDelete = auth.can(ACTIONS.DELETE_PROCESS);

  return (
    <>
      {/* Builder overlay */}
      {builderProcess !== null && (
        <ProcessBuilderScreen
          process={builderProcess}
          steps={steps}
          onSave={handleSave}
          onCancel={() => setBuilderProcess(null)}
          auth={auth}
        />
      )}

      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          {canCreate && (
            <Btn onClick={openCreate}>
              <Plus size={16} /> New Process
            </Btn>
          )}
        </div>

        {/* Table */}
        <Card style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.navyDark }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Component</th>
                <th style={{ ...thStyle, width: 60 }}>Steps</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created By</th>
                <th style={thStyle}>Updated</th>
                {(canEdit || canDelete) && <th style={{ ...thStyle, width: 100 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {processes.length === 0 && (
                <tr>
                  <td colSpan={(canEdit || canDelete) ? 7 : 6} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.grayMid }}>
                    No processes yet.
                  </td>
                </tr>
              )}
              {processes.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.grayLine}` }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.dark }}>{p.title}</td>
                  <td style={tdStyle}>{p.componentName || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{p.stepIds?.length || 0}</td>
                  <td style={tdStyle}><Badge type="status" value={p.status} /></td>
                  <td style={tdStyle}>{p.createdBy}</td>
                  <td style={tdStyle}>{fmtDate(p.updatedAt)}</td>
                  {(canEdit || canDelete) && (
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {canEdit && (
                          <button onClick={() => openEdit(p)} title="Edit"
                            style={{ background: C.blueLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.navy }}>
                            <Edit2 size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteId(p.id)} title="Delete"
                            style={{ background: C.redLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.red }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Process" onClose={() => setDeleteId(null)} width={420}>
          <p style={{ color: C.grayText, fontSize: 14, fontFamily: "Inter, sans-serif", marginTop: 0 }}>
            Are you sure you want to delete this process? This cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
