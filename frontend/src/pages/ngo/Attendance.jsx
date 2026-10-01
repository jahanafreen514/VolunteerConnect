import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardCheck, Search, Users } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { opportunityService } from '../../services/opportunityService';
import { attendanceService } from '../../services/attendanceService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonTable from '../../components/ui/SkeletonTable';

const Attendance = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await opportunityService.getOpportunities({ isNgo: true, limit: 100 });
        const list = res?.data?.opportunities || res?.opportunities || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        setOpportunities(list);
      } catch (error) {
        toast.error('Failed to load opportunities');
      }
    };
    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (selectedOpp) {
      fetchAttendance();
    } else {
      setAttendance([]);
    }
  }, [selectedOpp]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getAttendance(selectedOpp);
      const rawList = res?.data?.attendance || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setAttendance(rawList.map(item => ({
        ...item,
        checkInTime: item.checkInTime || '',
        checkOutTime: item.checkOutTime || ''
      })));
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await attendanceService.markAttendance(id, { status });
      toast.success('Attendance updated');
      setAttendance(prev => prev.map(item => item._id === id ? { ...item, status } : item));
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const handleTimeUpdate = async (id, field, value) => {
    const newItems = attendance.map(item => item._id === id ? { ...item, [field]: value } : item);
    setAttendance(newItems);
    
    // Save to backend
    try {
      await attendanceService.markAttendance(id, { [field]: value });
    } catch (error) {
      toast.error('Failed to update time');
    }
  };

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#354052]">Attendance Tracking</h1>
            <p className="text-[#667085] mt-1 text-sm">Mark attendance and log hours for your volunteers.</p>
          </div>
          <div className="w-full md:w-auto min-w-[280px]">
            <select
              value={selectedOpp}
              onChange={(e) => setSelectedOpp(e.target.value)}
              className="w-full bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 text-[#354052] font-medium shadow-soft-sm focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none transition-all"
            >
              <option value="" className="text-[#667085]">Select an Opportunity</option>
              {opportunities.map(opp => (
                <option key={opp._id} value={opp._id} className="text-[#354052]">{opp.title}</option>
              ))}
            </select>
          </div>
        </div>

        {!selectedOpp ? (
          <div className="pastel-card p-12 text-center">
            <EmptyState 
              title="Select an opportunity" 
              description="Please select an opportunity from the dropdown above to view and manage attendance." 
              icon={ClipboardCheck} 
            />
          </div>
        ) : (
          <div className="pastel-card overflow-hidden">
            {loading ? (
              <div className="p-6"><SkeletonTable columns={5} rows={5} /></div>
            ) : attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#354052]">
                  <thead className="bg-[#F5F1FA]/80 text-[#667085] uppercase text-xs font-semibold border-b border-[#E6E8EC]">
                    <tr>
                      <th className="px-6 py-4">Volunteer</th>
                      <th className="px-6 py-4">Check In</th>
                      <th className="px-6 py-4">Check Out</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8EC]">
                    {attendance.map((item) => {
                      const vol = item.user || item.volunteer || {};
                      const volName = vol.name || 'Volunteer';
                      const volEmail = vol.email || '';

                      return (
                        <tr key={item._id} className="hover:bg-[#F9FBF9] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={vol.profileImage} alt={volName} size="sm" />
                              <div>
                                <p className="font-semibold text-[#354052]">{volName}</p>
                                <p className="text-xs text-[#667085]">{volEmail}</p>
                              </div>
                            </div>
                          </td>
                        <td className="px-6 py-4">
                          <input 
                            type="time" 
                            value={item.checkInTime} 
                            onChange={(e) => handleTimeUpdate(item._id, 'checkInTime', e.target.value)}
                            className="bg-white border border-[#E6E8EC] rounded-lg px-2.5 py-1 text-[#354052] text-sm focus:border-[#BFD8C2] focus:ring-1 focus:ring-[#BFD8C2] outline-none w-28"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="time" 
                            value={item.checkOutTime} 
                            onChange={(e) => handleTimeUpdate(item._id, 'checkOutTime', e.target.value)}
                            className="bg-white border border-[#E6E8EC] rounded-lg px-2.5 py-1 text-[#354052] text-sm focus:border-[#BFD8C2] focus:ring-1 focus:ring-[#BFD8C2] outline-none w-28"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={item.status === 'present' ? 'success' : item.status === 'absent' ? 'error' : 'warning'}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <Button 
                            size="sm" 
                            variant={item.status === 'present' ? 'primary' : 'outline'} 
                            className={item.status === 'present' ? '!bg-[#BFD8C2] !text-[#26372B] font-medium' : '!border-[#E6E8EC] !text-[#354052] hover:!bg-[#F5F1FA]'}
                            onClick={() => handleStatusChange(item._id, 'present')}
                          >
                            Present
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.status === 'absent' ? 'danger' : 'outline'} 
                            className={item.status === 'absent' ? '!bg-[#F2D6DD] !text-[#852E3E]' : '!border-[#F2D6DD] !text-[#9A3445] hover:!bg-[#F2D6DD]/30'} 
                            onClick={() => handleStatusChange(item._id, 'absent')}
                          >
                            Absent
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState 
                  title="No volunteers found" 
                  description="There are no accepted volunteers for this opportunity yet." 
                  icon={Users} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
