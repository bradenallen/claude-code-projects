import { SK } from "./constants.js";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function persist(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const USERS = [
  { id:"u001", username:"admin",    password:"admin123", displayName:"Alex Rivera",   email:"alex@processcert.com",   role:"admin",    active:true, lastLogin:null },
  { id:"u002", username:"engineer", password:"eng123",   displayName:"Sam Torres",    email:"sam@processcert.com",    role:"engineer", active:true, lastLogin:null },
  { id:"u003", username:"operator", password:"op123",    displayName:"Jordan Lee",    email:"jordan@processcert.com", role:"operator", active:true, lastLogin:null },
  { id:"u004", username:"viewer",   password:"view123",  displayName:"Casey Morgan",  email:"casey@processcert.com",  role:"viewer",   active:true, lastLogin:null },
];

const STEPS = [
  {
    id:"s001", title:"Safety Equipment Check",
    description:"Verify that all required personal protective equipment (PPE) is present and in good condition before starting work. Inspect hard hat, safety glasses, gloves, and steel-toed boots for damage or expiration. Document any deficiencies and replace equipment before proceeding.",
    completedWhen:"All PPE items are physically present, visually inspected, and confirmed free of damage. Operator has donned required equipment and confirmed fit.",
    photos:[], createdBy:"u002", createdAt:"2026-02-01T08:00:00Z", updatedAt:"2026-02-01T08:00:00Z",
  },
  {
    id:"s002", title:"Inspect Raw Materials",
    description:"Examine all incoming raw materials against the material specification sheet for the current work order. Check dimensions, surface finish, and material certifications. Reject any materials that do not meet specification.",
    completedWhen:"Each material lot has been measured with calibrated instruments and recorded on the inspection log. Material certs are attached and reviewed. All materials meet specification or have been quarantined.",
    photos:[], createdBy:"u002", createdAt:"2026-02-02T08:00:00Z", updatedAt:"2026-02-02T08:00:00Z",
  },
  {
    id:"s003", title:"Clean Work Surface",
    description:"Remove all debris, residue, and contaminants from the work surface using approved cleaning agents. Wipe down the surface with lint-free cloths in one direction to avoid cross-contamination. Allow the surface to fully dry before placing components.",
    completedWhen:"Work surface is visibly clean with no debris or residue. Surface has been wiped with lint-free cloth and dried. Cleaning log entry has been made with date, time, and operator initials.",
    photos:[], createdBy:"u002", createdAt:"2026-02-03T08:00:00Z", updatedAt:"2026-02-03T08:00:00Z",
  },
  {
    id:"s004", title:"Apply Thread Sealant",
    description:"Apply the specified thread sealant compound to all threaded fittings in accordance with the assembly drawing. Use the correct sealant grade for the fluid type and operating pressure. Apply sealant starting two threads from the end to prevent contamination.",
    completedWhen:"Thread sealant has been applied to all specified fittings per assembly drawing callouts. Sealant coverage is uniform and does not extend to the first thread. Batch number of sealant compound recorded.",
    photos:[], createdBy:"u002", createdAt:"2026-02-04T08:00:00Z", updatedAt:"2026-02-04T08:00:00Z",
  },
  {
    id:"s005", title:"Install Mounting Bracket",
    description:"Position the mounting bracket per the assembly drawing and align with reference holes. Insert all fasteners by hand before applying any torque to ensure proper thread engagement. Verify bracket orientation before final fastening.",
    completedWhen:"Mounting bracket is installed in the correct orientation per assembly drawing. All fasteners are installed and hand-tight. Bracket position has been verified against reference dimensions.",
    photos:[], createdBy:"u002", createdAt:"2026-02-05T08:00:00Z", updatedAt:"2026-02-05T08:00:00Z",
  },
  {
    id:"s006", title:"Torque Fasteners",
    description:"Torque all fasteners to the specified values using a calibrated torque wrench. Apply torque in the sequence shown on the assembly drawing to ensure even load distribution. Mark each fastener with a torque stripe after reaching specified torque.",
    completedWhen:"All fasteners have been torqued to specification using a calibrated torque wrench (cal due date verified). Torque stripe is visible on each fastener. Torque values and wrench calibration ID recorded on the traveler.",
    photos:[], createdBy:"u002", createdAt:"2026-02-06T08:00:00Z", updatedAt:"2026-02-06T08:00:00Z",
  },
  {
    id:"s007", title:"Dimensional Verification",
    description:"Measure all critical dimensions of the completed assembly using calibrated measurement tools. Compare measurements against the engineering drawing tolerances. Record all measurements in the inspection record.",
    completedWhen:"All critical dimensions have been measured and recorded. Every measurement falls within the tolerance band shown on the drawing. Measurement record is signed and dated. Any out-of-tolerance conditions have been reported to engineering.",
    photos:[], createdBy:"u002", createdAt:"2026-02-07T08:00:00Z", updatedAt:"2026-02-07T08:00:00Z",
  },
  {
    id:"s008", title:"Visual Quality Inspection",
    description:"Perform a thorough visual inspection of the completed assembly for cosmetic defects, surface damage, contamination, and workmanship issues. Inspect under adequate lighting and from multiple angles. Document any findings.",
    completedWhen:"Complete visual inspection has been performed on all external surfaces. No unacceptable cosmetic defects, scratches, or contamination are present. Inspection checklist is completed and signed. Assembly is approved for next operation or shipping.",
    photos:[], createdBy:"u002", createdAt:"2026-02-08T08:00:00Z", updatedAt:"2026-02-08T08:00:00Z",
  },
];

const PROCESSES = [
  {
    id:"p001", title:"Widget Assembly Procedure",
    description:"Complete assembly procedure for Widget Model X including all safety checks, material inspection, mechanical assembly, and final quality verification.",
    componentName:"Widget Model X",
    stepIds:["s001","s002","s003","s005","s006","s007","s008"],
    status:"published",
    createdBy:"u002", createdAt:"2026-02-10T09:00:00Z", updatedAt:"2026-02-15T14:00:00Z",
  },
  {
    id:"p002", title:"Valve Installation Procedure",
    description:"Standard installation procedure for Hydraulic Valve HV-200 including surface preparation, thread sealing, installation, and torque verification.",
    componentName:"Hydraulic Valve HV-200",
    stepIds:["s001","s003","s004","s006","s008"],
    status:"published",
    createdBy:"u002", createdAt:"2026-02-12T10:00:00Z", updatedAt:"2026-02-18T11:00:00Z",
  },
];

const ASSIGNMENTS = [
  {
    id:"a001", processId:"p001", operatorId:"u003", quantity:3,
    dueDate:"2026-03-02", assignedBy:"u001", assignedAt:"2026-02-28T08:00:00Z", active:true,
  },
  {
    id:"a002", processId:"p002", operatorId:"u003", quantity:2,
    dueDate:"2026-03-02", assignedBy:"u001", assignedAt:"2026-02-28T08:15:00Z", active:true,
  },
];

const EXECUTIONS = [
  {
    id:"e001", assignmentId:"a001", processId:"p001", operatorId:"u003",
    startedAt:"2026-03-02T07:30:00Z", completedAt:null,
    status:"in_progress", currentStepIndex:1,
    stepCompletions:[
      { stepId:"s001", completedAt:"2026-03-02T07:35:00Z", completedBy:"u003" },
    ],
  },
];

export function initializeStorage() {
  if (load(SK.USERS, null) !== null) return; // idempotent
  persist(SK.USERS,       USERS);
  persist(SK.STEPS,       STEPS);
  persist(SK.PROCESSES,   PROCESSES);
  persist(SK.ASSIGNMENTS, ASSIGNMENTS);
  persist(SK.EXECUTIONS,  EXECUTIONS);
}
