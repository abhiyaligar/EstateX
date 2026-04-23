import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const PropertyCard = ({ property }) => {
  // Extract values from the new nested structure provided by the backend
  const { 
    id, 
    title, 
    financial, 
    location: loc, 
    images, 
    investor_count, 
    view_count,
    type, 
    status,
    ipo_status 
  } = property;

  // Safe extraction for the UI
  const price = financial?.ipo_price || 0;
  const locationStr = loc ? `${loc.city}, ${loc.state}` : 'Location N/A';
  const imageUrl = images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  // Mapping project metrics to existing icons for now
  const bedsValue = investor_count || 0;
  const bathsValue = view_count || 0;
  const areaValue = financial?.total_bricks || 0;
  const displayStatus = ipo_status === 'active' ? 'Live IPO' : status || 'Project';

  return (
    <Card className="group flex h-full flex-col overflow-hidden bg-[#141414] border-white/5 hover:border-white/20 transition-all duration-500 rounded-none" noPadding>
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute left-6 top-6 flex gap-2">
          {type && (
            <span className="inline-flex items-center bg-black/40 backdrop-blur-md text-white border border-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
              {type}
            </span>
          )}
          {ipo_status === 'active' && (
            <span className="inline-flex items-center bg-red-600 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              Live IPO
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/40 hover:text-red-500">
          <Heart size={20} />
        </button>

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4">
          <p className="text-2xl font-bold text-white shadow-sm">
            ₹{(price || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-8 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
            <MapPin size={10} className="mr-2" />
            {locationStr}
          </div>
          <Link to={`/properties/${id}`}>
            <h3 className="font-serif text-2xl text-white group-hover:text-white/80 transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        <div className="text-xl font-light text-white/90">
          ₹{(price || 0).toLocaleString()} <span className="text-[10px] uppercase tracking-widest opacity-40 ml-1">Total Value</span>
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
          <div className="flex flex-col gap-1">
            <span className="text-white/60">{bedsValue}</span>
            <span>Investors</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/60">{bathsValue}</span>
            <span>Views</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/60">{(areaValue || 0).toLocaleString()}</span>
            <span>Bricks</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
