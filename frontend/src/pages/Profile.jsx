import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, ShieldCheck, Camera, Building, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Loader } from '../components/ui/Loader';
import AddBankAccountModal from '../components/profile/AddBankAccountModal';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [profileData, banks] = await Promise.all([
        userService.getProfile(),
        userService.getBankAccounts()
      ]);
      setProfile(profileData);
      setBankAccounts(banks);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-24"><Loader size={48} text="Loading profile..." /></div>;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white font-heading">
          Profile Settings
        </h1>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary-500/20 uppercase">
                   {profile?.first_name?.[0] || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-2 text-secondary-600 dark:text-secondary-300 rounded-full shadow-lg border border-secondary-200 dark:border-secondary-700 hover:text-primary-600 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-1">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{user?.role?.toUpperCase()}</p>
              
              <div className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm border ${
                profile?.kyc_status === 'approved' 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
              }`}>
                <ShieldCheck size={16} />
                {profile?.kyc_status === 'approved' ? 'KYC Verified' : 'KYC Pending'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bank Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bankAccounts.map(bank => (
                <div key={bank.id} className="flex items-center justify-between text-xs p-2 border rounded-lg border-secondary-100 dark:border-secondary-800">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-secondary-400" />
                    <span>****{bank.account_number.slice(-4)}</span>
                  </div>
                  <span className="text-secondary-400">{bank.bank_name}</span>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full text-xs h-8 text-primary-600"
                onClick={() => setShowAddBankModal(true)}
              >
                <Plus size={14} className="mr-1" /> Add Account
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    name="first_name"
                    icon={User}
                    value={profile?.first_name || ''}
                    onChange={handleChange}
                  />
                  <Input
                    label="Last Name"
                    name="last_name"
                    icon={User}
                    value={profile?.last_name || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    value={profile?.email || ''}
                    onChange={handleChange}
                    disabled
                    helperText="Email address cannot be changed."
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    value={profile?.phone || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={isSaving}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
      
      <AddBankAccountModal 
        isOpen={showAddBankModal}
        onClose={() => setShowAddBankModal(false)}
        onSuccess={() => fetchData(true)}
      />
    </div>
  );
};

export default Profile;
