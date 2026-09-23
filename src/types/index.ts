export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  photoURL?: string;
  createdAt?: string;
}

export type AssetStatus = 'available' | 'assigned' | 'borrowed' | 'maintenance' | 'retired';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type AssetCategory = 
  | 'Laptops & MacBooks'
  | 'Monitors & Displays'
  | 'Phones & Mobile'
  | 'Tablets'
  | 'Servers & Networking'
  | 'Audio & Video'
  | 'Peripherals'
  | 'Software Licenses';

export interface Asset {
  id: string;
  assetTag: string; // e.g. AST-00102
  name: string;
  category: AssetCategory | string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assignedToUserId?: string;
  assignedToName?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyExpiry?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BorrowStatus = 'active' | 'returned' | 'overdue';

export interface BorrowRecord {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  borrowerId?: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerDepartment?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  conditionOut?: AssetCondition;
  conditionIn?: AssetCondition;
  notes?: string;
  createdAt: string;
}

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  reportedBy: string;
  reportedByName: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type MaintenanceType = 'routine' | 'repair' | 'upgrade' | 'inspection';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  title: string;
  type: MaintenanceType;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  technician: string;
  notes?: string;
  status: MaintenanceStatus;
}

export type RequestUrgency = 'low' | 'medium' | 'high' | 'urgent';
export type RequestPriority = RequestUrgency;
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

export interface AssetRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  department?: string;
  category?: string;
  item?: string;
  assetType: string;
  reason: string;
  urgency: RequestUrgency;
  priority?: RequestPriority;
  neededBy?: string;
  requestDate?: string;
  status: RequestStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string; // e.g. "Asset Created", "Asset Borrowed", "Asset Returned"
  entityType: 'asset' | 'borrow' | 'issue' | 'maintenance' | 'user' | 'request';
  entityId: string;
  details: string;
  performedBy: string;
  performedByName: string;
  userName?: string;
  timestamp: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  location: string;
  phone?: string;
  role?: UserRole;
  status: 'active' | 'inactive';
}
