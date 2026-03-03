import { useState } from "react";
import { ArrowLeft, CheckSquare, CheckCircle, X } from "lucide-react";
import { C } from "../../data/constants.js";
import Btn from "../ui/Btn.jsx";

export default function ExecutionScreen({ execution, processes, steps, auth, executions, saveExecutions, onExit, toast }) {
  const [photoModal, setPhotoModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!execution) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "Inter, sans-serif", color: C.grayMid }}>
        Execution not found.
        <Btn variant="ghost" onClick={onExit} style={{ marginLeft: 16 }}>Exit</Btn>
      </div>
    );
  }

  const process = processes.find(p => p.id === execution.processId);
  const processSteps = (process?.stepIds || []).map(id => steps.find(s => s.id === id)).filter(Boolean);
  const totalSteps = processSteps.length;
  const currentIdx = execution.currentStepIndex;
  const currentStep = processSteps[currentIdx];
  const isLastStep = currentIdx >= totalSteps - 1;
  const progressPct = totalSteps > 0 ? (currentIdx / totalSteps) * 100 : 0;

  function updateExecution(updater) {
    const updated = executions.map(e => e.id === execution.id ? updater(e) : e);
    saveExecutions(updated);
    return updated.find(e => e.id === execution.id);
  }

  function handleNext() {
    const completion = {
      stepId: currentStep.id,
      completedAt: new Date().toISOString(),
      completedBy: auth.user.id,
    };

    if (isLastStep) {
      // Complete the execution
      updateExecution(e => ({
        ...e,
        currentStepIndex: currentIdx + 1,
        status: "completed",
        completedAt: new Date().toISOString(),
        stepCompletions: [...e.stepCompletions, completion],
      }));
      setShowSuccess(true);
    } else {
      updateExecution(e => ({
        ...e,
        currentStepIndex: currentIdx + 1,
        stepCompletions: [...e.stepCompletions, completion],
      }));
    }
  }

  function handleBack() {
    if (currentIdx === 0) {
      onExit();
    } else {
      updateExecution(e => ({ ...e, currentStepIndex: currentIdx - 1 }));
    }
  }

  // Success overlay
  if (showSuccess) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: C.successBg,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
        fontFamily: "Inter, sans-serif",
      }}>
        <CheckCircle size={72} color={C.success} />
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
          Process Complete!
        </h1>
        <p style={{ margin: 0, fontSize: 16, color: C.grayText, textAlign: "center", maxWidth: 380 }}>
          All steps for <strong>{process?.title}</strong> have been completed and recorded.
        </p>
        <Btn onClick={onExit} style={{ marginTop: 8 }}>Return to Dashboard</Btn>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: C.white,
        borderBottom: `1px solid ${C.grayLine}`,
        flexShrink: 0,
      }}>
        <div style={{
          height: 64, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 28px",
        }}>
          {/* Left: exit */}
          <button onClick={onExit} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: `1.5px solid ${C.grayLine}`,
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            color: C.grayText, fontSize: 13, fontWeight: 600,
          }}>
            <ArrowLeft size={15} /> Exit
          </button>

          {/* Center: process title */}
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700,
            color: C.dark, fontFamily: "Poppins, sans-serif",
            textAlign: "center", flex: 1, padding: "0 24px",
          }}>
            {process?.title || "Execution"}
          </h2>

          {/* Right: step counter */}
          <div style={{ fontSize: 13, color: C.grayMid, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
            Step {currentIdx + 1} of {totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: C.grayLine }}>
          <div style={{
            height: "100%",
            width: `${progressPct}%`,
            background: C.blue,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", background: C.grayBg }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: 40 }}>
          {!currentStep ? (
            <div style={{ textAlign: "center", color: C.grayMid, padding: 40 }}>No step available.</div>
          ) : (
            <>
              {/* Step title */}
              <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 800, color: C.dark, fontFamily: "Poppins, sans-serif" }}>
                {currentStep.title}
              </h1>

              {/* Description */}
              <p style={{
                margin: "0 0 28px", fontSize: 15, lineHeight: 1.7,
                color: C.grayText, whiteSpace: "pre-wrap",
              }}>
                {currentStep.description}
              </p>

              {/* Photos */}
              {currentStep.photos?.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.grayMid, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                    Reference Photos
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 10,
                  }}>
                    {currentStep.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p.data}
                        alt={p.name || `Photo ${i + 1}`}
                        onClick={() => setPhotoModal(p)}
                        style={{
                          width: "100%", aspectRatio: "1", objectFit: "cover",
                          borderRadius: 8, cursor: "pointer",
                          border: `1px solid ${C.grayLine}`,
                          boxShadow: "0 1px 4px rgba(0,26,87,0.08)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed When */}
              {currentStep.completedWhen && (
                <div style={{
                  border: `1.5px solid ${C.blue}`,
                  borderLeft: `4px solid ${C.blue}`,
                  background: C.bluePale,
                  borderRadius: 10,
                  padding: "20px 24px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <CheckSquare size={14} color={C.blue} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Completed When
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: C.dark, lineHeight: 1.6 }}>
                    {currentStep.completedWhen}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: 72, background: C.white, borderTop: `1px solid ${C.grayLine}`,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 28px", flexShrink: 0,
      }}>
        <Btn variant="ghost" onClick={handleBack}>
          ← Back
        </Btn>
        <Btn
          variant={isLastStep ? "success" : "primary"}
          onClick={handleNext}
          disabled={!currentStep}
        >
          {isLastStep ? "Finish Process ✓" : "Next Step →"}
        </Btn>
      </div>

      {/* Photo fullscreen modal */}
      {photoModal && (
        <div
          onClick={() => setPhotoModal(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <button
            onClick={() => setPhotoModal(null)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: "50%", width: 36, height: 36,
              cursor: "pointer", color: C.white, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
          <img
            src={photoModal.data}
            alt={photoModal.name}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
