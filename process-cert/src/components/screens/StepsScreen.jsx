import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { C } from "../../data/constants.js";
import { ACTIONS } from "../../data/permissions.js";
import { iStyle, taStyle, thStyle, tdStyle, fmtDate } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Modal from "../ui/Modal.jsx";
import AccessDenied from "../ui/AccessDenied.jsx";

const EMPTY = { title: "", description: "", completedWhen: "", photos: [] };

function StepModal({ step, onSave, onClose, auth }) {
  const [form, setForm] = useState({ ...EMPTY, ...step });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handlePhotos(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setForm(f => ({ ...f, photos: [...f.photos, { data: ev.target.result, name: file.name }] }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(idx) {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    if (!form.title.trim()) return;
    onSave(form);
  }

  return (
    <Modal title={step?.id ? "Edit Step" : "Create Step"} onClose={onClose} width={700}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Title *
          </label>
          <input style={iStyle} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Step title" />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Description
          </label>
          <textarea style={taStyle} rows={5} value={form.description}
            onChange={e => set("description", e.target.value)} placeholder="Detailed instructions for this step..." />
        </div>

        {/* Completed When */}
        <div style={{ background: C.bluePale, borderLeft: `4px solid ${C.blue}`, borderRadius: 8, padding: "16px 18px" }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif" }}>
            Completed When
          </label>
          <textarea style={{ ...taStyle, background: "transparent", border: `1.5px solid ${C.blue}33` }}
            rows={3} value={form.completedWhen}
            onChange={e => set("completedWhen", e.target.value)}
            placeholder="Describe the specific, verifiable condition that indicates this step is complete..." />
        </div>

        {/* Photo upload */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Reference Photos
          </label>
          <input type="file" accept="image/*" multiple onChange={handlePhotos}
            style={{ fontSize: 13, fontFamily: "Inter, sans-serif", color: C.grayText }} />

          {form.photos.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {form.photos.map((p, i) => (
                <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                  <img src={p.data} alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: `1px solid ${C.grayLine}` }} />
                  <button onClick={() => removePhoto(i)} style={{
                    position: "absolute", top: -6, right: -6,
                    background: C.red, color: C.white, border: "none",
                    borderRadius: "50%", width: 18, height: 18, cursor: "pointer",
                    fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={!form.title.trim()}>Save Step</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function StepsScreen({ auth, steps, saveSteps, toast }) {
  const [search, setSearch]         = useState("");
  const [editStep, setEditStep]     = useState(null);  // null=closed, {}=new, step=edit
  const [deleteId, setDeleteId]     = useState(null);

  if (!auth.can(ACTIONS.VIEW_STEPS)) return <AccessDenied />;

  const canEdit = auth.can(ACTIONS.EDIT_STEP) || auth.can(ACTIONS.CREATE_STEP);

  const filtered = steps.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(form) {
    if (form.id) {
      // Edit existing
      const updated = steps.map(s => s.id === form.id ? { ...form, updatedAt: new Date().toISOString() } : s);
      saveSteps(updated);
      toast.add("Step updated.");
    } else {
      // Create new
      const newStep = {
        ...form,
        id: "s" + Date.now(),
        createdBy: auth.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveSteps([...steps, newStep]);
      toast.add("Step created.");
    }
    setEditStep(null);
  }

  function handleDelete(id) {
    saveSteps(steps.filter(s => s.id !== id));
    toast.add("Step deleted.", "info");
    setDeleteId(null);
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.grayMid }} />
          <input
            style={{ ...iStyle, width: 260, paddingLeft: 32 }}
            placeholder="Search steps…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        {auth.can(ACTIONS.CREATE_STEP) && (
          <Btn onClick={() => setEditStep({})}>
            <Plus size={16} /> Add Step
          </Btn>
        )}
      </div>

      {/* Table */}
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.navyDark }}>
              <th style={{ ...thStyle, width: 40 }}>#</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Description</th>
              <th style={{ ...thStyle, width: 70 }}>Photos</th>
              <th style={thStyle}>Created By</th>
              <th style={thStyle}>Updated</th>
              {canEdit && <th style={{ ...thStyle, width: 100 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.grayMid }}>
                  No steps found.
                </td>
              </tr>
            )}
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${C.grayLine}` }}>
                <td style={{ ...tdStyle, color: C.grayMid, textAlign: "center" }}>{i + 1}</td>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.dark, minWidth: 160 }}>{s.title}</td>
                <td style={{ ...tdStyle, maxWidth: 280 }}>
                  <span title={s.description}>
                    {s.description?.length > 80 ? s.description.slice(0, 80) + "…" : s.description || "—"}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>{s.photos?.length || 0}</td>
                <td style={tdStyle}>{s.createdBy}</td>
                <td style={tdStyle}>{fmtDate(s.updatedAt)}</td>
                {canEdit && (
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {auth.can(ACTIONS.EDIT_STEP) && (
                        <button onClick={() => setEditStep(s)} title="Edit"
                          style={{ background: C.blueLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.navy }}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {auth.can(ACTIONS.DELETE_STEP) && (
                        <button onClick={() => setDeleteId(s.id)} title="Delete"
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

      {/* Edit/Create Modal */}
      {editStep !== null && (
        <StepModal
          step={editStep}
          onSave={handleSave}
          onClose={() => setEditStep(null)}
          auth={auth}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Step" onClose={() => setDeleteId(null)} width={420}>
          <p style={{ color: C.grayText, fontSize: 14, fontFamily: "Inter, sans-serif", marginTop: 0 }}>
            Are you sure you want to delete this step? This cannot be undone.
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
