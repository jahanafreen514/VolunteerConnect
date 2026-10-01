import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDateSafe } from '../../utils/date';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SkeletonTable from '../../components/ui/SkeletonTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';

// simple debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, id: null, isActive: true });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: debouncedSearch, role, limit: 50 });
      const list = res?.data?.users || res?.users || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setUsers(list);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, role]);

  const handleToggleStatus = async () => {
    try {
      await adminService.toggleUserStatus(actionDialog.id, !actionDialog.isActive);
      toast.success(`User ${!actionDialog.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionDialog({ isOpen: false, id: null, isActive: true });
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">User Management</h1>
            <p className="text-[#667085] mt-1 text-sm">Directory of registered volunteers, NGOs, and platform administrators.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-[#E6E8EC] rounded-xl pl-10 pr-4 py-2 text-[#354052] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none text-sm shadow-soft-sm transition-all"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2 text-[#354052] text-sm focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none shadow-soft-sm transition-all"
            >
              <option value="" className="text-[#667085]">All Roles</option>
              <option value="volunteer" className="text-[#354052]">Volunteers</option>
              <option value="ngo" className="text-[#354052]">NGOs</option>
              <option value="admin" className="text-[#354052]">Admins</option>
            </select>
          </div>
        </div>

        <div className="pastel-card overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={8} /></div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#354052]">
                <thead className="bg-[#F5F1FA]/80 text-[#667085] uppercase text-xs font-semibold border-b border-[#E6E8EC]">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EC]">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-[#F9FBF9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.profileImage} alt={user.name} size="sm" />
                          <div>
                            <p className="font-semibold text-[#354052]">{user.name}</p>
                            <p className="text-xs text-[#667085]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'primary' : user.role === 'ngo' ? 'warning' : 'default'} className="uppercase font-semibold text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[#667085]">{formatDateSafe(user.createdAt, 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.isActive !== false ? 'success' : 'error'} className="font-medium text-xs">
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={user.isActive !== false 
                              ? '!border-[#F2D6DD] !text-[#9A3445] hover:!bg-[#F2D6DD]/30 text-xs' 
                              : '!border-[#BFD8C2] !text-[#26372B] hover:!bg-[#D8EEE5] text-xs'}
                            onClick={() => setActionDialog({ isOpen: true, id: user._id, isActive: user.isActive !== false })}
                          >
                            {user.isActive !== false ? <UserX className="w-3.5 h-3.5 mr-1" /> : <UserCheck className="w-3.5 h-3.5 mr-1" />}
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState 
                title="No users found" 
                description="Adjust your search or filter criteria." 
                icon={User} 
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        title={`${actionDialog.isActive ? 'Deactivate' : 'Activate'} User`}
        message={`Are you sure you want to ${actionDialog.isActive ? 'deactivate' : 'activate'} this user? ${actionDialog.isActive ? 'They will not be able to log in.' : 'They will regain access to the platform.'}`}
        confirmText={actionDialog.isActive ? 'Deactivate' : 'Activate'}
        onConfirm={handleToggleStatus}
        onCancel={() => setActionDialog({ isOpen: false, id: null, isActive: true })}
        variant={actionDialog.isActive ? 'danger' : 'success'}
      />
    </DashboardLayout>
  );
};

export default Users;
