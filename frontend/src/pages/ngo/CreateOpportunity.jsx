import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Image as ImageIcon, X, Plus, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { opportunityService } from '../../services/opportunityService';
import { ngoService } from '../../services/ngoService';
import { locationService } from '../../services/locationService';
import { getOpportunityImage } from '../../utils/categoryImages';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const CATEGORIES = [
  'Education', 'Environment', 'Healthcare', 'Animal Welfare', 
  'Community Service', 'Disaster Relief', 'Arts & Culture', 'Technology'
];

const CreateOpportunity = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Pre-filled location coordinates
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [adoptedEventId, setAdoptedEventId] = useState(null);
  const [adoptedEventTitle, setAdoptedEventTitle] = useState('');

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();
  const selectedCategory = watch('category');

  useEffect(() => {
    const initForm = async () => {
      // 1. Check if adopting from news event
      const eventId = searchParams.get('adoptEvent');
      const paramTitle = searchParams.get('title');
      const paramDesc = searchParams.get('description');
      const paramCategory = searchParams.get('category');
      const paramCity = searchParams.get('city');
      const paramLat = searchParams.get('lat');
      const paramLng = searchParams.get('lng');

      if (eventId) {
        setAdoptedEventId(eventId);
        setAdoptedEventTitle(paramTitle || 'Real-World Event');
        setValue('title', paramTitle || '');
        setValue('description', paramDesc ? `${paramDesc}\n\n[Official Action organized by NGO via VolunteerConnect]` : '');
        setValue('category', paramCategory || 'Disaster Relief');
        if (paramCity) setValue('city', paramCity);
        if (paramLat && paramLng) {
          setLatitude(parseFloat(paramLat));
          setLongitude(parseFloat(paramLng));
        }
        setValue('country', 'India');
        return;
      }

      // 2. Otherwise auto pre-fill from registered NGO profile
      try {
        const res = await ngoService.getMyProfile();
        const profile = res?.data || res;
        if (profile) {
          const street = profile.address?.street || (typeof profile.address === 'string' ? profile.address : '');
          const city = profile.address?.city || profile.city || '';
          const state = profile.address?.state || profile.state || '';
          const country = profile.address?.country || profile.country || 'India';

          setValue('address', street);
          setValue('city', city);
          setValue('state', state);
          setValue('country', country);

          if (profile.latitude && profile.longitude) {
            setLatitude(profile.latitude);
            setLongitude(profile.longitude);
          }
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err);
      }
    };

    initForm();
  }, [searchParams, setValue]);

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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('date', data.date);
      formData.append('time', data.time || '10:00 AM - 4:00 PM');
      formData.append('volunteerCapacity', data.volunteerCapacity);
      formData.append('status', status);
      
      formData.append('location[address]', data.address);
      formData.append('location[city]', data.city);
      formData.append('location[state]', data.state);
      formData.append('location[country]', data.country || 'India');
      
      if (latitude && longitude) {
        formData.append('location[latitude]', latitude);
        formData.append('location[longitude]', longitude);
      }

      if (adoptedEventId) {
        formData.append('news_event_id', adoptedEventId);
        formData.append('source_type', 'ngo');
        formData.append('verification_status', 'confirmed');
      }
      
      skills.forEach(skill => formData.append('requiredSkills[]', skill));
      if (imageFile) formData.append('image', imageFile);

      await opportunityService.createOpportunity(formData);

      // If adopting news event, also update event status on backend
      if (adoptedEventId) {
        try {
          await locationService.adoptEvent(adoptedEventId);
        } catch (e) {
          console.warn('Adopt event sync notice:', e);
        }
      }

      toast.success(`Opportunity ${status === 'published' ? 'published' : 'saved as draft'} successfully`);
      navigate('/ngo/opportunities');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-4 pastel-card p-5 border border-[#E6E8EC]">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#667085] hover:text-[#354052] hover:bg-[#F5F1FA]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#354052]">Create Opportunity</h1>
            <p className="text-xs text-[#667085] mt-0.5">Post a new volunteer opportunity or civic initiative for your community.</p>
          </div>
        </div>

        {adoptedEventId && (
          <div className="p-4 bg-[#D8EEE5] border border-[#BFD8C2] rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#5b7f63] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[#26372B]">Adopting Real-World News Event: {adoptedEventTitle}</h3>
              <p className="text-xs text-[#26372B]/80 mt-0.5">
                This will officially confirm this community need on VolunteerConnect and link volunteers directly to your organization.
              </p>
            </div>
          </div>
        )}

        <Card className="p-6 sm:p-8 pastel-card border border-[#E6E8EC]">
          <form className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#354052]">Cover Image</label>
                <span className="text-xs text-[#5b7f63] font-semibold">
                  {imageFile ? 'Custom Image Selected' : (selectedCategory ? `Auto-Assigned Category Cover: ${selectedCategory}` : 'Auto-assigned by category if omitted')}
                </span>
              </div>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#E6E8EC] border-dashed rounded-2xl cursor-pointer bg-[#F5F1FA] hover:bg-[#FFF8EF]/50 transition-colors overflow-hidden relative group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : selectedCategory ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={getOpportunityImage({ category: selectedCategory })} 
                        alt={selectedCategory} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#354052]/80 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="text-xs font-semibold text-white bg-[#5b7f63] px-3 py-1 rounded-full w-fit shadow-soft-sm">
                          ✨ Default {selectedCategory} Photo (Click to upload custom image)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-[#667085] mb-2" />
                      <p className="text-xs text-[#354052] font-semibold">Click to upload custom cover photo</p>
                      <p className="text-[11px] text-[#667085] mt-1">Or select a category below for auto-curated high-res imagery</p>
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
                  <label className="block text-xs font-semibold text-[#354052]">Category</label>
                  <select {...register('category', { required: true })} className="w-full bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#354052] focus:border-[#BFD8C2] focus:ring-2 focus:ring-[#BFD8C2]/40 outline-none transition-all">
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date" type="date" {...register('date', { required: true })} />
                  <Input label="Time" type="text" placeholder="e.g. 09:00 AM - 01:00 PM" {...register('time')} />
                </div>
                <Input label="Volunteer Capacity" type="number" min="1" {...register('volunteerCapacity', { required: true })} />
              </div>

              <div className="space-y-4">
                <Textarea label="Description" rows={5} {...register('description', { required: true })} />
                
                {/* Skills */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#354052]">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {skills.map(skill => (
                      <span key={skill} className="bg-[#DDD5F3] text-[#30264A] border border-[#DDD5F3] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-soft-sm">
                        {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-3.5 h-3.5 text-[#667085] hover:text-[#9B5B65]" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                    <Button type="button" onClick={addSkill} variant="outline" size="icon" className="btn-secondary-pastel"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E6E8EC] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#354052] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5b7f63]" />
                  Opportunity Venue & Geolocation
                </h3>
                {latitude && longitude && (
                  <span className="text-xs text-[#26372B] bg-[#D8EEE5] px-2.5 py-0.5 rounded-full border border-[#BFD8C2]">
                    📍 Coordinates verified: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </span>
                )}
              </div>
              <p className="text-xs text-[#667085]">
                Pre-filled with your organization headquarters. Modify if this event takes place at a different venue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Street Address / Venue" {...register('address', { required: true })} />
              <Input label="City" {...register('city', { required: true })} />
              <Input label="State/Province" {...register('state', { required: true })} />
              <Input label="Country" {...register('country', { required: true })} />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-[#E6E8EC]">
              <Button type="button" variant="outline" className="btn-secondary-pastel text-xs font-semibold" onClick={handleSubmit((data) => onSubmit(data, 'draft'))} isLoading={loading}>Save as Draft</Button>
              <Button type="button" className="btn-primary-pastel text-xs font-semibold" onClick={handleSubmit((data) => onSubmit(data, 'published'))} isLoading={loading}>Publish Opportunity</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateOpportunity;
