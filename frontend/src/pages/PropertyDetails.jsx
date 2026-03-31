import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Calendar, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import PropertyGallery from '../components/property/PropertyGallery';
import { Loader } from '../components/ui/Loader';
import propertyService from '../services/propertyService';
import exchangeService from '../services/exchangeService';
import Toast from '../components/ui/Toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvesting, setIsInvesting] = useState(false);
  const [buyAmount, setBuyAmount] = useState(1);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const fetchProperty = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await propertyService.getPropertyById(id);
      setProperty(data);
    } catch (error) {
      console.error("Failed to fetch property details", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const handleInvest = async () => {
    try {
      setIsInvesting(true);
      await exchangeService.subscribeToIPO(id, buyAmount);
      setToast({
        open: true,
        message: `Successfully purchased ${buyAmount} bricks!`,
        type: 'success'
      });
      fetchProperty(true); // Silent refresh
    } catch (error) {
      console.error("Investment failed", error);
      setToast({
        open: true,
        message: "Investment failed. Please check your balance.",
        type: 'error'
      });
    } finally {
      setIsInvesting(false);
    }
  };

  if (loading) {
    return <div className="py-24"><Loader size={48} text="Loading property details..." /></div>;
  }

  if (!property) return <div className="py-24 text-center">Property not found</div>;

  const price = property.financial?.ipo_price || 0;
  const locationStr = property.location ? `${property.location.city}, ${property.location.state}` : 'Location N/A';
  const builderName = property.builder?.company_name || 'Verified Builder';
  const builderRating = property.builder?.average_rating || 0;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center rounded-lg bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {property.ipo_status === 'active' ? 'Live IPO' : 'Project'}
            </span>
            <span className="inline-flex items-center rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {property.status || 'Active'}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl dark:text-white font-heading">
            {property.title}
          </h1>
          <div className="mt-2 flex items-center text-secondary-500 dark:text-secondary-400">
            <MapPin size={18} className="mr-1.5 text-primary-500" />
            <span>{locationStr}</span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Brick Price</p>
          <p className="text-3xl font-bold text-primary-700 dark:text-primary-400 font-heading">
            ₹{price.toLocaleString()}
          </p>
        </div>
      </div>

      <PropertyGallery images={property.images?.length > 0 ? property.images : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"]} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:divide-x md:divide-secondary-100 dark:divide-secondary-800">
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Bed size={24} className="mb-2 text-secondary-400" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">{property.investor_count || 0}</span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">Investors</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Bath size={24} className="mb-2 text-secondary-400" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">{property.view_count || 0}</span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">Total Views</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Square size={24} className="mb-2 text-secondary-400" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">{(property.financial?.total_bricks || 0).toLocaleString()}</span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">Total Bricks</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Calendar size={24} className="mb-2 text-secondary-400" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">
                  {property.timeline?.expected_completion ? new Date(property.timeline.expected_completion).getFullYear() : '2026'}
                </span>
                <span className="text-sm text-secondary-500 dark:text-secondary-400">Est. Completion</span>
              </div>
            </div>
          </Card>

          <div>
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4 font-heading">Description</h3>
            <div className="text-secondary-600 dark:text-secondary-400 leading-relaxed font-sans prose dark:prose-invert">
              {property.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-t-4 border-t-primary-500">
             <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-4 font-heading">Invest in this Project</h3>
             
             <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-secondary-500 uppercase mb-1 block">Quantity (Bricks)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-slate-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-500">Total Investment</span>
                  <span className="font-bold text-secondary-900 dark:text-white">₹{(buyAmount * price).toLocaleString()}</span>
                </div>
             </div>

             <div className="space-y-3">
               <Button 
                className="w-full h-12 text-lg" 
                onClick={handleInvest}
                isLoading={isInvesting}
               >
                 Confirm Investment
               </Button>
               <p className="text-[10px] text-center text-secondary-400">
                 By clicking confirm, you agree to the Offering Circular and platform Terms & Conditions.
               </p>
             </div>
          </Card>

          <Card className="bg-secondary-50 border-secondary-100 dark:bg-slate-900/50 dark:border-secondary-800">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4 font-heading flex items-center gap-2">
              <Shield size={20} className="text-primary-500" />
              Verified Builder
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg dark:bg-primary-900/40 dark:text-primary-400 text-sm">
                {builderName.substring(0,2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">{builderName}</p>
                <div className="flex items-center text-sm text-yellow-500">
                  ★ {builderRating.toFixed(1)} <span className="text-secondary-500 ml-1 dark:text-secondary-400">(Verified)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Toast 
        isOpen={toast.open} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
};

export default PropertyDetails;
