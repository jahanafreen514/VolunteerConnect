import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Camera, X, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import VolunteerSidebar from '../../components/layouts/VolunteerSidebar';
import { userService } from '../../services/userService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordCard from '../../components/ChangePasswordCard';

const VolunteerProfile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const data = res?.data || res || {};
        setProfile(data);
        setSkills(data.skills || []);
        setInterests(data.interests || []);
        reset({
          name: data.name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          city: data.location?.city || '',
          state: data.location?.state || '',
          country: data.location?.country || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const updateData = {
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        skills,
        interests,
        location: {
          city: data.city,
          state: data.state,
          country: data.country
        }
      };
      const res = await userService.updateProfile(updateData);
      const updated = res?.data || res || {};
      setProfile(updated);
      if (setUser) {
        setUser(prev => ({ ...prev, ...updated }));
      }
      setUser(updated); // Update context
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const updated = await userService.uploadProfileImage(formData);
      setProfile(updated);
      setUser(updated);
      toast.success('Profile image updated');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => setInterests(interests.filter(i => i !== interest));

  if (loading) {
    return <DashboardLayout sidebar={<VolunteerSidebar />}><div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-2 border-[#5b7f63] border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;
  }

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <div className="relative z-10 w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        <div className="pastel-card p-6 border border-[#E6E8EC]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#354052] tracking-tight">My Profile & Volunteering Account</h1>
          <p className="text-xs text-[#667085] mt-1">Manage your public volunteer identity, skills, interests, and account security.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols) - Avatar, Stats & Change Password */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <Card className="p-6 flex flex-col items-center text-center space-y-5 pastel-card border border-[#E6E8EC]">
              <div className="relative group">
                <Avatar src={profile?.profileImage} alt={profile?.name} size="xl" className="w-28 h-28 text-3xl ring-4 ring-[#BFD8C2] shadow-soft-sm" />
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-[#354052]/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-xs">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-medium">Change Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div className="w-full">
                <h2 className="text-lg font-bold text-[#354052] truncate">{profile?.name}</h2>
                <p className="text-[#667085] text-xs truncate mt-0.5">{profile?.email}</p>
                {profile?.phone && <p className="text-[#667085] text-xs mt-0.5">{profile.phone}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary" className="capitalize px-3 py-1 font-semibold">{profile?.role || 'Volunteer'}</Badge>
                {profile?.location?.city && (
                  <Badge variant="default">
                    {profile.location.city}{profile?.location?.state ? `, ${profile.location.state}` : ''}
                  </Badge>
                )}
              </div>
              
              {/* Stats Counters */}
              <div className="w-full pt-5 border-t border-[#E6E8EC] grid grid-cols-2 gap-3">
                 <div className="p-3.5 bg-[#D8EEE5]/40 rounded-2xl border border-[#BFD8C2] text-center">
                   <p className="text-2xl sm:text-3xl font-extrabold text-[#5b7f63]">
                     {profile?.stats?.hoursVolunteered || 0}
                   </p>
                   <p className="text-[11px] text-[#26372B] font-semibold uppercase tracking-wider mt-1">Hours Logged</p>
                 </div>
                 <div className="p-3.5 bg-[#DDD5F3]/40 rounded-2xl border border-[#DDD5F3] text-center">
                   <p className="text-2xl sm:text-3xl font-extrabold text-[#8e74d1]">
                     {profile?.stats?.eventsAttended || 0}
                   </p>
                   <p className="text-[11px] text-[#30264A] font-semibold uppercase tracking-wider mt-1">Events Attended</p>
                 </div>
              </div>
            </Card>

            {/* Change Password Card */}
            <ChangePasswordCard />
          </div>

          {/* Right Column (8 cols) - Extensive Edit Form & Details */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            <Card className="p-6 sm:p-8 pastel-card border border-[#E6E8EC]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E6E8EC]">
                <div>
                  <h2 className="text-lg font-bold text-[#354052]">Volunteer Details & Preferences</h2>
                  <p className="text-xs text-[#667085] mt-0.5">Keep your bio, skills, and contact details up to date so matching NGOs can reach you.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Full Name" {...register('name')} required />
                  <Input label="Phone Number" {...register('phone')} placeholder="+91 98765 43210" />
                </div>
                
                <div>
                  <Textarea 
                    label="Personal Bio & Mission" 
                    {...register('bio')} 
                    rows={4} 
                    placeholder="Tell non-profit organizers about your passion, causes you care about, and background..." 
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#F5F1FA] border border-[#E6E8EC]">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-[#354052]">Volunteering Skills</label>
                    <span className="text-xs text-[#667085]">{skills.length} skills added</span>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {skills.length === 0 && <span className="text-xs text-[#667085] italic py-1">No skills added yet. Add skills like First Aid, Teaching, Driving, Cooking, etc.</span>}
                    {skills.map(skill => (
                      <span key={skill} className="bg-[#D8EEE5] text-[#26372B] border border-[#BFD8C2] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-soft-sm">
                        {skill} 
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-[#9B5B65] transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Input 
                      value={newSkill} 
                      onChange={(e) => setNewSkill(e.target.value)} 
                      placeholder="e.g. First Aid, Event Coordination, Graphic Design..." 
                      className="flex-1" 
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} 
                    />
                    <Button type="button" onClick={addSkill} variant="outline" className="btn-secondary-pastel shrink-0 px-4 text-xs font-semibold">
                      <Plus className="w-4 h-4 mr-1" /> Add Skill
                    </Button>
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-[#F5F1FA] border border-[#E6E8EC]">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-[#354052]">Causes & Interests</label>
                    <span className="text-xs text-[#667085]">{interests.length} causes selected</span>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {interests.length === 0 && <span className="text-xs text-[#667085] italic py-1">No causes added yet. Add causes like Environment, Child Education, Disaster Relief, etc.</span>}
                    {interests.map(interest => (
                      <span key={interest} className="bg-[#DDD5F3] text-[#30264A] border border-[#DDD5F3] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-soft-sm">
                        {interest} 
                        <button type="button" onClick={() => removeInterest(interest)} className="hover:text-[#9B5B65] transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Input 
                      value={newInterest} 
                      onChange={(e) => setNewInterest(e.target.value)} 
                      placeholder="e.g. Animal Welfare, Climate Action, Health Camps..." 
                      className="flex-1" 
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} 
                    />
                    <Button type="button" onClick={addInterest} variant="outline" className="btn-secondary-pastel shrink-0 px-4 text-xs font-semibold">
                      <Plus className="w-4 h-4 mr-1" /> Add Cause
                    </Button>
                  </div>
                </div>

                {/* Geographic Location */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-[#354052]">Home Location</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="City" {...register('city')} placeholder="e.g. Guntur" />
                    <Input label="State" {...register('state')} placeholder="e.g. Andhra Pradesh" />
                    <Input label="Country" {...register('country')} placeholder="India" />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#E6E8EC]">
                  <Button type="submit" isLoading={saving} className="btn-primary-pastel px-8 py-3 text-xs font-semibold shadow-soft-sm">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerProfile;
