import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  WorkOrder,
  Employee,
  ShiftDefinition,
  AttendanceRecord,
  Vehicle,
  MaintenanceRecord,
  FuelTransaction,
  InventoryItem,
  InventoryMovement,
  StationPump,
  StationTelemetry,
  AdministrativeDocument,
  NotificationItem,
  AuditLogEntry,
  StationSettings,
  TicketStatus,
  DisciplinaryRecord,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_SETTINGS,
  INITIAL_SHIFTS,
  INITIAL_WORK_ORDERS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_VEHICLES,
  INITIAL_MAINTENANCE,
  INITIAL_FUEL_TRANSACTIONS,
  INITIAL_INVENTORY,
  INITIAL_MOVEMENTS,
  INITIAL_PUMPS,
  INITIAL_TELEMETRY,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOG,
} from '../data/mockData';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  currentUser: User;
  allUsers: User[];
  switchRole: (role: UserRole) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  activeModule: string;
  setActiveModule: (module: string) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  settings: StationSettings;
  updateSettings: (newSettings: Partial<StationSettings>) => void;
  // Work Orders
  workOrders: WorkOrder[];
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => void;
  updateWorkOrderStatus: (orderId: string, newStatus: TicketStatus, note?: string, completionNotes?: string, cancellationReason?: string) => boolean;
  updateWorkOrder: (orderId: string, updates: Partial<WorkOrder>) => void;
  // Employees
  employees: Employee[];
  createEmployee: (emp: Omit<Employee, 'id' | 'completedWorkOrdersCount' | 'attendanceRatePercent' | 'disciplinaryRecords'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addDisciplinaryRecord: (empId: string, record: Omit<DisciplinaryRecord, 'id'>) => boolean;
  // Attendance & Shifts
  shifts: ShiftDefinition[];
  attendance: AttendanceRecord[];
  requestAttendanceCorrection: (attendanceId: string, note: string) => void;
  approveAttendanceCorrection: (attendanceId: string, approved: boolean) => void;
  clockInEmployee: (employeeId: string) => void;
  setAttendanceStatus: (employeeId: string, date: string, status: AttendanceRecord['status'], note: string, leaveType?: AttendanceRecord['leaveType']) => void;
  // Vehicles
  vehicles: Vehicle[];
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'assetNumber'>) => void;
  // Maintenance
  maintenanceRecords: MaintenanceRecord[];
  createMaintenanceRecord: (rec: Omit<MaintenanceRecord, 'id' | 'recordNumber'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  // Fuel & Inventory
  fuelTransactions: FuelTransaction[];
  createFuelTransaction: (tx: Omit<FuelTransaction, 'id' | 'receiptNumber'>) => void;
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  recordStockMovement: (mov: Omit<InventoryMovement, 'id' | 'date'>) => boolean;
  // Station Ops
  stationPumps: StationPump[];
  updatePumpStatus: (pumpId: string, status: StationPump['status']) => void;
  stationTelemetry: StationTelemetry;
  updateStationTelemetry: (telemetry: Partial<StationTelemetry>) => void;
  // Correspondence
  documents: AdministrativeDocument[];
  createDocument: (doc: Omit<AdministrativeDocument, 'id' | 'refNumber' | 'issueDate' | 'status'>) => void;
  updateDocumentStatus: (id: string, status: AdministrativeDocument['status']) => void;
  acknowledgeDocument: (id: string) => void;
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: AuditLogEntry['action'], entity: string, targetId: string, details: string) => void;
  // Permissions & Utils
  canPerform: (action: string) => boolean;
  resetDemoData: () => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'kadhimiya_station_app_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Storage parse error for', key, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error for', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [language, setLangState] = useState<'ar' | 'en'>(() => getStored('lang', 'ar'));
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const storedUserId = getStored('current_user_id', 'usr-1');
    return DEMO_USERS.find((u) => u.id === storedUserId) || DEMO_USERS[0];
  });

  const isAdmin = currentUser.role === 'super_admin' || currentUser.isAdmin === true;

  const login = (email: string, _password: string, role?: UserRole): boolean => {
    // This is a public demonstration flow, not production authentication.
    // Only explicitly configured demo accounts can enter, and the selected role
    // must match the account so arbitrary emails cannot silently become admins.
    const normalizedEmail = email.trim().toLowerCase();
    const target = DEMO_USERS.find((u) =>
      u.email.toLowerCase() === normalizedEmail && (!role || u.role === role)
    );

    if (!target) {
      showToast('تعذر العثور على حساب تجريبي مطابق. اختر أحد حسابات العرض المتاحة.', 'error');
      return false;
    }

    setCurrentUser(target);
    setIsAuthenticated(true);
    setStored('is_authenticated', true);
    setStored('current_user_id', target.id);
    addAuditLog('CREATE', 'AuthSession', target.id, `تسجيل دخول ناجح إلى المنظومة: ${target.name} (${target.roleTitleAr})`);
    showToast(`مرحباً بك، تم تسجيل الدخول بصلاحية: ${target.roleTitleAr}`, 'success');
    return true;
  };

  const logout = () => {
    addAuditLog('DELETE', 'AuthSession', currentUser.id, `تسجيل خروج من المنظومة: ${currentUser.name}`);
    setIsAuthenticated(false);
    setStored('is_authenticated', false);
    showToast('تم تسجيل الخروج من النظام بنجاح. يرجى تسجيل الدخول للمتابعة.', 'info');
  };

  const [settings, setSettings] = useState<StationSettings>(() => getStored('settings', INITIAL_SETTINGS));
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => getStored('work_orders', INITIAL_WORK_ORDERS));
  const [employees, setEmployees] = useState<Employee[]>(() => getStored('employees', INITIAL_EMPLOYEES));
  const [shifts] = useState<ShiftDefinition[]>(INITIAL_SHIFTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStored('attendance', INITIAL_ATTENDANCE));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStored('vehicles', INITIAL_VEHICLES));
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(() => getStored('maint', INITIAL_MAINTENANCE));
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>(() => getStored('fuel', INITIAL_FUEL_TRANSACTIONS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStored('inventory', INITIAL_INVENTORY));
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => getStored('movements', INITIAL_MOVEMENTS));
  const [stationPumps, setStationPumps] = useState<StationPump[]>(() => getStored('pumps', INITIAL_PUMPS));
  const [stationTelemetry, setStationTelemetry] = useState<StationTelemetry>(() => getStored('telemetry', INITIAL_TELEMETRY));
  const [documents, setDocuments] = useState<AdministrativeDocument[]>(() => getStored('documents', INITIAL_DOCUMENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStored('notifs', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStored('audit', INITIAL_AUDIT_LOG));

  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync language and dir attribute on HTML
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    setStored('lang', language);
  }, [language]);

  const setLanguage = (lang: 'ar' | 'en') => {
    setLangState(lang);
    showToast(lang === 'ar' ? 'تم تحويل الواجهة إلى اللغة العربية' : 'Switched interface to English', 'info');
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  // Role Switching
  const switchRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(target);
    setStored('current_user_id', target.id);
    addAuditLog('UPDATE', 'UserSession', target.id, `تبديل الصلاحية التشغيلية إلى دور: ${target.roleTitleAr}`);
    showToast(`تم التبديل إلى دور: ${target.roleTitleAr} (${target.name})`, 'info');
  };

  // Audit Logging helper
  const addAuditLog = (
    action: AuditLogEntry['action'],
    targetEntity: string,
    targetId: string,
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetEntity,
      targetId,
      details,
      ipAddress: undefined, // Client-side demo logs do not have a verified client IP.
    };
    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev];
      setStored('audit', updated);
      return updated;
    });
  };

  // Permission Matrix
  const canPerform = (action: string): boolean => {
    // Administrator CAN CHANGE ANY THING!
    if (currentUser.role === 'super_admin' || currentUser.isAdmin === true) {
      return true;
    }

    // Normal User CANNOT CHANGE ANYTHING! View only!
    if (currentUser.role === 'normal_user') {
      if (action === 'export_reports' || action === 'view_public') return true;
      return false;
    }

    const role = currentUser.role;
    // Optional demo permission matrix configured in Settings. This is a browser-only
    // convenience for the prototype, not production authorization.
    try {
      const savedMatrix = localStorage.getItem('kadhimiya_station_app_permission_matrix');
      if (savedMatrix) {
        const matrix = JSON.parse(savedMatrix) as Record<string, Record<string, boolean>>;
        const permissionKey = action === 'edit_settings' ? 'settings'
          : ['view_confidential_hr', 'edit_employee', 'create_employee', 'manage_disciplinary', 'approve_attendance'].includes(action) ? 'hr'
          : ['manage_fleet', 'mark_vehicle_out_of_service', 'create_maintenance', 'edit_maintenance', 'update_station_pumps', 'record_telemetry'].includes(action) ? 'fleet'
          : ['export_audit', 'view_audit_log'].includes(action) ? 'audit'
          : ['create_work_order', 'assign_work_order', 'edit_work_order', 'update_work_order_status', 'verify_work_order', 'cancel_work_order', 'issue_document', 'approve_document'].includes(action) ? 'workOrders'
          : null;
        if (permissionKey && matrix[role] && typeof matrix[role][permissionKey] === 'boolean') return matrix[role][permissionKey];
      }
    } catch (error) {
      console.warn('Unable to read demo permission matrix', error);
    }

    switch (action) {
      case 'create_work_order':
      case 'assign_work_order':
      case 'edit_work_order':
        return ['station_manager', 'shift_supervisor', 'dispatcher'].includes(role);
      case 'update_work_order_status':
        return ['station_manager', 'shift_supervisor', 'dispatcher', 'engineer', 'driver_worker'].includes(role);
      case 'verify_work_order':
      case 'cancel_work_order':
        return ['station_manager', 'shift_supervisor'].includes(role);
      case 'view_confidential_hr':
      case 'edit_employee':
      case 'create_employee':
      case 'manage_disciplinary':
        return ['hr_officer'].includes(role);
      case 'approve_attendance':
        return ['station_manager', 'shift_supervisor', 'hr_officer'].includes(role);
      case 'manage_fleet':
      case 'mark_vehicle_out_of_service':
        return ['station_manager', 'shift_supervisor', 'engineer'].includes(role);
      case 'create_maintenance':
      case 'edit_maintenance':
        return ['station_manager', 'engineer'].includes(role);
      case 'issue_inventory':
      case 'approve_material':
        return ['station_manager', 'engineer', 'shift_supervisor'].includes(role);
      case 'update_station_pumps':
      case 'record_telemetry':
        return ['station_manager', 'engineer', 'shift_supervisor'].includes(role);
      case 'issue_document':
      case 'approve_document':
        return ['station_manager', 'hr_officer'].includes(role);
      case 'edit_settings':
        return false; // Only administrator
      case 'export_reports':
        return ['station_manager', 'dispatcher', 'hr_officer', 'auditor', 'shift_supervisor', 'normal_user'].includes(role);
      default:
        return false;
    }
  };

  // Work Orders CRUD
  const createWorkOrder = (data: Omit<WorkOrder, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => {
    if (!canPerform('create_work_order')) {
      showToast('ليس لديك صلاحية إنشاء أوامر عمل جديدة بهذا الدور.', 'error');
      return;
    }
    if (data.assignedVehicleId && workOrders.some((order) => order.assignedVehicleId === data.assignedVehicleId && !['completed', 'verified', 'cancelled'].includes(order.status))) {
      const vehicle = vehicles.find((item) => item.id === data.assignedVehicleId);
      showToast(`لا يمكن إسناد الآلية ${vehicle?.assetNumber || ''} لأنها مرتبطة بأمر عمل نشط آخر. أغلق الأمر السابق أو اختر آلية أخرى.`, 'warning');
      return;
    }
    const ticketSeq = 414 + workOrders.length;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOrder: WorkOrder = {
      ...data,
      id: `wo-${Date.now().toString().slice(-5)}`,
      ticketNumber: `KADH-2026-${ticketSeq}`,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: data.status || 'new',
          timestamp: now,
          actor: currentUser.name,
          role: currentUser.roleTitleAr,
          note: 'تم إنشاء البلاغ رسمياً في النظام.',
        },
      ],
    };

    const updated = [newOrder, ...workOrders];
    setWorkOrders(updated);
    setStored('work_orders', updated);
    addAuditLog('CREATE', 'WorkOrder', newOrder.ticketNumber, `إنشاء أمر عمل جديد: ${newOrder.title}`);

    // Create In-App Notification if urgent
    if (newOrder.priority === 'urgent') {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now().toString().slice(-5)}`,
        title: `بلاغ عاجل: ${newOrder.title}`,
        message: `تم تسجيل بلاغ ذو أولوية طارئة في ${newOrder.neighborhood} - ${newOrder.street}`,
        category: 'ticket',
        severity: 'urgent',
        timestamp: now,
        isRead: false,
        linkModule: 'operations',
        linkId: newOrder.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast(`تم تسجيل البلاغ بنجاح برقم ${newOrder.ticketNumber}`, 'success');
  };

  const updateWorkOrderStatus = (
    orderId: string,
    newStatus: TicketStatus,
    note?: string,
    completionNotes?: string,
    cancellationReason?: string
  ): boolean => {
    if (!canPerform('update_work_order_status')) {
      showToast('ليس لديك الصلاحية المطلوبة لتحديث حالة البلاغات.', 'error');
      return false;
    }

    const order = workOrders.find((w) => w.id === orderId);
    if (!order) return false;

    // Special business logic validations:
    if (newStatus === 'cancelled') {
      if (!canPerform('cancel_work_order')) {
        showToast('إلغاء أمر العمل يتطلب صلاحية مدير المحطة أو مشرف الوجبة.', 'error');
        return false;
      }
      if (!cancellationReason || cancellationReason.trim().length < 5) {
        showToast('يجب إدخال سبب رسمي ومبرر واضح لإلغاء البلاغ.', 'warning');
        return false;
      }
    }

    if (newStatus === 'completed' || newStatus === 'verified') {
      if (newStatus === 'verified' && !canPerform('verify_work_order')) {
        showToast('اعتماد وإغلاق البلاغ نهائياً يتطلب صلاحية تدقيق مدير المحطة أو المشرف.', 'error');
        return false;
      }
      if (newStatus === 'completed' && (!completionNotes || completionNotes.trim().length < 5)) {
        showToast('يجب تسجيل تفاصيل وملاحظات الإنجاز الميداني قبل إغلاق المهمة.', 'warning');
        return false;
      }
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedHistory = [
      ...order.statusHistory,
      {
        status: newStatus,
        timestamp: now,
        actor: currentUser.name,
        role: currentUser.roleTitleAr,
        note: note || (newStatus === 'cancelled' ? cancellationReason : completionNotes) || 'تحديث الحالة التشغيلية',
      },
    ];

    const updatedOrders = workOrders.map((w) => {
      if (w.id === orderId) {
        return {
          ...w,
          status: newStatus,
          updatedAt: now,
          completionNotes: completionNotes || w.completionNotes,
          cancellationReason: cancellationReason || w.cancellationReason,
          statusHistory: updatedHistory,
        };
      }
      return w;
    });

    setWorkOrders(updatedOrders);
    setStored('work_orders', updatedOrders);
    addAuditLog('STATUS_CHANGE', 'WorkOrder', order.ticketNumber, `تغيير الحالة إلى (${newStatus}): ${order.title}`);
    showToast(`تم تحديث حالة البلاغ ${order.ticketNumber} بنجاح`, 'success');
    return true;
  };

  const updateWorkOrder = (orderId: string, updates: Partial<WorkOrder>) => {
    if (!canPerform('edit_work_order')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية تعديل أوامر العمل. فقط مدير النظام العام (Administrator) يمتلك هذه الصلاحية.', 'error');
      return;
    }
    // If vehicle is being assigned, verify vehicle is not out of service!
    if (updates.assignedVehicleId) {
      const v = vehicles.find((veh) => veh.id === updates.assignedVehicleId);
      if (v && v.availability === 'out_of_service') {
        showToast(`لا يمكن تكليف الآلية ${v.assetNumber} لأنها مسجلة (خارج الخدمة / معطلة)!`, 'error');
        return;
      }
      const conflictingOrder = workOrders.find((order) => order.id !== orderId && order.assignedVehicleId === updates.assignedVehicleId && !['completed', 'verified', 'cancelled'].includes(order.status));
      if (conflictingOrder) {
        showToast(`الآلية مرتبطة بالأمر النشط ${conflictingOrder.ticketNumber}. اختر آلية أخرى أو أنهِ الأمر السابق.`, 'warning');
        return;
      }
    }

    const updated = workOrders.map((w) => (w.id === orderId ? { ...w, ...updates, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) } : w));
    setWorkOrders(updated);
    setStored('work_orders', updated);
    addAuditLog('UPDATE', 'WorkOrder', orderId, `تعديل بيانات أمر العمل`);
    showToast('تم حفظ التعديلات بنجاح', 'success');
  };

  // Vehicles Management
  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    if (!canPerform('manage_fleet')) {
      showToast('ليس لديك صلاحية تعديل بيانات الأسطول.', 'error');
      return;
    }
    const updated = vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setVehicles(updated);
    setStored('vehicles', updated);
    addAuditLog('UPDATE', 'Vehicle', id, `تحديث حالة وبيانات المركبة ${id}`);
    showToast('تم تحديث سجل الآلية بنجاح', 'success');
  };

  const createVehicle = (vehicle: Omit<Vehicle, 'id' | 'assetNumber'>) => {
    if (!canPerform('manage_fleet')) {
      showToast('ليس لديك صلاحية إضافة آليات جديدة.', 'error');
      return;
    }
    const id = `veh-${Date.now().toString().slice(-4)}`;
    const assetNumber = `FLT-KADH-0${vehicles.length + 1}`;
    const newV: Vehicle = { ...vehicle, id, assetNumber };
    const updated = [...vehicles, newV];
    setVehicles(updated);
    setStored('vehicles', updated);
    addAuditLog('CREATE', 'Vehicle', assetNumber, `إضافة آلية جديدة: ${newV.makeModel}`);
    showToast(`تمت إضافة الآلية ${assetNumber} إلى الأسطول`, 'success');
  };

  // Employees Management
  const createEmployee = (emp: Omit<Employee, 'id' | 'completedWorkOrdersCount' | 'attendanceRatePercent' | 'disciplinaryRecords'>) => {
    if (!canPerform('create_employee')) {
      showToast('فقط مسؤول الموارد البشرية يمتلك صلاحية إضافة موظفين.', 'error');
      return;
    }
    const id = `emp-${Date.now().toString().slice(-4)}`;
    const newEmp: Employee = {
      ...emp,
      id,
      completedWorkOrdersCount: 0,
      attendanceRatePercent: 100,
      disciplinaryRecords: [],
    };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    setStored('employees', updated);
    addAuditLog('CREATE', 'Employee', newEmp.employeeNumber, `إضافة قيد موظف جديد: ${newEmp.fullName}`);
    showToast(`تم تسجيل الموظف ${newEmp.fullName} بنجاح`, 'success');
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    if (!canPerform('edit_employee')) {
      showToast('تعديل ملف الموظف يتطلب صلاحية الموارد البشرية.', 'error');
      return;
    }
    const updated = employees.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEmployees(updated);
    setStored('employees', updated);
    addAuditLog('UPDATE', 'Employee', id, `تعديل ملف الموظف ${id}`);
    showToast('تم تحديث بيانات الموظف بنجاح', 'success');
  };

  const addDisciplinaryRecord = (empId: string, record: Omit<DisciplinaryRecord, 'id'>): boolean => {
    if (!canPerform('manage_disciplinary')) {
      showToast('إدراج العقوبات والتنبيهات الإدارية محصور بمسؤول الموارد البشرية والمدير العام.', 'error');
      return false;
    }
    const recId = `disc-${Date.now().toString().slice(-4)}`;
    const updated = employees.map((e) => {
      if (e.id === empId) {
        return {
          ...e,
          disciplinaryRecords: [...e.disciplinaryRecords, { ...record, id: recId }],
        };
      }
      return e;
    });
    setEmployees(updated);
    setStored('employees', updated);
    addAuditLog('CREATE', 'DisciplinaryRecord', empId, `تسجيل قيد انضباطي رسمي للموظف`);
    showToast('تم تسجيل القيد الإداري بنجاح في السجل السري', 'warning');
    return true;
  };

  // Attendance
  const requestAttendanceCorrection = (attendanceId: string, note: string) => {
    if (!canPerform('request_attendance_correction')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية تقديم طلبات تصحيح الدوام.', 'error');
      return;
    }
    const updated = attendance.map((a) => (a.id === attendanceId ? { ...a, manualEditRequested: true, manualCorrectionNote: note, isApproved: false } : a));
    setAttendance(updated);
    setStored('attendance', updated);
    addAuditLog('UPDATE', 'Attendance', attendanceId, `طلب تصحيح دوام: ${note}`);
    showToast('تم إرسال طلب تصحيح البصمة/الدوام إلى المشرف للمصادقة', 'info');
  };

  const approveAttendanceCorrection = (attendanceId: string, approved: boolean) => {
    if (!canPerform('approve_attendance')) {
      showToast('ليس لديك صلاحية مصادقة تصحيح الدوام.', 'error');
      return;
    }
    const updated = attendance.map((a) => {
      if (a.id === attendanceId) {
        return {
          ...a,
          isApproved: approved,
          manualEditRequested: false,
          approvedBy: currentUser.name,
          status: approved ? 'present' : a.status,
        };
      }
      return a;
    });
    setAttendance(updated);
    setStored('attendance', updated);
    addAuditLog('APPROVE', 'Attendance', attendanceId, `${approved ? 'قبول' : 'رفض'} طلب تصحيح الدوام`);
    showToast(`تم ${approved ? 'اعتماد' : 'رفض'} تصحيح سجل الحضور`, 'success');
  };

  const setAttendanceStatus = (employeeId: string, date: string, status: AttendanceRecord['status'], note: string, leaveType?: AttendanceRecord['leaveType']) => {
    if (!canPerform('approve_attendance')) {
      showToast('ليس لديك صلاحية تعديل حالة الدوام يدويًا.', 'error');
      return;
    }
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) { showToast('لم يتم العثور على الموظف.', 'error'); return; }
    const existing = attendance.find((a) => a.employeeId === employeeId && a.date === date);
    const now = new Date();
    const statusTime = now.toTimeString().slice(0, 5);
    let updated: AttendanceRecord[];
    if (existing) {
      updated = attendance.map((a) => a.id === existing.id ? {
        ...a, status, notes: note.trim() || a.notes, leaveType,
        isApproved: true, updatedBy: currentUser.name, updatedAt: now.toISOString(),
        ...(status === 'leave' || status === 'absent' || status === 'excused' ? { checkInTime: null, checkOutTime: null } : {}),
        ...(status === 'present' && !a.checkInTime ? { checkInTime: statusTime } : {}),
      } : a);
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`, employeeId: emp.id, employeeName: emp.fullName,
        shiftId: emp.assignedShiftId, date, checkInTime: status === 'present' || status === 'late' ? statusTime : null,
        checkOutTime: null, status, overtimeMinutes: 0, notes: note.trim(), isApproved: true,
        leaveType, updatedBy: currentUser.name, updatedAt: now.toISOString(),
      };
      updated = [newRecord, ...attendance];
    }
    setAttendance(updated); setStored('attendance', updated);
    addAuditLog('UPDATE', 'Attendance', existing?.id || `att-${employeeId}-${date}`, `تعديل حالة دوام ${emp.fullName} إلى ${status}${note.trim() ? `: ${note.trim()}` : ''}`);
    showToast('تم حفظ حالة الدوام في النسخة التجريبية.', 'success');
  };

  const clockInEmployee = (employeeId: string) => {
    if (!canPerform('clock_in')) {
      showToast('عذراً! حساب المستخدم العادي للمشاهدة فقط ولا يمكنه تسجيل الحضور أو الانصراف.', 'error');
      return;
    }
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const nowTime = new Date().toTimeString().substring(0, 5);
    const localNow = new Date();
    const today = `${localNow.getFullYear()}-${String(localNow.getMonth() + 1).padStart(2, '0')}-${String(localNow.getDate()).padStart(2, '0')}`;

    const existing = attendance.find((a) => a.employeeId === employeeId && a.date === today);
    if (existing) {
      if (!existing.checkInTime && !['leave', 'absent', 'excused'].includes(existing.status)) {
        const assignedShift = shifts.find((item) => item.id === existing.shiftId);
        const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
        const shiftStart = assignedShift ? toMinutes(assignedShift.startTime) : toMinutes('07:00');
        const isLate = toMinutes(nowTime) > shiftStart + 5;
        const updated = attendance.map((a) => a.id === existing.id ? { ...a, checkInTime: nowTime, status: isLate ? 'late' as const : 'present' as const, updatedBy: currentUser.name, updatedAt: new Date().toISOString() } : a);
        setAttendance(updated); setStored('attendance', updated);
        addAuditLog('UPDATE', 'Attendance', existing.id, `تسجيل حضور الموظف ${emp.fullName} في ${nowTime}`);
        showToast(`تم تسجيل حضور ${emp.fullName} الساعة ${nowTime}${isLate ? ' مع تسجيل التأخير' : ''}`, 'success');
      } else if (existing.checkInTime && !existing.checkOutTime) {
        const shift = shifts.find((item) => item.id === existing.shiftId);
        const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
        const endMinutes = shift ? toMinutes(shift.endTime) : toMinutes('15:00');
        const checkoutMinutes = toMinutes(nowTime);
        const overtimeMinutes = checkoutMinutes >= endMinutes ? checkoutMinutes - endMinutes : 0;
        const updated = attendance.map((a) => (a.id === existing.id ? { ...a, checkOutTime: nowTime, overtimeMinutes } : a));
        setAttendance(updated);
        setStored('attendance', updated);
        addAuditLog('UPDATE', 'Attendance', existing.id, `تسجيل انصراف الموظف ${emp.fullName} في ${nowTime}`);
        showToast(`تم تسجيل انصراف الموظف ${emp.fullName} الساعة ${nowTime}. الإضافي المحسوب مبدئيًا: ${overtimeMinutes} دقيقة.`, 'success');
      } else {
        showToast('الموظف قام بتسجيل الحضور والانصراف مسبقاً لهذا اليوم.', 'info');
      }
    } else {
      const assignedShift = shifts.find((item) => item.id === emp.assignedShiftId);
      const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
      const shiftStart = assignedShift ? toMinutes(assignedShift.startTime) : toMinutes('07:00');
      const isLate = toMinutes(nowTime) > shiftStart + 5;
      const newRec: AttendanceRecord = {
        id: `att-${Date.now().toString().slice(-5)}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        shiftId: emp.assignedShiftId,
        date: today,
        checkInTime: nowTime,
        checkOutTime: null,
        status: isLate ? 'late' : 'present',
        overtimeMinutes: 0,
        isApproved: true,
      };
      const updated = [newRec, ...attendance];
      setAttendance(updated);
      setStored('attendance', updated);
      addAuditLog('CREATE', 'Attendance', newRec.id, `تسجيل حضور الموظف ${emp.fullName} في ${nowTime}`);
      showToast(`تم تسجيل حضور ${emp.fullName} الساعة ${nowTime}${isLate ? ' مع تسجيل التأخير' : ''}`, 'success');
    }
  };

  // Maintenance Management
  const createMaintenanceRecord = (rec: Omit<MaintenanceRecord, 'id' | 'recordNumber'>) => {
    if (!canPerform('create_maintenance')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية فتح أمر صيانة فني.', 'error');
      return;
    }
    const id = `maint-${Date.now().toString().slice(-4)}`;
    const recordNumber = `MAINT-2026-0${maintenanceRecords.length + 90}`;
    const newRec: MaintenanceRecord = { ...rec, id, recordNumber };
    const updated = [newRec, ...maintenanceRecords];
    setMaintenanceRecords(updated);
    setStored('maint', updated);

    // Keep fleet availability synchronized with active maintenance records and persist it.
    if (rec.status === 'in_progress' || rec.severity === 'critical') {
      const nextVehicles = vehicles.map((v) =>
        v.id === rec.vehicleOrEquipmentId
          ? { ...v, availability: rec.severity === 'critical' ? 'out_of_service' as const : 'under_maintenance' as const, defectsNote: rec.defectDescription }
          : v
      );
      setVehicles(nextVehicles);
      setStored('vehicles', nextVehicles);
    }

    addAuditLog('CREATE', 'MaintenanceRecord', recordNumber, `فتح أمر صيانة: ${rec.defectDescription}`);
    showToast(`تم إصدار أمر الصيانة ${recordNumber}`, 'success');
  };

  const updateMaintenanceRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    if (!canPerform('edit_maintenance')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية تعديل سجلات الصيانة.', 'error');
      return;
    }
    const updated = maintenanceRecords.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMaintenanceRecords(updated);
    setStored('maint', updated);

    // Synchronize fleet state only when no other active maintenance order remains.
    const changedRecord = maintenanceRecords.find((m) => m.id === id);
    if (changedRecord && (updates.status === 'completed' || updates.status === 'cancelled')) {
      const hasOtherActiveOrder = maintenanceRecords.some((m) =>
        m.id !== id && m.vehicleOrEquipmentId === changedRecord.vehicleOrEquipmentId && !['completed', 'cancelled'].includes(m.status)
      );
      if (!hasOtherActiveOrder) {
        const currentVehicle = vehicles.find((v) => v.id === changedRecord.vehicleOrEquipmentId);
        // Do not silently restore an explicitly out-of-service vehicle after cancelling a work order.
        if (currentVehicle && currentVehicle.availability !== 'out_of_service') {
          const nextVehicles = vehicles.map((v) => v.id === changedRecord.vehicleOrEquipmentId
            ? { ...v, availability: 'available' as const, defectsNote: undefined }
            : v
          );
          setVehicles(nextVehicles);
          setStored('vehicles', nextVehicles);
        }
      }
    } else if (changedRecord && updates.status === 'in_progress') {
      const nextVehicles = vehicles.map((v) => v.id === changedRecord.vehicleOrEquipmentId
        ? { ...v, availability: changedRecord.severity === 'critical' ? 'out_of_service' as const : 'under_maintenance' as const, defectsNote: changedRecord.defectDescription }
        : v
      );
      setVehicles(nextVehicles);
      setStored('vehicles', nextVehicles);
    }

    addAuditLog('UPDATE', 'MaintenanceRecord', id, `تحديث قيد الصيانة ${id}`);
    showToast('تم تحديث سجل الصيانة بنجاح', 'success');
  };

  // Fuel & Inventory
  const createFuelTransaction = (tx: Omit<FuelTransaction, 'id' | 'receiptNumber'>) => {
    if (!canPerform('create_fuel')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية تسجيل وصولات الوقود.', 'error');
      return;
    }
    const id = `fuel-${Date.now().toString().slice(-4)}`;
    const receiptNumber = `FUEL-2026-11${fuelTransactions.length + 10}`;
    const newTx: FuelTransaction = { ...tx, id, receiptNumber };
    const updated = [newTx, ...fuelTransactions];
    setFuelTransactions(updated);
    setStored('fuel', updated);
    addAuditLog('CREATE', 'FuelTransaction', receiptNumber, `تسجيل صرف وقود: ${tx.quantityLiters} لتر لـ ${tx.vehiclePlateOrAsset}`);
    showToast(`تم تقييد وصل الوقود ${receiptNumber} بنجاح`, 'success');
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    if (!canPerform('update_inventory')) {
      showToast('عذراً! لا يمتلك المستخدم العادي صلاحية تعديل المواد المخزنية.', 'error');
      return;
    }
    const updated = inventory.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInventory(updated);
    setStored('inventory', updated);
    addAuditLog('UPDATE', 'InventoryItem', id, `تعديل بيانات المادة المخزنية`);
    showToast('تم تحديث بيانات المخزن بنجاح', 'success');
  };

  const recordStockMovement = (mov: Omit<InventoryMovement, 'id' | 'date'>): boolean => {
    if (!canPerform('issue_inventory')) {
      showToast('ليس لديك صلاحية صرف أو تعديل حركة المخزون.', 'error');
      return false;
    }
    const item = inventory.find((i) => i.id === mov.itemId);
    if (!item) return false;

    if (mov.movementType === 'out' && item.currentStock < mov.quantity) {
      showToast(`الرصيد المتبقي (${item.currentStock}) لا يكفي لصرف كمية (${mov.quantity})!`, 'error');
      return false;
    }

    const newStock = mov.movementType === 'in' ? item.currentStock + mov.quantity : item.currentStock - mov.quantity;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMov: InventoryMovement = {
      ...mov,
      id: `mov-${Date.now().toString().slice(-4)}`,
      date: now,
    };

    const updatedInv = inventory.map((i) => (i.id === mov.itemId ? { ...i, currentStock: newStock } : i));
    setInventory(updatedInv);
    setStored('inventory', updatedInv);

    const updatedMovs = [newMov, ...inventoryMovements];
    setInventoryMovements(updatedMovs);
    setStored('movements', updatedMovs);

    // Alert if below minimum threshold
    if (newStock <= item.minThreshold) {
      const alertNotif: NotificationItem = {
        id: `notif-${Date.now().toString().slice(-4)}`,
        title: `تنبيه رصيد حرج: ${item.nameAr}`,
        message: `وصل الرصيد المخزني للمادة إلى (${newStock} ${item.unit}) وهو أدنى من حد الإنذار (${item.minThreshold}).`,
        category: 'alert',
        severity: 'warning',
        timestamp: now,
        isRead: false,
        linkModule: 'fuel-inventory',
      };
      setNotifications((prev) => [alertNotif, ...prev]);
    }

    addAuditLog('UPDATE', 'InventoryMovement', newMov.referenceNumber, `حركة مخزنية (${mov.movementType}) للمادة: ${item.nameAr}`);
    showToast(`تم قيد الحركة المخزنية بنجاح، الرصيد الحالي: ${newStock} ${item.unit}`, 'success');
    return true;
  };

  // Station Operations
  const updatePumpStatus = (pumpId: string, status: StationPump['status']) => {
    if (!canPerform('update_station_pumps')) {
      showToast('تغيير تشغيل المضخات يتطلب صلاحية المشرف الهندسي.', 'error');
      return;
    }
    const updated = stationPumps.map((p) => {
      if (p.id === pumpId) {
        return {
          ...p,
          status,
          currentFlowM3H: status === 'running' ? p.capacityM3H * 0.95 : 0,
        };
      }
      return p;
    });
    setStationPumps(updated);
    setStored('pumps', updated);

    // Calculate total flow
    const totalFlow = updated.reduce((sum, p) => sum + p.currentFlowM3H, 0);
    setStationTelemetry((prev) => {
      const upTel = { ...prev, totalFlowRateM3H: Math.round(totalFlow) };
      setStored('telemetry', upTel);
      return upTel;
    });

    addAuditLog('STATUS_CHANGE', 'StationPump', pumpId, `تعديل حالة المضخة إلى: ${status}`);
    showToast('تم تعديل تشغيل المضخة بنجاح', 'success');
  };

  const updateStationTelemetry = (data: Partial<StationTelemetry>) => {
    if (!canPerform('record_telemetry')) {
      showToast('ليس لديك صلاحية تسجيل قراءات المحطة.', 'error');
      return;
    }
    const updated: StationTelemetry = {
      ...stationTelemetry,
      ...data,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      recordedBy: currentUser.name,
    };
    setStationTelemetry(updated);
    setStored('telemetry', updated);
    addAuditLog('UPDATE', 'StationTelemetry', updated.id, 'تسجيل قراءات حوض الرفع والتدفق في السجل اليومي');
    showToast('تم حفظ قراءات المحطة وسجل التشغيل اليومي', 'success');
  };

  // Administrative Correspondence
  const createDocument = (doc: Omit<AdministrativeDocument, 'id' | 'refNumber' | 'issueDate' | 'status'>) => {
    if (!canPerform('issue_document')) {
      showToast('إصدار الكتب الرسمية يتطلب صلاحية الإدارة أو الموارد البشرية.', 'error');
      return;
    }
    const id = `doc-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString().substring(0, 10);
    const refSeq = 109 + documents.length;
    const refNumber = doc.category === 'official_order'
      ? `أمر إداري / ك / ${refSeq} / 2026`
      : doc.category === 'circular'
      ? `تعميم داخلي / مجاري / ${refSeq} / 2026`
      : `كتاب رسمي / ${refSeq} / 2026`;

    const newDoc: AdministrativeDocument = {
      ...doc,
      id,
      refNumber,
      issueDate: now,
      status: 'issued',
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    setStored('documents', updated);
    addAuditLog('CREATE', 'AdministrativeDocument', refNumber, `إصدار وثيقة رسمية: ${doc.title}`);
    showToast(`تم إصدار الوثيقة برقم مرجعي: ${refNumber}`, 'success');
  };

  const updateDocumentStatus = (id: string, status: AdministrativeDocument['status']) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, status } : d));
    setDocuments(updated);
    setStored('documents', updated);
    addAuditLog('STATUS_CHANGE', 'AdministrativeDocument', id, `تحديث حالة الوثيقة إلى: ${status}`);
    showToast('تم تحديث حالة الوثيقة الإدارية', 'success');
  };

  const acknowledgeDocument = (id: string) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, acknowledgedCount: (d.acknowledgedCount || 0) + 1 } : d));
    setDocuments(updated);
    setStored('documents', updated);
    addAuditLog('UPDATE', 'AdministrativeDocument', id, `تأكيد قراءة وتوقيع استلام الوثيقة`);
    showToast('تم توقيع تأكيد الاستلام والعلم بمضمون الكتاب', 'success');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    setStored('notifs', updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    setStored('notifs', updated);
    showToast('تم تحديد جميع الإشعارات كمقروءة', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StationSettings>) => {
    if (!canPerform('edit_settings')) {
      showToast('تعديل إعدادات المحطة محصور بمدير النظام العام.', 'error');
      return;
    }
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setStored('settings', updated);
    addAuditLog('UPDATE', 'StationSettings', 'SYSTEM', 'تعديل المعايير التشغيلية للنظام');
    showToast('تم حفظ الإعدادات بنجاح', 'success');
  };

  // Reset Demo Data
  const resetDemoData = () => {
    if (!isAdmin) {
      showToast('إعادة ضبط البيانات محصورة بمدير النظام العام (Administrator) فقط.', 'error');
      return;
    }
    localStorage.removeItem(STORAGE_PREFIX + 'work_orders');
    localStorage.removeItem(STORAGE_PREFIX + 'employees');
    localStorage.removeItem(STORAGE_PREFIX + 'attendance');
    localStorage.removeItem(STORAGE_PREFIX + 'vehicles');
    localStorage.removeItem(STORAGE_PREFIX + 'maint');
    localStorage.removeItem(STORAGE_PREFIX + 'fuel');
    localStorage.removeItem(STORAGE_PREFIX + 'inventory');
    localStorage.removeItem(STORAGE_PREFIX + 'movements');
    localStorage.removeItem(STORAGE_PREFIX + 'pumps');
    localStorage.removeItem(STORAGE_PREFIX + 'telemetry');
    localStorage.removeItem(STORAGE_PREFIX + 'documents');
    localStorage.removeItem(STORAGE_PREFIX + 'notifs');
    localStorage.removeItem(STORAGE_PREFIX + 'audit');
    localStorage.removeItem(STORAGE_PREFIX + 'settings');

    setWorkOrders(INITIAL_WORK_ORDERS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setVehicles(INITIAL_VEHICLES);
    setMaintenanceRecords(INITIAL_MAINTENANCE);
    setFuelTransactions(INITIAL_FUEL_TRANSACTIONS);
    setInventory(INITIAL_INVENTORY);
    setInventoryMovements(INITIAL_MOVEMENTS);
    setStationPumps(INITIAL_PUMPS);
    setStationTelemetry(INITIAL_TELEMETRY);
    setDocuments(INITIAL_DOCUMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOG);
    setSettings(INITIAL_SETTINGS);

    showToast('تمت استعادة البيانات الافتراضية التجريبية بنجاح', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        login,
        logout,
        currentUser,
        allUsers: DEMO_USERS,
        switchRole,
        language,
        setLanguage,
        theme,
        setTheme,
        activeModule,
        setActiveModule,
        selectedTicketId,
        setSelectedTicketId,
        settings,
        updateSettings,
        workOrders,
        createWorkOrder,
        updateWorkOrderStatus,
        updateWorkOrder,
        employees,
        createEmployee,
        updateEmployee,
        addDisciplinaryRecord,
        shifts,
        attendance,
        requestAttendanceCorrection,
        approveAttendanceCorrection,
        clockInEmployee,
        setAttendanceStatus,
        vehicles,
        updateVehicle,
        createVehicle,
        maintenanceRecords,
        createMaintenanceRecord,
        updateMaintenanceRecord,
        fuelTransactions,
        createFuelTransaction,
        inventory,
        inventoryMovements,
        updateInventoryItem,
        recordStockMovement,
        stationPumps,
        updatePumpStatus,
        stationTelemetry,
        updateStationTelemetry,
        documents,
        createDocument,
        updateDocumentStatus,
        acknowledgeDocument,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        addAuditLog,
        canPerform,
        resetDemoData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
