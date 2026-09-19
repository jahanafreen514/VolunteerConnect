import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Award, Timer, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { userService } from '../../services/userService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import SkeletonCard from '../../components/ui/SkeletonCard';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { Link } from 'react-router-dom';

const Participation = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await userService.getParticipationHistory();
        setHistory(data);
      } catch (error) {
        toast.error('Failed to load participation history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-2">Participation History</h1>
        <p className="text-gray-400 mb-6">Track your volunteering hours and attendance.</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((record) => (
              <Card key={record._id} className="flex flex-col h-full hover:border-primary-500/50 transition-colors">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={record.status === 'present' ? 'success' : record.status === 'absent' ? 'error' : 'warning'}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                    {record.certificateIssued && (
                      <Award className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{record.opportunity.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{record.opportunity.ngo?.organizationName}</p>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      <span>{format(new Date(record.opportunity.date), 'MMM d, yyyy')}</span>
                    </div>
                    {record.hoursLogged > 0 && (
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-purple-400" />
                        <span>{record.hoursLogged} hours logged</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 bg-white/[0.02] mt-auto">
                  {record.certificateIssued ? (
                    <Link to="/volunteer/certificates" className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      {record.status === 'present' ? 'Certificate pending' : 'No certificate available'}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No participation history yet" 
            description="You haven't attended any volunteer events yet. Start applying to make an impact!" 
            icon={CheckCircle}
            action={{ label: 'Find Opportunities', onClick: () => window.location.href = '/opportunities' }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Participation;
