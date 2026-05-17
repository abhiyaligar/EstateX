import React from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const PropertyFilters = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="mb-16 bg-foreground/[0.03] p-6 border border-border">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-5">
          <Input
            icon={Search}
            placeholder="Search by property title..."
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div className="md:col-span-3 lg:col-span-3">
          <Input
            icon={MapPin}
            placeholder="Location"
            name="location"
            value={filters.location || ''}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div className="md:col-span-3 lg:col-span-2">
          <select
            name="type"
            value={filters.type || ''}
            onChange={handleChange}
            className="flex h-12 w-full rounded-none border border-border bg-background px-4 py-2 text-[10px] uppercase tracking-widest text-foreground transition-all focus-visible:outline-none focus-visible:border-border disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
          >
             <option value="" className="bg-background">All Types</option>
             <option value="House" className="bg-background">House</option>
             <option value="Apartment" className="bg-background">Apartment</option>
             <option value="Villa" className="bg-background">Villa</option>
             <option value="Commercial" className="bg-background">Commercial</option>
             <option value="Land" className="bg-background">Land</option>
          </select>
        </div>
        <div className="md:col-span-2 lg:col-span-2">
           <Button className="w-full" leftIcon={<SlidersHorizontal size={18} />}>
             Filters
           </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
