import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  MapPin, 
  Laptop, 
  X,
  Edit2
} from 'lucide-react';
import { useAssets } from '../../context/AssetContext';
import { useAuth } from '../../context/AuthContext';
import { Employee, UserRole } from '../../types';

export const ManageUsersView: React.FC = () => {
  const { employees, assets, addEmployee } = useAssets();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('HQ Floor 3 - Tech Wing');
  const [role, setRole] = useState<UserRole>('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Count assigned assets per employee
  const employeeAssetCounts = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      if (a.assignedToUserId) {
        map[a.assignedToUserId] = (map[a.assignedToUserId] || 0) + 1;
      }
    });
    return map;
  }, [assets]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.department.toLowerCase().includes(search.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === 'all' || (emp.role || 'staff') === roleFilter;
      return matchSearch && matchRole;
    });
  }, [employees, search, roleFilter]);

  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await addEmployee({
        name,
        email,
        department,
        jobTitle: jobTitle || 'Specialist',
        location,
        role,
        status: 'active',
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setJobTitle('');
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Employee Directory & User Roles</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage company personnel, custodian assignments, and administrative access permissions
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee / User</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-xs text-slate-200 focus:outline-none capitalize"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="manager">IT Managers</option>
          <option value="staff">Staff Members</option>
        </select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const assignedCount = employeeAssetCounts[emp.id] || 0;

          return (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e2d4d] hover:border-indigo-500/40 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    (emp.role || 'staff') === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    (emp.role || 'staff') === 'manager' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                  }`}>
                    {emp.role || 'staff'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mt-3">{emp.name}</h3>
                <p className="text-xs text-slate-400">{emp.jobTitle}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-[#17233c] pt-3">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{emp.department}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                </div>
              </div>

              {/* Custody summary */}
              <div className="mt-4 pt-3 border-t border-[#17233c] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-blue-400" />
                  <span>Assigned Hardware:</span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-200 bg-[#16233d] px-2 py-0.5 rounded">
                  {assignedCount} {assignedCount === 1 ? 'asset' : 'assets'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1628] border border-[#1e2d4d] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#192642]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add New Employee</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Martinez"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="liam.m@company.com"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Architect"
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Office Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-[#1d2a48] focus:border-indigo-500 rounded-xl text-slate-100 focus:outline-none capitalize"
                  >
                    <option value="staff">Staff (Standard)</option>
                    <option value="manager">Manager (Approvals)</option>
                    <option value="admin">Administrator (Full)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#192642] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141d30] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {isSubmitting ? 'Saving...' : 'Add Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
