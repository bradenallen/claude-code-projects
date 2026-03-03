import { useState } from "react";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { C } from "../../data/constants.js";
import { ACTIONS, SCREEN_FLAGS } from "../../data/permissions.js";
import { thStyle, tdStyle } from "../ui/styles.js";
import Card from "../ui/Card.jsx";
import Btn from "../ui/Btn.jsx";
import Modal from "../ui/Modal.jsx";
import AccessDenied from "../ui/AccessDenied.jsx";
import RoleBuilderScreen from "./RoleBuilderScreen.jsx";

function screenSummary(role) {
  const screens = SCREEN_FLAGS.filter(sf => (role.allowedActions || []).includes(sf.action));
  if (screens.length === 0) return <span style={{ color: C.grayMid, fontSize: 12 }}>None</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {screens.map(sf => (
        <span key={sf.id} style={{
          background: C.blueLight, color: C.navy,
          borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600,
          fontFamily: "Inter, sans-serif",
        }}>
          {sf.label}
        </span>
      ))}
    </div>
  );
}

export default function RolesScreen({ auth, roles, saveRoles, toast }) {
  const [builderRole, setBuilderRole] = useState(null); // null = hidden, object = editing
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!auth.can(ACTIONS.VIEW_ROLES)) return <AccessDenied />;

  function openCreate() {
    setBuilderRole({ id: null, name: "New Role", isBuiltIn: false, allowedActions: [] });
  }

  function openEdit(role) {
    setBuilderRole(role);
  }

  function handleBuilderSave({ name, allowedActions }) {
    const now = new Date().toISOString();
    if (builderRole.id) {
      // Edit existing
      const updated = roles.map(r =>
        r.id === builderRole.id
          ? { ...r, name, allowedActions, updatedAt: now }
          : r
      );
      saveRoles(updated);
      toast.add(`Role "${name}" updated.`);
    } else {
      // Create new
      const newRole = {
        id: "role_" + Date.now(),
        name,
        isBuiltIn: false,
        allowedActions,
        createdBy: auth.user?.id || "unknown",
        createdAt: now,
        updatedAt: now,
      };
      saveRoles([...roles, newRole]);
      toast.add(`Role "${name}" created.`);
    }
    setBuilderRole(null);
  }

  function handleDelete() {
    if (!deleteTarget || deleteTarget.isBuiltIn) return;
    saveRoles(roles.filter(r => r.id !== deleteTarget.id));
    toast.add(`Role "${deleteTarget.name}" deleted.`, "info");
    setDeleteTarget(null);
  }

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          {auth.can(ACTIONS.CREATE_ROLE) && (
            <Btn onClick={openCreate}>
              <Plus size={16} /> New Role
            </Btn>
          )}
        </div>

        <Card style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.navyDark }}>
                <th style={thStyle}>Role Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Screen Access</th>
                <th style={thStyle}>Permissions</th>
                <th style={{ ...thStyle, width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", padding: 32, color: C.grayMid }}>
                    No roles defined.
                  </td>
                </tr>
              )}
              {roles.map(role => (
                <tr key={role.id} style={{ borderBottom: `1px solid ${C.grayLine}` }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.dark }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Shield size={14} color={role.isBuiltIn ? C.navy : "#7C3AED"} />
                      {role.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      background: role.isBuiltIn ? C.blueLight : "#F3E8FF",
                      color: role.isBuiltIn ? C.navy : "#7C3AED",
                      borderRadius: 20, padding: "3px 10px",
                      fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif",
                    }}>
                      {role.isBuiltIn ? "Built-in" : "Custom"}
                    </span>
                  </td>
                  <td style={tdStyle}>{screenSummary(role)}</td>
                  <td style={{ ...tdStyle, color: C.grayText }}>
                    {(role.allowedActions || []).length} permissions
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {auth.can(ACTIONS.EDIT_ROLE) && (
                        <button onClick={() => openEdit(role)} title="Edit"
                          style={{
                            background: C.blueLight, border: "none", borderRadius: 6,
                            padding: "5px 8px", cursor: "pointer", color: C.navy,
                          }}>
                          <Edit2 size={14} />
                        </button>
                      )}
                      {auth.can(ACTIONS.DELETE_ROLE) && !role.isBuiltIn && (
                        <button onClick={() => setDeleteTarget(role)} title="Delete"
                          style={{
                            background: C.redLight, border: "none", borderRadius: 6,
                            padding: "5px 8px", cursor: "pointer", color: C.red,
                          }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Role Builder overlay */}
      {builderRole !== null && (
        <RoleBuilderScreen
          role={builderRole}
          onSave={handleBuilderSave}
          onCancel={() => setBuilderRole(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <Modal title="Delete Role" onClose={() => setDeleteTarget(null)} width={420}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: C.grayText, fontFamily: "Inter, sans-serif" }}>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            Users assigned this role will need to be reassigned.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
            <Btn onClick={handleDelete} style={{ background: C.red, borderColor: C.red }}>Delete Role</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}
