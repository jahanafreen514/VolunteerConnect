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
    return <DashboardLayout sidebar={<VolunteerSidebar />}><div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;
  }

  return (
    <DashboardLayout sidebar={<VolunteerSidebar />}>
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Info */}
          <Card className="p-6 flex flex-col items-center text-center space-y-4 md:col-span-1 h-fit">
            <div className="relative group">
              <Avatar src={profile?.profileImage} alt={profile?.name} size="xl" className="w-32 h-32 text-4xl" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
            </div>
            <Badge variant="primary" className="capitalize">{profile?.role}</Badge>
            
            <div className="w-full pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4">
               <div className="text-center">
                 <p className="text-2xl font-bold text-white">{profile?.stats?.hoursVolunteered || 0}</p>
                 <p className="text-xs text-gray-400">Hours</p>
               </div>
               <div className="text-center">
                 <p className="text-2xl font-bold text-white">{profile?.stats?.eventsAttended || 0}</p>
                 <p className="text-xs text-gray-400">Events</p>
               </div>
            </div>
          </Card>

          {/* Right Column - Edit Form */}
          <Card className="p-6 md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" {...register('name')} required />
                <Input label="Phone Number" {...register('phone')} />
              </div>
              
              <Textarea label="Bio" {...register('bio')} rows={4} placeholder="Tell NGOs about yourself..." />

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map(skill => (
                    <span key={skill} className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3 hover:text-white" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                  <Button type="button" onClick={addSkill} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Interests</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {interests.map(interest => (
                    <span key={interest} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {interest} <button type="button" onClick={() => removeInterest(interest)}><X className="w-3 h-3 hover:text-white" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add an interest" className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())} />
                  <Button type="button" onClick={addInterest} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="City" {...register('city')} />
                <Input label="State" {...register('state')} />
                <Input label="Country" {...register('country')} />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <Button type="submit" isLoading={saving}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <div className="md:col-span-2 md:col-start-2">
            <ChangePasswordCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerProfile;
