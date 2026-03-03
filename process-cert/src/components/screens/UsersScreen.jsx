import { useState } from "react";
import { Plus, Edit2, UserX, UserCheck } from "lucide-react";
import { C } from "../../data/constants.js";
import { ACTIONS } from "../../data/permissions.js";
import { iStyle, thStyle, tdStyle, fmtDate } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import AccessDenied from "../ui/AccessDenied.jsx";

const ROLES = ["admin", "engineer", "operator", "viewer"];
const EMPTY_USER = { username: "", password: "", displayName: "", email: "", role: "operator", active: true };

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_USER, ...user });
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSave() {
    if (!form.username.trim() || !form.displayName.trim()) return;
    onSave(form);
  }

  return (
    <Modal title={form.id ? "Edit User" : "Create User"} onClose={onClose} width={480}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Display Name *
          </label>
          <input style={iStyle} value={form.displayName} onChange={e => set("displayName", e.target.value)} placeholder="Full name" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Username *
          </label>
          <input style={iStyle} value={form.username} onChange={e => set("username", e.target.value)} placeholder="username" autoComplete="off" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Password
          </label>
          <input style={iStyle} value={form.password} onChange={e => set("password", e.target.value)} placeholder="Password (stored in plaintext for demo)" autoComplete="new-password" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Email
          </label>
          <input type="email" style={iStyle} value={form.email} onChange={e => set("email", e.target.value)} placeholder="user@company.com" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
            Role
          </label>
          <select style={iStyle} value={form.role} onChange={e => set("role", e.target.value)}>
            {ROLES.map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={!form.username.trim() || !form.displayName.trim()}>Save User</Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersScreen({ auth, users, saveUsers, toast }) {
  const [editUser, setEditUser] = useState(null);

  if (!auth.can(ACTIONS.VIEW_USERS)) return <AccessDenied />;

  function handleSave(form) {
    const now = new Date().toISOString();
    if (form.id) {
      saveUsers(users.map(u => u.id === form.id ? { ...form, updatedAt: now } : u));
      toast.add("User updated.");
    } else {
      const newUser = {
        ...form,
        id: "u" + Date.now(),
        lastLogin: null,
        createdAt: now,
      };
      saveUsers([...users, newUser]);
      toast.add("User created.");
    }
    setEditUser(null);
  }

  function toggleActive(user) {
    if (user.id === auth.user.id) {
      toast.add("You cannot deactivate your own account.", "error");
      return;
    }
    const updated = users.map(u =>
      u.id === user.id ? { ...u, active: !u.active } : u
    );
    saveUsers(updated);
    toast.add(user.active ? "User deactivated." : "User reactivated.", "info");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        {auth.can(ACTIONS.CREATE_USER) && (
          <Btn onClick={() => setEditUser({})}>
            <Plus size={16} /> New User
          </Btn>
        )}
      </div>

      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.navyDark }}>
              <th style={thStyle}>Display Name</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Last Login</th>
              <th style={{ ...thStyle, width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.grayMid }}>
                  No users.
                </td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.grayLine}`, opacity: u.active ? 1 : 0.6 }}>
                <td style={{ ...tdStyle, fontWeight: 600, color: C.dark }}>{u.displayName}</td>
                <td style={tdStyle}>{u.username}</td>
                <td style={tdStyle}>{u.email || "—"}</td>
                <td style={tdStyle}><Badge type="role" value={u.role} /></td>
                <td style={tdStyle}><Badge type="status" value={u.active ? "active" : "inactive"} /></td>
                <td style={tdStyle}>{fmtDate(u.lastLogin)}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {auth.can(ACTIONS.EDIT_USER) && (
                      <button onClick={() => setEditUser(u)} title="Edit"
                        style={{ background: C.blueLight, border: "none", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: C.navy }}>
                        <Edit2 size={14} />
                      </button>
                    )}
                    {auth.can(ACTIONS.DEACTIVATE_USER) && (
                      <button
                        onClick={() => toggleActive(u)}
                        title={u.active ? "Deactivate" : "Reactivate"}
                        disabled={u.id === auth.user.id}
                        style={{
                          background: u.active ? C.redLight : C.successBg,
                          border: "none", borderRadius: 6, padding: "5px 8px",
                          cursor: u.id === auth.user.id ? "not-allowed" : "pointer",
                          color: u.active ? C.red : C.success,
                          opacity: u.id === auth.user.id ? 0.4 : 1,
                        }}
                      >
                        {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {editUser !== null && (
        <UserModal
          user={editUser}
          onSave={handleSave}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
}
