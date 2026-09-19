import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Image as ImageIcon, X, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { opportunityService } from '../../services/opportunityService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const CATEGORIES = [
  'Education', 'Environment', 'Healthcare', 'Animal Welfare', 
  'Community Service', 'Disaster Relief', 'Arts & Culture', 'Technology'
];

const EditOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const data = await opportunityService.getOpportunityById(id);
        setSkills(data.requiredSkills || []);
        if (data.image) setImagePreview(data.image);
        
        // Ensure date is formatted for input type="date"
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        reset({
          title: data.title,
          description: data.description,
          category: data.category,
          date: formattedDate,
          time: data.time || '',
          volunteerCapacity: data.volunteerCapacity,
          address: data.location?.address,
          city: data.location?.city,
          state: data.location?.state,
          country: data.location?.country,
        });
      } catch (error) {
        toast.error('Failed to load opportunity');
        navigate('/ngo/opportunities');
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunity();
  }, [id, reset, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const onSubmit = async (data, status) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('date', data.date);
      formData.append('time', data.time);
      formData.append('volunteerCapacity', data.volunteerCapacity);
      if (status) formData.append('status', status);
      
      formData.append('location[address]', data.address);
      formData.append('location[city]', data.city);
      formData.append('location[state]', data.state);
      formData.append('location[country]', data.country);
      
      skills.forEach(skill => formData.append('requiredSkills[]', skill));
      if (imageFile) formData.append('image', imageFile);

      await opportunityService.updateOpportunity(id, formData);
      toast.success('Opportunity updated successfully');
      navigate('/ngo/opportunities');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update opportunity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout sidebar={<NGOSidebar />}><div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Edit Opportunity</h1>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Click to upload new image</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Title" {...register('title', { required: true })} />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Category</label>
                  <select {...register('category', { required: true })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all">
                    <option value="" className="bg-gray-900">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" {...register('date', { required: true })} />
                  <Input label="Time" type="time" {...register('time', { required: true })} />
                </div>
                <Input label="Volunteer Capacity" type="number" min="1" {...register('volunteerCapacity', { required: true })} />
              </div>

              <div className="space-y-4">
                <Textarea label="Description" rows={5} {...register('description', { required: true })} />
                
                {/* Skills */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map(skill => (
                      <span key={skill} className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <Button type="button" onClick={addSkill} variant="outline" size="icon"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-white pt-4 border-t border-white/10">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Street Address" {...register('address', { required: true })} />
              <Input label="City" {...register('city', { required: true })} />
              <Input label="State/Province" {...register('state', { required: true })} />
              <Input label="Country" {...register('country', { required: true })} />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <Button type="button" onClick={handleSubmit((data) => onSubmit(data))} isLoading={saving}>Save Changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditOpportunity;
