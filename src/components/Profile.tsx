import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { MapPin, Bell, CreditCard, LogOut, ChevronRight, User as UserIcon, Camera } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import BottomNav from './BottomNav';
import LoadingScreen from './LoadingScreen'; // Import LoadingScreen

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
            setAddress(profile.address || '');
            setAvatarUrl(profile.avatar_url);
          }
        } else {
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({ title: 'Error', description: 'Could not fetch profile information.', variant: 'destructive' });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

 const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        phone,
        address,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/profile.${fileExt}`;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;

      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: newAvatarUrl });

      if (dbError) throw dbError;
      
      setAvatarUrl(newAvatarUrl);
      toast({ title: 'Success', description: 'Avatar updated successfully!' });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      <div className="max-w-2xl mx-auto p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
             <div className="relative">
                <Avatar className="w-20 h-20">
                    <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} />
                    <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                </Avatar>
                <input 
                    type="file" 
                    ref={avatarInputRef} 
                    onChange={handleAvatarUpload}
                    accept="image/png, image/jpeg, image/gif"
                    style={{ display: 'none' }}
                    disabled={uploading}
                />
                <Button 
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-white shadow-md"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading}
                >
                    <Camera className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="mb-2" />
              ) : (
                <h2 className="text-xl font-bold">{fullName || 'New User'}</h2>
              )}
              {isEditing ? (
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
              ) : (
                <p className="text-sm text-gray-500">{phone || 'No phone number'}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
            <Button onClick={() => (isEditing ? handleUpdateProfile() : setIsEditing(true))} variant="outline" size="sm" disabled={isSaving || uploading}>
              {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </Card>

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Account Settings</h3>
          <Card className="divide-y">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                <div className="w-full">
                  <p className="font-medium">Delivery Address</p>
                  {isEditing ? (
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Jl. Sudirman No. 123..." className="mt-2" />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {address || 'No address set. Click Edit to add one.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Link to="/payment-methods" className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <p className="font-medium">Payment Methods</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </Card>
        </div>

        {/* Notifications */}
        <div className="mb-6">
           <h3 className="text-lg font-semibold mb-3">Preferences</h3>
           <Card>
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <p className="font-medium">Push Notifications</p>
                </div>
                {/* Add Switch functionality later */}
             </div>
           </Card>
        </div>

        {/* Logout Button */}
        <Button onClick={handleLogout} variant="destructive" className="w-full" size="lg" disabled={isSaving}>
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
      <BottomNav activeTab="profile" />
    </div>
  );
}
