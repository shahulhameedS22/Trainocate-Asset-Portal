import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Asset, 
  BorrowRecord, 
  Issue, 
  MaintenanceRecord, 
  AssetRequest, 
  AuditLog, 
  Employee, 
  AssetCondition, 
  RequestStatus,
  AssetStatus
} from '../types';
import { 
  INITIAL_ASSETS, 
  INITIAL_BORROWS, 
  INITIAL_ISSUES, 
  INITIAL_MAINTENANCE, 
  INITIAL_REQUESTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_EMPLOYEES 
} from '../data/initialData';
import { useAuth } from './AuthContext';

interface AssetContextType {
  assets: Asset[];
  borrows: BorrowRecord[];
  issues: Issue[];
  maintenance: MaintenanceRecord[];
  requests: AssetRequest[];
  auditLogs: AuditLog[];
  employees: Employee[];
  loading: boolean;
  
  // Stats
  totalAssetsCount: number;
  assignedCount: number;
  availableCount: number;
  inMaintenanceCount: number;
  totalAssetValue: number;
  overdueBorrowsCount: number;
  openIssuesCount: number;

  // Actions
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => Promise<string>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  borrowAsset: (
    assetId: string, 
    borrowerName: string, 
    borrowerEmail: string, 
    dueDate: string, 
    notes?: string,
    borrowerDept?: string
  ) => Promise<void>;
  
  returnAsset: (
    borrowId: string, 
    returnCondition: AssetCondition, 
    notes?: string
  ) => Promise<void>;
  
  addIssue: (issue: Omit<Issue, 'id' | 'reportedAt'>) => Promise<string>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  
  scheduleMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => Promise<string>;
  completeMaintenance: (id: string, cost?: number, notes?: string) => Promise<void>;
  
  submitRequest: (req: Omit<AssetRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  addRequest: (req: Omit<AssetRequest, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateRequestStatus: (id: string, status: RequestStatus, adminNotes?: string) => Promise<void>;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<string>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  
  importAssets: (newAssets: Array<Omit<Asset, 'id' | 'createdAt'>>) => Promise<number>;
  seedSampleData: (force?: boolean) => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  const [assets, setAssets] = useState<Asset[]>(() => {
    const cached = localStorage.getItem('assetportal_assets');
    return cached ? JSON.parse(cached) : INITIAL_ASSETS;
  });

  const [borrows, setBorrows] = useState<BorrowRecord[]>(() => {
    const cached = localStorage.getItem('assetportal_borrows');
    return cached ? JSON.parse(cached) : INITIAL_BORROWS;
  });

  const [issues, setIssues] = useState<Issue[]>(() => {
    const cached = localStorage.getItem('assetportal_issues');
    return cached ? JSON.parse(cached) : INITIAL_ISSUES;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const cached = localStorage.getItem('assetportal_maintenance');
    return cached ? JSON.parse(cached) : INITIAL_MAINTENANCE;
  });

  const [requests, setRequests] = useState<AssetRequest[]>(() => {
    const cached = localStorage.getItem('assetportal_requests');
    return cached ? JSON.parse(cached) : INITIAL_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const cached = localStorage.getItem('assetportal_audit');
    return cached ? JSON.parse(cached) : INITIAL_AUDIT_LOGS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const cached = localStorage.getItem('assetportal_employees');
    return cached ? JSON.parse(cached) : INITIAL_EMPLOYEES;
  });

  const [loading, setLoading] = useState(true);

  // Sync to localStorage as high-performance local mirror
  useEffect(() => {
    localStorage.setItem('assetportal_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('assetportal_borrows', JSON.stringify(borrows));
  }, [borrows]);

  useEffect(() => {
    localStorage.setItem('assetportal_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('assetportal_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('assetportal_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('assetportal_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('assetportal_employees', JSON.stringify(employees));
  }, [employees]);

  // Realtime listeners to Firestore collections (only attach when user is authenticated)
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubAssets = onSnapshot(
      collection(db, 'assets'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Asset[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Asset));
          setAssets(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'assets');
      }
    );

    const unsubBorrows = onSnapshot(
      collection(db, 'borrows'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BorrowRecord[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as BorrowRecord));
          setBorrows(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'borrows');
      }
    );

    const unsubIssues = onSnapshot(
      collection(db, 'issues'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Issue[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Issue));
          setIssues(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'issues');
      }
    );

    const unsubMaintenance = onSnapshot(
      collection(db, 'maintenance'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: MaintenanceRecord[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as MaintenanceRecord));
          setMaintenance(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'maintenance');
      }
    );

    const unsubRequests = onSnapshot(
      collection(db, 'requests'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AssetRequest[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as AssetRequest));
          setRequests(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'requests');
      }
    );

    const unsubEmployees = onSnapshot(
      collection(db, 'employees'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Employee[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Employee));
          setEmployees(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'employees');
      }
    );

    const unsubLogs = onSnapshot(
      collection(db, 'auditLogs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AuditLog[] = [];
          snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as AuditLog));
          setAuditLogs(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'auditLogs');
      }
    );

    setLoading(false);

    return () => {
      unsubAssets();
      unsubBorrows();
      unsubIssues();
      unsubMaintenance();
      unsubRequests();
      unsubEmployees();
      unsubLogs();
    };
  }, [currentUser]);

  // Helper to log audit actions
  const logAudit = async (action: string, entityType: AuditLog['entityType'], entityId: string, details: string) => {
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLog: AuditLog = {
      id,
      action,
      entityType,
      entityId,
      details,
      performedBy: userProfile?.uid || 'system',
      performedByName: userProfile?.displayName || 'User',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'auditLogs', id), newLog);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `auditLogs/${id}`);
      }
    }
  };

  // Seed data function
  const seedSampleData = async (force: boolean = false) => {
    if (!force && assets.length > 0) return;
    if (currentUser) {
      try {
        const batch = writeBatch(db);
        INITIAL_ASSETS.forEach((a) => {
          batch.set(doc(db, 'assets', a.id), a);
        });
        INITIAL_BORROWS.forEach((b) => {
          batch.set(doc(db, 'borrows', b.id), b);
        });
        INITIAL_ISSUES.forEach((i) => {
          batch.set(doc(db, 'issues', i.id), i);
        });
        INITIAL_MAINTENANCE.forEach((m) => {
          batch.set(doc(db, 'maintenance', m.id), m);
        });
        INITIAL_REQUESTS.forEach((r) => {
          batch.set(doc(db, 'requests', r.id), r);
        });
        INITIAL_EMPLOYEES.forEach((e) => {
          batch.set(doc(db, 'employees', e.id), e);
        });
        INITIAL_AUDIT_LOGS.forEach((l) => {
          batch.set(doc(db, 'auditLogs', l.id), l);
        });
        await batch.commit();
      } catch (err) {
        console.warn('Batch seed to Firestore error, local data active:', err);
      }
    }
    setAssets(INITIAL_ASSETS);
    setBorrows(INITIAL_BORROWS);
    setIssues(INITIAL_ISSUES);
    setMaintenance(INITIAL_MAINTENANCE);
    setRequests(INITIAL_REQUESTS);
    setEmployees(INITIAL_EMPLOYEES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  // Actions
  const addAsset = async (assetData: Omit<Asset, 'id' | 'createdAt'>): Promise<string> => {
    const id = `ast-${Date.now()}`;
    const newAsset: Asset = {
      ...assetData,
      id,
      createdAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'assets', id), newAsset);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `assets/${id}`);
      }
    }
    await logAudit('Asset Created', 'asset', id, `Registered new asset ${newAsset.name} (${newAsset.assetTag})`);
    return id;
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'assets', id), updated);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `assets/${id}`);
      }
    }
    await logAudit('Asset Updated', 'asset', id, `Updated asset fields: ${Object.keys(updates).join(', ')}`);
  };

  const deleteAsset = async (id: string) => {
    const target = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'assets', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `assets/${id}`);
      }
    }
    await logAudit('Asset Deleted', 'asset', id, `Deleted asset ${target?.name || id}`);
  };

  const borrowAsset = async (
    assetId: string, 
    borrowerName: string, 
    borrowerEmail: string, 
    dueDate: string, 
    notes?: string,
    borrowerDept?: string
  ) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) throw new Error('Asset not found');

    const borrowId = `brw-${Date.now()}`;
    const newBorrow: BorrowRecord = {
      id: borrowId,
      assetId,
      assetTag: asset.assetTag,
      assetName: asset.name,
      borrowerName,
      borrowerEmail,
      borrowerDepartment: borrowerDept,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'active',
      conditionOut: asset.condition,
      notes,
      createdAt: new Date().toISOString(),
    };

    setBorrows((prev) => [newBorrow, ...prev]);
    await updateAsset(assetId, { 
      status: 'borrowed', 
      assignedToName: borrowerName,
      location: `Loaned: ${borrowerName}`
    });

    if (currentUser) {
      try {
        await setDoc(doc(db, 'borrows', borrowId), newBorrow);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `borrows/${borrowId}`);
      }
    }

    await logAudit(
      'Asset Borrowed', 
      'borrow', 
      borrowId, 
      `${asset.name} (${asset.assetTag}) checked out to ${borrowerName} until ${dueDate}`
    );
  };

  const returnAsset = async (
    borrowId: string, 
    returnCondition: AssetCondition, 
    notes?: string
  ) => {
    const borrow = borrows.find((b) => b.id === borrowId);
    if (!borrow) throw new Error('Borrow record not found');

    const returnDate = new Date().toISOString().split('T')[0];
    const updatedBorrow: Partial<BorrowRecord> = {
      status: 'returned',
      returnDate,
      conditionIn: returnCondition,
      notes: notes ? `${borrow.notes || ''} | Return: ${notes}` : borrow.notes,
    };

    setBorrows((prev) => prev.map((b) => (b.id === borrowId ? { ...b, ...updatedBorrow } : b)));
    
    // Return asset back to available (or maintenance if poor condition)
    const newAssetStatus: AssetStatus = returnCondition === 'poor' ? 'maintenance' : 'available';
    await updateAsset(borrow.assetId, {
      status: newAssetStatus,
      condition: returnCondition,
      assignedToName: undefined,
      assignedToUserId: undefined,
      location: 'IT Storage Room 102',
    });

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'borrows', borrowId), updatedBorrow);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `borrows/${borrowId}`);
      }
    }

    await logAudit(
      'Asset Returned', 
      'borrow', 
      borrowId, 
      `${borrow.assetName} returned in ${returnCondition} condition by ${borrow.borrowerName}`
    );
  };

  const addIssue = async (issueData: Omit<Issue, 'id' | 'reportedAt'>): Promise<string> => {
    const id = `iss-${Date.now()}`;
    const newIssue: Issue = {
      ...issueData,
      id,
      reportedAt: new Date().toISOString(),
    };
    setIssues((prev) => [newIssue, ...prev]);

    // If critical priority, optionally set asset to maintenance
    if (issueData.priority === 'critical') {
      await updateAsset(issueData.assetId, { status: 'maintenance' });
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, 'issues', id), newIssue);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `issues/${id}`);
      }
    }

    await logAudit('Issue Reported', 'issue', id, `Issue logged on ${issueData.assetName}: ${issueData.title}`);
    return id;
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'issues', id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `issues/${id}`);
      }
    }
    await logAudit('Issue Updated', 'issue', id, `Updated issue status/details: ${updates.status || ''}`);
  };

  const scheduleMaintenance = async (recordData: Omit<MaintenanceRecord, 'id'>): Promise<string> => {
    const id = `mnt-${Date.now()}`;
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id,
    };
    setMaintenance((prev) => [newRecord, ...prev]);
    await updateAsset(recordData.assetId, { status: 'maintenance' });

    if (currentUser) {
      try {
        await setDoc(doc(db, 'maintenance', id), newRecord);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `maintenance/${id}`);
      }
    }

    await logAudit(
      'Maintenance Scheduled', 
      'maintenance', 
      id, 
      `Scheduled ${recordData.type} for ${recordData.assetName} on ${recordData.scheduledDate}`
    );
    return id;
  };

  const completeMaintenance = async (id: string, cost?: number, notes?: string) => {
    const target = maintenance.find((m) => m.id === id);
    if (!target) return;

    const completedDate = new Date().toISOString().split('T')[0];
    const updates: Partial<MaintenanceRecord> = {
      status: 'completed',
      completedDate,
      cost: cost !== undefined ? cost : target.cost,
      notes: notes ? `${target.notes || ''} | Completed: ${notes}` : target.notes,
    };

    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    await updateAsset(target.assetId, { status: 'available', condition: 'good' });

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'maintenance', id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `maintenance/${id}`);
      }
    }

    await logAudit(
      'Maintenance Completed', 
      'maintenance', 
      id, 
      `Maintenance completed for ${target.assetName}. Asset returned to Available.`
    );
  };

  const submitRequest = async (reqData: Omit<AssetRequest, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const id = `req-${Date.now()}`;
    const newReq: AssetRequest = {
      ...reqData,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'requests', id), newReq);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `requests/${id}`);
      }
    }
    await logAudit('Request Submitted', 'request', id, `New asset request: ${reqData.assetType} by ${reqData.requesterName}`);
    return id;
  };

  const updateRequestStatus = async (id: string, status: RequestStatus, adminNotes?: string) => {
    const updates: Partial<AssetRequest> = { status, adminNotes };
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'requests', id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `requests/${id}`);
      }
    }
    await logAudit('Request Status Changed', 'request', id, `Asset request marked as ${status}`);
  };

  const addEmployee = async (empData: Omit<Employee, 'id'>): Promise<string> => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...empData,
      id,
    };
    setEmployees((prev) => [...prev, newEmp]);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'employees', id), newEmp);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `employees/${id}`);
      }
    }
    await logAudit('Employee Added', 'user', id, `Added ${newEmp.name} to employee directory`);
    return id;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    if (currentUser) {
      try {
        await updateDoc(doc(db, 'employees', id), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `employees/${id}`);
      }
    }
  };

  const importAssets = async (newAssetsData: Array<Omit<Asset, 'id' | 'createdAt'>>): Promise<number> => {
    const batch = writeBatch(db);
    const addedAssets: Asset[] = [];

    newAssetsData.forEach((data, index) => {
      const id = `ast-imp-${Date.now()}-${index}`;
      const asset: Asset = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
      };
      addedAssets.push(asset);
      batch.set(doc(db, 'assets', id), asset);
    });

    if (currentUser) {
      try {
        await batch.commit();
      } catch (e) {
        console.warn('Batch import write error:', e);
      }
    }

    setAssets((prev) => [...addedAssets, ...prev]);
    await logAudit('Bulk Import', 'asset', 'batch', `Imported ${addedAssets.length} assets`);
    return addedAssets.length;
  };

  // Derived metrics
  const totalAssetsCount = assets.length;
  const assignedCount = assets.filter((a) => a.status === 'assigned').length;
  const availableCount = assets.filter((a) => a.status === 'available').length;
  const inMaintenanceCount = assets.filter((a) => a.status === 'maintenance').length;
  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  }, [assets]);

  // Check overdue borrows dynamically
  const overdueBorrowsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return borrows.filter((b) => b.status === 'overdue' || (b.status === 'active' && b.dueDate < today)).length;
  }, [borrows]);

  const openIssuesCount = useMemo(() => {
    return issues.filter((i) => i.status === 'open' || i.status === 'in_progress').length;
  }, [issues]);

  return (
    <AssetContext.Provider
      value={{
        assets,
        borrows,
        issues,
        maintenance,
        requests,
        auditLogs,
        employees,
        loading,
        totalAssetsCount,
        assignedCount,
        availableCount,
        inMaintenanceCount,
        totalAssetValue,
        overdueBorrowsCount,
        openIssuesCount,
        addAsset,
        updateAsset,
        deleteAsset,
        borrowAsset,
        returnAsset,
        addIssue,
        updateIssue,
        scheduleMaintenance,
        completeMaintenance,
        submitRequest,
        addRequest: submitRequest,
        updateRequestStatus,
        addEmployee,
        updateEmployee,
        importAssets,
        seedSampleData,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
