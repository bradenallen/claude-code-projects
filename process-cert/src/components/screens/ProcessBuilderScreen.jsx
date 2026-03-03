import { useState } from "react";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { C } from "../../data/constants.js";
import { iStyle, taStyle } from "../ui/styles.js";
import Btn from "../ui/Btn.jsx";
import Card from "../ui/Card.jsx";

export default function ProcessBuilderScreen({ process: initialProcess, steps, onSave, onCancel, auth }) {
  const [draft, setDraft] = useState({ ...initialProcess });
  const [stepSearch, setStepSearch] = useState("");

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  // Available steps = those not already in the draft's stepIds, matching search
  const addedIds = draft.stepIds || [];
  const available = steps.filter(s =>
    !addedIds.includes(s.id) &&
    s.title.toLowerCase().includes(stepSearch.toLowerCase())
  );

  // Steps in draft order
  const draftSteps = addedIds.map(id => steps.find(s => s.id === id)).filter(Boolean);

  function addStep(stepId) {
    set("stepIds", [...addedIds, stepId]);
  }

  function removeStep(stepId) {
    set("stepIds", addedIds.filter(id => id !== stepId));
  }

  function moveStep(idx, dir) {
    const arr = [...addedIds];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set("stepIds", arr);
  }

  function save(status) {
    onSave({ ...draft, status });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: C.white, display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{
        height: 56, background: C.navyDark,
        display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0,
      }}>
        <input
          value={draft.title || ""}
          onChange={e => set("title", e.target.value)}
          placeholder="Process title…"
          style={{
            flex: 1, background: "transparent", border: "none",
            borderBottom: "2px solid rgba(255,255,255,0.3)",
            color: C.white, fontSize: 17, fontFamily: "Poppins, sans-serif",
            fontWeight: 700, padding: "4px 0", outline: "none",
          }}
        />
        <Btn variant="ghost" onClick={onCancel}
          style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)" }}>
          Cancel
        </Btn>
        <Btn variant="ghost" onClick={() => save("draft")}
          style={{ color: "rgba(255,255,255,0.9)", borderColor: "rgba(255,255,255,0.3)" }}>
          Save Draft
        </Btn>
        <Btn variant="amber" onClick={() => save("published")}
          disabled={!draft.title?.trim() || addedIds.length === 0}>
          Publish
        </Btn>
      </div>

      {/* Main two-column area */}
      <div style={{
        height: "calc(100vh - 112px)", display: "flex",
        gap: 24, padding: 24, overflow: "hidden",
      }}>
        {/* Left panel */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          {/* Process details */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
              Process Details
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 5, fontSize: 11.5, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
                Component Name
              </label>
              <input style={iStyle} value={draft.componentName || ""}
                onChange={e => set("componentName", e.target.value)} placeholder="e.g. Widget Model X" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: 11.5, fontWeight: 600, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>
                Description
              </label>
              <textarea style={taStyle} rows={3} value={draft.description || ""}
                onChange={e => set("description", e.target.value)} placeholder="Describe this process…" />
            </div>
          </Card>

          {/* Available steps */}
          <Card style={{ padding: 20, flex: 1 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
              Available Steps
            </h3>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.grayMid }} />
              <input style={{ ...iStyle, paddingLeft: 30 }} placeholder="Search steps…"
                value={stepSearch} onChange={e => setStepSearch(e.target.value)} />
            </div>
            {available.length === 0 && (
              <div style={{ color: C.grayMid, fontSize: 13, fontFamily: "Inter, sans-serif", padding: "8px 0" }}>
                All steps added or no matches.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {available.map(s => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 8, background: C.grayBg,
                  border: `1px solid ${C.grayLine}`,
                }}>
                  <span style={{ fontSize: 13, color: C.dark, fontFamily: "Inter, sans-serif", flex: 1 }}>{s.title}</span>
                  <button onClick={() => addStep(s.id)} style={{
                    background: C.navy, color: C.white, border: "none", borderRadius: 6,
                    padding: "3px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                  }}>+ Add</button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel: process steps */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Card style={{ padding: 20, minHeight: "100%" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
              Process Steps
            </h3>

            {draftSteps.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px 24px",
                color: C.grayMid, fontFamily: "Inter, sans-serif", fontSize: 14,
                border: `2px dashed ${C.grayLine}`, borderRadius: 10,
              }}>
                No steps added yet. Select steps from the left panel.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draftSteps.map((s, i) => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 10,
                    border: `1px solid ${C.grayLine}`, background: C.white,
                    boxShadow: "0 1px 4px rgba(0,47,167,0.04)",
                  }}>
                    {/* Step number */}
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: C.navy, color: C.white,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "Inter, sans-serif",
                    }}>
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: C.dark, fontFamily: "Inter, sans-serif" }}>
                      {s.title}
                    </div>

                    {/* Reorder + remove */}
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => moveStep(i, -1)} disabled={i === 0}
                        style={{ background: C.grayBg, border: `1px solid ${C.grayLine}`, borderRadius: 5, padding: "3px 7px", cursor: i === 0 ? "not-allowed" : "pointer", color: C.grayText, opacity: i === 0 ? 0.4 : 1 }}>
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => moveStep(i, 1)} disabled={i === draftSteps.length - 1}
                        style={{ background: C.grayBg, border: `1px solid ${C.grayLine}`, borderRadius: 5, padding: "3px 7px", cursor: i === draftSteps.length - 1 ? "not-allowed" : "pointer", color: C.grayText, opacity: i === draftSteps.length - 1 ? 0.4 : 1 }}>
                        <ChevronDown size={13} />
                      </button>
                      <button onClick={() => removeStep(s.id)}
                        style={{ background: C.redLight, border: "none", borderRadius: 5, padding: "3px 7px", cursor: "pointer", color: C.red }}>
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Footer bar */}
      <div style={{
        height: 56, background: C.white, borderTop: `1px solid ${C.grayLine}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, color: C.grayMid, fontFamily: "Inter, sans-serif" }}>
          {addedIds.length} step{addedIds.length !== 1 ? "s" : ""} in this process
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="outline" onClick={() => save("draft")}>Save Draft</Btn>
          <Btn variant="amber" onClick={() => save("published")}
            disabled={!draft.title?.trim() || addedIds.length === 0}>
            Publish
          </Btn>
        </div>
      </div>
    </div>
  );
}
