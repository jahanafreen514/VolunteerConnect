import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheck, ShieldAlert, FileText, UploadCloud, Link as LinkIcon, 
  ExternalLink, MapPin, Navigation, CheckCircle2, RefreshCw 
} from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import NGOSidebar from '../../components/layouts/NGOSidebar';
import { ngoService } from '../../services/ngoService';
import { locationService } from '../../services/locationService';
import LocationPickerMap from '../../components/map/LocationPickerMap';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ChangePasswordCard from '../../components/ChangePasswordCard';

const NGOProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // Real coordinates & location state
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const { register, handleSubmit, reset, setValue, getValues } = useForm();

  const fetchProfile = async () => {
    try {
      const res = await ngoService.getMyProfile();
      const data = res?.data || res;
      if (data) {
        setProfile(data);
        const street = data.address?.street || (typeof data.address === 'string' ? data.address : '');
        const city = data.address?.city || data.city || '';
        const state = data.address?.state || data.state || '';
        const country = data.address?.country || data.country || 'India';
        const postalCode = data.address?.postalCode || data.pincode || '';

        reset({
          organizationName: data.organizationName || '',
          description: data.description || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          registrationNumber: data.registrationNumber || '',
          address: street,
          city: city,
          state: state,
          country: country,
          postalCode: postalCode,
        });

        if (data.latitude && data.longitude) {
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setFormattedAddress(data.formattedAddress || `${street}, ${city}`);
          setLocationConfirmed(data.locationConfirmed !== false);
        }
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

  const handleGeocodeAddress = async () => {
    const address = getValues('address');
    const city = getValues('city');
    const state = getValues('state');
    const country = getValues('country') || 'India';
    const pincode = getValues('postalCode');

    if (!address && !city) {
      toast.error('Please enter at least a Street Address or City to locate on the map.');
      return;
    }

    setGeocoding(true);
    try {
      const res = await locationService.geocode({ address, city, state, country, pincode });
      if (res?.data) {
        const { latitude: lat, longitude: lng, formattedAddress: fmt, city: retCity, state: retState, pincode: retPin } = res.data;
        setLatitude(lat);
        setLongitude(lng);
        setFormattedAddress(fmt || `${address}, ${city}`);
        setLocationConfirmed(true);

        if (retCity && !city) setValue('city', retCity);
        if (retState && !state) setValue('state', retState);
        if (retPin && !pincode) setValue('postalCode', retPin);

        toast.success('Location found! Pinned on the map below.');
      }
    } catch (err) {
      toast.error('Could not find location automatically. You can click on the map to set your pin.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocationSelect = async ({ lat, lng }) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationConfirmed(true);

    try {
      const res = await locationService.reverseGeocode(lat, lng);
      if (res?.data) {
        const d = res.data;
        if (d.formattedAddress) setFormattedAddress(d.formattedAddress);
        if (d.city) setValue('city', d.city);
        if (d.state) setValue('state', d.state);
        if (d.country) setValue('country', d.country);
        if (d.pincode) setValue('postalCode', d.pincode);
      }
    } catch (err) {
      console.warn('Reverse geocode note:', err);
    }
  };

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
          country: data.country || 'India',
          postalCode: data.postalCode
        },
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pincode: data.postalCode,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        formattedAddress: formattedAddress || undefined,
        locationConfirmed: locationConfirmed
      };
      
      let res;
      if (profile) {
        res = await ngoService.updateProfile(payload);
        toast.success('Profile and location updated successfully');
      } else {
        res = await ngoService.createProfile(payload);
        toast.success('Profile and location registered successfully');
      }
      setProfile(res?.data || res);
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
      <div className="relative z-10 w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">NGO Profile & Headquarters Location</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your organization credentials, real-world headquarters, and verification documents.</p>
          </div>
        </div>
        
        {profile && (
          <Card className={`p-4 border-l-4 ${profile.verificationStatus === 'approved' ? 'border-l-green-500 bg-green-500/10' : profile.verificationStatus === 'rejected' ? 'border-l-red-500 bg-red-500/10' : 'border-l-amber-500 bg-amber-500/10'}`}>
            <div className="flex items-start gap-4">
              {profile.verificationStatus === 'approved' ? <ShieldCheck className="w-6 h-6 text-green-400 shrink-0 mt-0.5" /> : <ShieldAlert className={`w-6 h-6 shrink-0 mt-0.5 ${profile.verificationStatus === 'rejected' ? 'text-red-400' : 'text-amber-400'}`} />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">Verification Status:</h3>
                  <Badge variant={profile.verificationStatus === 'approved' ? 'success' : profile.verificationStatus === 'rejected' ? 'error' : 'warning'} className="uppercase font-semibold text-xs px-2.5 py-0.5">
                    {profile.verificationStatus}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  {profile.verificationStatus === 'approved' 
                    ? 'Your organization is fully verified on Volunteer Connect. You are visible on the real-world discovery map and volunteer listings.' 
                    : profile.verificationStatus === 'rejected' 
                    ? 'Your application was rejected. Please review administrator notes or re-upload your official registration documents.' 
                    : 'Your organization profile is under review by administrators. You can still create opportunities, publish initiatives, and register your headquarters location.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column (8 cols): Org Details & HQ Location Map */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="border-b border-white/10 pb-4 mb-2">
                  <h2 className="text-xl font-bold text-white">Organization Details</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Official information presented to prospective volunteers and donors.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Organization Name" {...register('organizationName')} required placeholder="e.g. Hope Foundation India" />
                  <Input label="Registration Number / CIN" {...register('registrationNumber')} required placeholder="e.g. REG-59281-2024" />
                </div>

                <Textarea label="Organization Description & Mission" {...register('description')} rows={4} required placeholder="Describe your NGO's mission, causes supported, and impact goals..." />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Input label="Official Email" type="email" {...register('email')} required placeholder="contact@organization.org" />
                  <Input label="Phone Number" {...register('phone')} required placeholder="+91 98765 43210" />
                  <Input label="Official Website" {...register('website')} placeholder="https://organization.org" />
                </div>

                {/* Real Location & Headquarters Map Section */}
                <div className="pt-6 border-t border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        Headquarters Address & Real-World Map
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Set your exact coordinates so volunteers in your district can discover and volunteer with your NGO.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeocodeAddress}
                      disabled={geocoding}
                      className="px-4 py-2 rounded-xl bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 border border-primary-500/40 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto shadow-sm"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${geocoding ? 'animate-spin text-primary-400' : ''}`} />
                      <span>{geocoding ? 'Locating...' : 'Auto-Locate on Map'}</span>
                    </button>
                  </div>

                  <Input label="Street Address" {...register('address')} placeholder="e.g. 4th Line, Arundelpet, Near RTC Bus Stand" required />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input label="City" {...register('city')} placeholder="e.g. Guntur" required />
                    <Input label="State/Province" {...register('state')} placeholder="e.g. Andhra Pradesh" required />
                    <Input label="Country" {...register('country')} placeholder="India" required />
                    <Input label="Postal Code / PIN" {...register('postalCode')} placeholder="e.g. 522002" required />
                  </div>

                  {/* Location Confirmation & Map Picker */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">
                        Pinpoint Location (Click or drag marker to set exact premises):
                      </span>
                      {latitude && longitude && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                        </span>
                      )}
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
                      <LocationPickerMap
                        initialLat={latitude || 16.3067}
                        initialLng={longitude || 80.4365}
                        onConfirmLocation={handleLocationSelect}
                        height="440px"
                      />
                    </div>

                    {formattedAddress && (
                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-medium">Verified Headquarters Address:</strong> {formattedAddress}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end">
                  <Button type="submit" isLoading={saving} className="px-8 py-3 text-sm font-semibold shadow-glow-sm">
                    {profile ? 'Save & Update Organization Profile' : 'Register Organization'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column (4 cols): Documents & Change Password */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-white mb-2">Verification Documents</h2>
              <p className="text-xs text-gray-400 mb-4">Upload registration certificates, 80G/12A receipts, or government trust deed to speed up verification.</p>
              
              <label className="border-2 border-dashed border-white/20 hover:border-primary-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all group">
                <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-primary-400 transition-colors mb-2" />
                <span className="text-sm text-white font-semibold">Click to upload certificates</span>
                <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB per document)</span>
                <input type="file" multiple className="hidden" onChange={handleDocUpload} disabled={docsLoading || profile?.verificationStatus === 'approved'} />
              </label>

              {docsLoading && <div className="text-xs text-center text-primary-400 mt-3 animate-pulse font-medium">Uploading and encrypting documents...</div>}

              {profile?.documents?.length > 0 && (
                <div className="mt-5 space-y-2.5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded Documents ({profile.documents.length})</h3>
                  {profile.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/8 transition-colors">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-4 h-4 text-primary-400 shrink-0" />
                        <span className="text-xs text-gray-200 truncate font-medium">{doc.name || `Certificate ${idx+1}`}</span>
                      </div>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 p-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Change Password Card placed side-by-side in right column */}
            <ChangePasswordCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NGOProfile;
