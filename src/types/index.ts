export type UserRole =
  | 'super_admin'
  | 'normal_user'
  | 'station_manager'
  | 'shift_supervisor'
  | 'dispatcher'
  | 'engineer'
  | 'driver_worker'
  | 'hr_officer'
  | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitleAr: string;
  roleTitleEn: string;
  avatar?: string;
  department: string;
  phone: string;
  isAdmin?: boolean;
}

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketStatus =
  | 'new'
  | 'reviewed'
  | 'assigned'
  | 'accepted'
  | 'en_route'
  | 'on_site'
  | 'in_progress'
  | 'awaiting_materials'
  | 'completed'
  | 'verified'
  | 'cancelled';

export type TicketType =
  | 'sewage_overflow'
  | 'blocked_sewer'
  | 'network_cleaning'
  | 'suction_service'
  | 'jetting_service'
  | 'pump_failure'
  | 'emergency_maintenance'
  | 'inspection'
  | 'other';

export interface StatusHistoryEntry {
  status: TicketStatus;
  timestamp: string;
  actor: string;
  role: string;
  note?: string;
}

export interface WorkOrder {
  id: string;
  ticketNumber: string;
  type: TicketType;
  title: string;
  description: string;
  governorate: string;
  area: string;
  neighborhood: string;
  street: string;
  landmark?: string;
  coordinates?: { lat: number; lng: number };
  reporterName?: string;
  reporterPhone?: string;
  createdAt: string;
  updatedAt: string;
  priority: TicketPriority;
  assignedTeam?: string;
  /** Demo-mode employee links used for per-employee performance reporting. */
  assignedEmployeeIds?: string[];
  assignedVehicleId?: string;
  supervisorId?: string;
  status: TicketStatus;
  completionNotes?: string;
  cancellationReason?: string;
  statusHistory: StatusHistoryEntry[];
  estimatedHours?: number;
  actualHours?: number;
  /** Optional planned completion date/time used for overdue indicators. */
  dueDate?: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'seconded' | 'suspended';

export interface DisciplinaryRecord {
  id: string;
  date: string;
  reason: string;
  actionTaken: string;
  issuedBy: string;
  confidential: boolean;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  supervisorName: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  qualifications: string;
  assignedShiftId: string;
  nationalIdMasked: string;
  joinDate: string;
  emergencyContact: string;
  confidentialNotes?: string;
  archived?: boolean; // Retain historical references when removed from active staff directory
  disciplinaryRecords: DisciplinaryRecord[];
  completedWorkOrdersCount: number;
  attendanceRatePercent: number;
  /** Optional manually entered technical supervisor appraisal (1–5). */
  technicalSupervisorRating?: number;
  technicalSupervisorNotes?: string;
  technicalSupervisorRatedBy?: string;
  technicalSupervisorRatedAt?: string;
}

export interface ShiftDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  startTime: string;
  endTime: string;
  descriptionAr: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'late' | 'absent' | 'excused' | 'leave';
  overtimeMinutes: number;
  notes?: string;
  manualEditRequested?: boolean;
  manualCorrectionNote?: string;
  approvedBy?: string;
  isApproved: boolean;
  leaveType?: 'annual' | 'sick' | 'emergency' | 'official_mission';
  updatedBy?: string;
  updatedAt?: string;
}

export type VehicleCategory =
  | 'suction_truck'
  | 'jetting_truck'
  | 'tanker'
  | 'excavator'
  | 'mobile_pump'
  | 'generator'
  | 'utility_pickup'
  | 'other';

export type VehicleAvailability =
  | 'available'
  | 'assigned'
  | 'under_maintenance'
  | 'out_of_service';

export interface Vehicle {
  id: string;
  assetNumber: string;
  plateNumber: string;
  category: VehicleCategory;
  categoryNameAr: string;
  makeModel: string;
  modelYear: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  condition: 'excellent' | 'good' | 'fair' | 'critical';
  availability: VehicleAvailability;
  mileageOrHours: number;
  lastInspectionDate: string;
  nextServiceDueDate: string;
  fuelType: 'diesel' | 'gasoline';
  tankCapacityLiters: number;
  currentFuelPercent: number;
  defectsNote?: string;
}

export type MaintenanceSeverity = 'routine' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  recordNumber: string;
  vehicleOrEquipmentId: string;
  vehicleAssetNumber: string;
  vehicleMakeModel: string;
  defectDescription: string;
  severity: MaintenanceSeverity;
  assignedTechnicianName: string;
  partsUsed: string[];
  partsCostIqd: number;
  laborCostIqd: number;
  downtimeHours: number;
  maintenanceDate: string;
  nextServiceDueDate: string;
  status: MaintenanceStatus;
  technicianNotes?: string;
}

export interface FuelTransaction {
  id: string;
  receiptNumber: string;
  vehicleOrEquipmentId: string;
  vehiclePlateOrAsset: string;
  quantityLiters: number;
  meterReading: number;
  date: string;
  stationOrSupplier: string;
  authorizedCostIqd: number;
  recordedBy: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  unitPriceIqd: number;
  locationShelf: string;
  lastRestockedDate: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemNameAr: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceNumber: string;
  recipientOrSupplier: string;
  date: string;
  approvedBy: string;
}

export interface MaterialRequisition {
  id: string;
  requisitionNumber: string;
  requestedBy: string;
  department: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  purpose: string;
  urgency: 'normal' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  createdAt: string;
  approvalNotes?: string;
}

export interface StationPump {
  id: string;
  code: string;
  nameAr: string;
  status: 'running' | 'standby' | 'maintenance' | 'tripped';
  capacityM3H: number;
  currentFlowM3H: number;
  temperatureCelsius: number;
  vibrationMmS: number;
  operatingHours: number;
  lastServiceDate: string;
}

export interface StationEquipmentRecord {
  id: string;
  category: 'pump' | 'generator';
  nameAr: string;
  manufacturer?: string;
  serialNumber?: string;
  motorKw?: number;
  dischargeM3S?: number;
  diameterMm?: number;
  sizeLabel?: string;
  quantity?: number;
  capacityKva?: number;
  condition: string;
  notes?: string;
  updatedAt?: string;
}

export interface StationTelemetry {
  id: string;
  timestamp: string;
  recordedBy: string;
  wetWellLevelMeters: number;
  maxWetWellLevelMeters: number;
  totalFlowRateM3H: number;
  powerSource: 'national_grid' | 'backup_generator' | 'hybrid';
  gridVoltage: number;
  generatorRunning: boolean;
  generatorFuelPercent: number;
  gritScreensClean: boolean;
  odorTreatmentActive: boolean;
  operatorNotes: string;
}

export type DocumentCategory =
  | 'circular'
  | 'official_order'
  | 'official_letter'
  | 'memorandum'
  | 'leave_request'
  | 'material_request'
  | 'announcement';

export interface AdministrativeDocument {
  id: string;
  refNumber: string;
  title: string;
  category: DocumentCategory;
  categoryAr: string;
  issueDate: string;
  issuerName: string;
  issuerRole: string;
  targetDepartment: string;
  content: string;
  status: 'draft' | 'issued' | 'approved' | 'archived';
  requiresAcknowledgement: boolean;
  acknowledgedCount?: number;
  totalRecipientsCount?: number;
  isConfidential: boolean;
  attachments?: { name: string; dataUrl: string; mimeType: string }[]; // Local prototype only
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'ticket' | 'maintenance' | 'approval' | 'announcement' | 'alert';
  severity: 'info' | 'warning' | 'urgent';
  timestamp: string;
  isRead: boolean;
  linkModule?: string;
  linkId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'RESET';
  targetEntity: string;
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface StationSettings {
  stationNameAr: string;
  stationNameEn: string;
  subTitleAr: string;
  directorName: string;
  contactPhone: string;
  emergencyHotline: string;
  addressAr: string;
  coordinates: { lat: number; lng: number };
  systemVersion: string;
  demoModeNotice: boolean;
  maintenanceWarningThresholdHours: number;
  lowStockAlertEnabled: boolean;
}
