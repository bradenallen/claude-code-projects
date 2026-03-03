export const ACTIONS = {
  VIEW_DASHBOARD:     "view_dashboard",
  VIEW_STEPS:         "view_steps",
  CREATE_STEP:        "create_step",
  EDIT_STEP:          "edit_step",
  DELETE_STEP:        "delete_step",
  VIEW_PROCESSES:     "view_processes",
  CREATE_PROCESS:     "create_process",
  EDIT_PROCESS:       "edit_process",
  DELETE_PROCESS:     "delete_process",
  PUBLISH_PROCESS:    "publish_process",
  VIEW_ASSIGNMENTS:   "view_assignments",
  CREATE_ASSIGNMENT:  "create_assignment",
  EDIT_ASSIGNMENT:    "edit_assignment",
  DELETE_ASSIGNMENT:  "delete_assignment",
  EXECUTE_PROCESS:    "execute_process",
  VIEW_USERS:         "view_users",
  CREATE_USER:        "create_user",
  EDIT_USER:          "edit_user",
  DEACTIVATE_USER:    "deactivate_user",
  ASSIGN_ROLE:        "assign_role",
  VIEW_ROLES:         "view_roles",
  CREATE_ROLE:        "create_role",
  EDIT_ROLE:          "edit_role",
  DELETE_ROLE:        "delete_role",
};

export const PERMISSIONS = {
  viewer: [
    ACTIONS.VIEW_DASHBOARD,
    ACTIONS.VIEW_STEPS,
    ACTIONS.VIEW_PROCESSES,
  ],
  engineer: [
    ACTIONS.VIEW_DASHBOARD,
    ACTIONS.VIEW_STEPS,
    ACTIONS.CREATE_STEP,
    ACTIONS.EDIT_STEP,
    ACTIONS.DELETE_STEP,
    ACTIONS.VIEW_PROCESSES,
    ACTIONS.CREATE_PROCESS,
    ACTIONS.EDIT_PROCESS,
    ACTIONS.DELETE_PROCESS,
    ACTIONS.PUBLISH_PROCESS,
  ],
  operator: [
    ACTIONS.VIEW_DASHBOARD,
    ACTIONS.VIEW_PROCESSES,
    ACTIONS.VIEW_ASSIGNMENTS,
    ACTIONS.EXECUTE_PROCESS,
  ],
  admin: Object.values(ACTIONS).filter(a => a !== ACTIONS.VIEW_ROLES && a !== ACTIONS.CREATE_ROLE && a !== ACTIONS.EDIT_ROLE && a !== ACTIONS.DELETE_ROLE),
  super_admin: Object.values(ACTIONS),
};

export const FEATURE_GROUPS = [
  {
    key: "steps", label: "Steps", desc: "Individual assembly/process steps.",
    screenAction: ACTIONS.VIEW_STEPS,
    ops: [
      { label: "Create", action: ACTIONS.CREATE_STEP },
      { label: "Update", action: ACTIONS.EDIT_STEP },
      { label: "Delete", action: ACTIONS.DELETE_STEP },
    ],
  },
  {
    key: "processes", label: "Processes", desc: "Ordered step collections forming procedures.",
    screenAction: ACTIONS.VIEW_PROCESSES,
    ops: [
      { label: "Create",  action: ACTIONS.CREATE_PROCESS },
      { label: "Update",  action: ACTIONS.EDIT_PROCESS },
      { label: "Delete",  action: ACTIONS.DELETE_PROCESS },
      { label: "Publish", action: ACTIONS.PUBLISH_PROCESS },
    ],
  },
  {
    key: "assignments", label: "Assignments", desc: "Task assignments linking operators to processes.",
    screenAction: ACTIONS.VIEW_ASSIGNMENTS,
    ops: [
      { label: "Create", action: ACTIONS.CREATE_ASSIGNMENT },
      { label: "Update", action: ACTIONS.EDIT_ASSIGNMENT },
      { label: "Delete", action: ACTIONS.DELETE_ASSIGNMENT },
    ],
  },
  {
    key: "users", label: "Users", desc: "User accounts and access management.",
    screenAction: ACTIONS.VIEW_USERS,
    ops: [
      { label: "Create",      action: ACTIONS.CREATE_USER },
      { label: "Update",      action: ACTIONS.EDIT_USER },
      { label: "Deactivate",  action: ACTIONS.DEACTIVATE_USER },
      { label: "Assign Role", action: ACTIONS.ASSIGN_ROLE },
    ],
  },
  {
    key: "roles", label: "Roles", desc: "Custom role definitions and permissions.",
    screenAction: ACTIONS.VIEW_ROLES,
    ops: [
      { label: "Create", action: ACTIONS.CREATE_ROLE },
      { label: "Update", action: ACTIONS.EDIT_ROLE },
      { label: "Delete", action: ACTIONS.DELETE_ROLE },
    ],
  },
];

export const SCREEN_FLAGS = [
  { id: "dashboard",   label: "Dashboard",   action: ACTIONS.VIEW_DASHBOARD,   icon: "LayoutDashboard" },
  { id: "steps",       label: "Steps",       action: ACTIONS.VIEW_STEPS,       icon: "ClipboardList" },
  { id: "processes",   label: "Processes",   action: ACTIONS.VIEW_PROCESSES,   icon: "GitBranch" },
  { id: "assignments", label: "Assignments", action: ACTIONS.VIEW_ASSIGNMENTS, icon: "Calendar" },
  { id: "users",       label: "Users",       action: ACTIONS.VIEW_USERS,       icon: "Users" },
  { id: "roles",       label: "Roles",       action: ACTIONS.VIEW_ROLES,       icon: "Shield" },
];

export const ADDITIONAL_PERMISSIONS = [
  { label: "Execute Process", desc: "Allows running step-by-step execution.", action: ACTIONS.EXECUTE_PROCESS },
];
