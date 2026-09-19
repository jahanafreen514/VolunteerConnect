import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, FileText, UploadCloud, Link as LinkIcon, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

const NGOProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchProfile = async () => {
    try {
      const data = await ngoService.getMyProfile();
      if (data) {
        setProfile(data);
        reset({
          organizationName: data.organizationName,
          description: data.description,
          email: data.email,
          phone: data.phone,
          website: data.website,
          registrationNumber: data.registrationNumber,
          address: data.address?.street,
          city: data.address?.city,
          state: data.address?.state,
          country: data.address?.country,
          postalCode: data.address?.postalCode,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        organizationName: data.organizationName,
        description: data.description,
        email: data.email,
        phone: data.phone,
        website: data.website,
        registrationNumber: data.registrationNumber,
        address: {
          street: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode
        }
      };
      
      let res;
      if (profile) {
        res = await ngoService.updateProfile(payload);
        toast.success('Profile updated successfully');
      } else {
        res = await ngoService.createProfile(payload);
        toast.success('Profile created successfully');
      }
      setProfile(res);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setDocsLoading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));
    
    try {
      const updated = await ngoService.uploadDocuments(formData);
      setProfile(updated);
      toast.success('Documents uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload documents');
    } finally {
      setDocsLoading(false);
    }
  };

  if (loading) return <DashboardLayout sidebar={<NGOSidebar />}><div className="flex justify-center items-center h-full"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  return (
    <DashboardLayout sidebar={<NGOSidebar />}>
      <AnimatedBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">NGO Profile</h1>
        
        {profile && (
          <Card className={`p-4 border-l-4 ${profile.verificationStatus === 'approved' ? 'border-l-green-500 bg-green-500/5' : profile.verificationStatus === 'rejected' ? 'border-l-red-500 bg-red-500/5' : 'border-l-amber-500 bg-amber-500/5'}`}>
            <div className="flex items-start gap-4">
              {profile.verificationStatus === 'approved' ? <ShieldCheck className="w-6 h-6 text-green-500" /> : <ShieldAlert className={`w-6 h-6 ${profile.verificationStatus === 'rejected' ? 'text-red-500' : 'text-amber-500'}`} />}
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2">
                  Verification Status: 
                  <Badge variant={profile.verificationStatus === 'approved' ? 'success' : profile.verificationStatus === 'rejected' ? 'error' : 'warning'} className="uppercase">
                    {profile.verificationStatus}
                  </Badge>
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {profile.verificationStatus === 'approved' 
                    ? 'Your organization is fully verified. You can create opportunities and accept volunteers.' 
                    : profile.verificationStatus === 'rejected' 
                    ? 'Your application was rejected. Please contact support or update your documents.' 
                    : 'Your profile is under review by administrators. Please ensure all details and documents are provided.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Organization Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Organization Name" {...register('organizationName')} required />
              <Textarea label="Description" {...register('description')} rows={4} required placeholder="What does your NGO do?" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Email Address" type="email" {...register('email')} required />
                <Input label="Phone Number" {...register('phone')} required />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Website" {...register('website')} placeholder="https://" />
                <Input label="Registration Number" {...register('registrationNumber')} required />
              </div>

              <h3 className="text-lg font-medium text-white pt-4 border-t border-white/10">Address</h3>
              <Input label="Street Address" {...register('address')} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" {...register('city')} required />
                <Input label="State/Province" {...register('state')} required />
                <Input label="Country" {...register('country')} required />
                <Input label="Postal Code" {...register('postalCode')} required />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={saving}>{profile ? 'Update Profile' : 'Create Profile'}</Button>
              </div>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Verification Documents</h2>
              <p className="text-sm text-gray-400 mb-4">Upload registration certificates, tax exemptions, or any official documents to help verify your organization.</p>
              
              <label className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors group">
                <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary-400 transition-colors mb-2" />
                <span className="text-sm text-white font-medium">Click to upload documents</span>
                <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                <input type="file" multiple className="hidden" onChange={handleDocUpload} disabled={docsLoading || profile?.verificationStatus === 'approved'} />
              </label>

              {docsLoading && <div className="text-sm text-center text-primary-400 mt-4 animate-pulse">Uploading documents...</div>}

              {profile?.documents?.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Uploaded Documents</h3>
                  {profile.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <span className="text-xs text-gray-300 truncate">{doc.name || `Document ${idx+1}`}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NGOProfile;
