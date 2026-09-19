import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { adminService } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import SkeletonTable from '../../components/ui/SkeletonTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

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
      const data = await adminService.getUsers({ search: debouncedSearch, role, limit: 50 });
      setUsers(data.users || data);
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
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-gray-400 mt-1">Manage volunteers, NGOs, and admins.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="" className="bg-gray-900">All Roles</option>
              <option value="volunteer" className="bg-gray-900">Volunteers</option>
              <option value="ngo" className="bg-gray-900">NGOs</option>
              <option value="admin" className="bg-gray-900">Admins</option>
            </select>
          </div>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonTable columns={5} rows={8} /></div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.profileImage} alt={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'primary' : user.role === 'ngo' ? 'warning' : 'default'} className="uppercase">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        <Badge variant={user.isActive !== false ? 'success' : 'error'}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={user.isActive !== false ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}
                            onClick={() => setActionDialog({ isOpen: true, id: user._id, isActive: user.isActive !== false })}
                          >
                            {user.isActive !== false ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
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
        </Card>
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
