import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunityService } from '../services/opportunityService';
import { applicationService } from '../services/applicationService';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PublicLayout from '../layouts/PublicLayout';
import SkeletonCard from '../components/ui/SkeletonCard'; // Reuse skeleton for loading
import { format } from 'date-fns';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [myApplication, setMyApplication] = useState(null);
  const [checkingApp, setCheckingApp] = useState(false);
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyNotes, setApplyNotes] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await opportunityService.getOpportunity(id);
        setOpportunity(res.data.opportunity || res.data);
      } catch (error) {
        console.error('Error fetching detail:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (user && user.role === 'volunteer' && opportunity) {
      const checkApplication = async () => {
        setCheckingApp(true);
        try {
          // Assume getMyApplications supports filtering by opportunity
          const res = await applicationService.getMyApplications({ opportunity: id });
          if (res.data && res.data.applications && res.data.applications.length > 0) {
            setMyApplication(res.data.applications[0]);
          }
        } catch (error) {
          console.error('Error checking application:', error);
        } finally {
          setCheckingApp(false);
        }
      };
      checkApplication();
    }
  }, [user, opportunity, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await applicationService.applyForOpportunity(id, { notes: applyNotes });
      toast.success('Application submitted successfully!');
      setMyApplication(res.data.application || res.data);
      setIsApplyModalOpen(false);
      
      // Update local opportunity registered count if needed, or re-fetch
      setOpportunity(prev => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!myApplication || !window.confirm('Are you sure you want to cancel your application?')) return;
    try {
      await applicationService.updateApplicationStatus(myApplication._id, 'cancelled');
      toast.success('Application cancelled');
      setMyApplication(prev => ({ ...prev, status: 'cancelled' }));
      // Optional: re-fetch opportunity to update counts
    } catch (error) {
      toast.error('Failed to cancel application');
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-24 min-h-screen">
          <SkeletonCard />
        </div>
      </PublicLayout>
    );
  }

  if (notFound || !opportunity) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-32 text-center min-h-screen">
          <h2 className="text-3xl font-bold text-white mb-4">Opportunity Not Found</h2>
          <p className="text-gray-400 mb-8">The opportunity you are looking for does not exist or has been removed.</p>
          <Link to="/opportunities" className="text-primary-400 hover:underline">Back to Opportunities</Link>
        </div>
      </PublicLayout>
    );
  }

  const isFull = opportunity.registeredCount >= opportunity.capacity;
  const isCompleted = opportunity.status === 'completed';
  const isCancelled = opportunity.status === 'cancelled';
  const isOngoing = opportunity.status === 'ongoing';

  return (
    <PublicLayout>
      <div className="bg-gray-950 min-h-screen pb-20">
        {/* Banner */}
        <div className="h-64 md:h-80 w-full bg-gradient-to-r from-gray-900 to-gray-800 relative">
          {opportunity.image && (
            <img src={opportunity.image} alt={opportunity.title} className="w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 -mt-20 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-300 hover:text-white mb-6 bg-gray-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-gray-700 w-fit">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Details */}
            <div className="lg:w-2/3 space-y-8">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8">
                <span className="inline-block px-3 py-1 bg-primary-900/50 text-primary-400 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                  {opportunity.category?.replace('-', ' ')}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{opportunity.title}</h1>
                
                {/* NGO Info */}
                <div className="flex items-center p-4 bg-gray-950 rounded-xl border border-gray-800 mb-8">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 mr-4">
                    {opportunity.ngo?.organizationName?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium flex items-center">
                      {opportunity.ngo?.organizationName || 'Unknown NGO'}
                      {opportunity.ngo?.isVerified && <ShieldCheck className="w-4 h-4 text-blue-400 ml-2" />}
                    </h3>
                    <p className="text-sm text-gray-400">Organizer</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">About this opportunity</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{opportunity.description}</p>
                </div>

                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Details Grid */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 md:p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-primary-400 mt-1 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">{format(new Date(opportunity.date), 'MMMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-accent-400 mt-1 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Time</p>
                      <p className="text-white font-medium">
                        {opportunity.time} 
                        {/* If you have endTime, add it: - {opportunity.endTime} */}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-400 mt-1 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-medium">{opportunity.location}, {opportunity.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-purple-400 mt-1 mr-3" />
                    <div>
                      <p className="text-gray-400 text-sm">Capacity</p>
                      <p className="text-white font-medium">{opportunity.registeredCount || 0} / {opportunity.capacity} volunteers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 bg-gray-900 rounded-2xl border border-gray-800 p-6">
                {/* Status Badges */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {isCompleted && <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-sm font-medium border border-green-800">Completed</span>}
                  {isCancelled && <span className="px-3 py-1 bg-red-900/50 text-red-400 rounded-full text-sm font-medium border border-red-800">Cancelled</span>}
                  {isOngoing && <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm font-medium border border-blue-800">Ongoing</span>}
                  {!isCompleted && !isCancelled && !isOngoing && <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium">Published</span>}
                </div>

                {/* Capacity Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Volunteers Needed</span>
                    <span className="text-white font-medium">{opportunity.registeredCount || 0} / {opportunity.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-primary-500'}`} 
                      style={{ width: `${Math.min(((opportunity.registeredCount || 0) / opportunity.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {isFull && <p className="text-red-400 text-xs mt-2 text-center">Opportunity is currently full</p>}
                </div>

                {/* Action Buttons based on Auth & State */}
                <div className="space-y-4">
                  {!user ? (
                    <Link to="/login" className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white text-center rounded-lg font-medium transition-colors">
                      Login to Apply
                    </Link>
                  ) : user.role === 'ngo' ? (
                    user._id === opportunity.ngo?._id ? (
                      <Link to={`/ngo/opportunities/${opportunity._id}`} className="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 text-center rounded-lg font-medium transition-colors">
                        Manage Opportunity
                      </Link>
                    ) : null
                  ) : user.role === 'volunteer' ? (
                    checkingApp ? (
                      <div className="w-full py-3 text-center text-gray-400">Checking status...</div>
                    ) : myApplication ? (
                      <div className="space-y-3">
                        {myApplication.status === 'pending' && (
                          <>
                            <div className="p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-lg flex items-center text-yellow-400">
                              <Clock className="w-5 h-5 mr-2" /> Application Pending
                            </div>
                            <button onClick={handleCancelApplication} className="w-full py-2 text-red-400 hover:text-red-300 text-sm">
                              Cancel Application
                            </button>
                          </>
                        )}
                        {myApplication.status === 'accepted' && (
                          <div className="p-3 bg-green-900/30 border border-green-800/50 rounded-lg flex items-center text-green-400">
                            <CheckCircle className="w-5 h-5 mr-2" /> Application Accepted
                          </div>
                        )}
                        {myApplication.status === 'rejected' && (
                          <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center text-red-400">
                            <XCircle className="w-5 h-5 mr-2" /> Application Not Accepted
                          </div>
                        )}
                        {myApplication.status === 'cancelled' && (
                          <div className="p-3 bg-gray-800 rounded-lg text-gray-400 text-center">
                            You cancelled this application
                          </div>
                        )}
                      </div>
                    ) : isCompleted || isCancelled ? (
                      <div className="w-full py-3 px-4 bg-gray-800 text-gray-500 text-center rounded-lg font-medium cursor-not-allowed">
                        Opportunity Closed
                      </div>
                    ) : isFull ? (
                      <div className="w-full py-3 px-4 bg-gray-800 text-gray-500 text-center rounded-lg font-medium cursor-not-allowed">
                        Opportunity Full
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsApplyModalOpen(true)}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-600/20"
                      >
                        Apply Now
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Apply for {opportunity.title}</h3>
              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Why do you want to join? (Optional)</label>
                  <textarea
                    rows={4}
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Briefly describe your interest or relevant experience..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={applying}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default OpportunityDetail;
