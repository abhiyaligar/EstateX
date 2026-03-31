import React, { useState, useEffect } from 'react';
import PropertyGrid from '../components/property/PropertyGrid';
import PropertyFilters from '../components/property/PropertyFilters';
import { Button } from '../components/ui/Button';
import { Filter } from 'lucide-react';
import propertyService from '../services/propertyService';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from backend
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const data = await propertyService.getProperties('active');
        setAllProperties(data);
        setProperties(data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter logic whenever filters or allProperties change
  useEffect(() => {
    let filtered = allProperties;
    
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.location) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    setProperties(filtered);
  }, [filters, allProperties]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-accent-red font-bold">The Portfolio</div>
          <h1 className="text-4xl md:text-6xl font-serif text-white">
            Properties for Sale
          </h1>
          <p className="text-white/40 font-light tracking-wide max-w-lg">
            Find your next investment opportunity from our verified institutional-grade listings.
          </p>
        </div>
        <div className="md:hidden">
          <Button 
            variant="outline" 
            className="w-full" 
            leftIcon={<Filter size={18} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <PropertyFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <PropertyGrid properties={properties} loading={loading} />
      
      {!loading && properties.length > 0 && (
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      )}
    </div>
  );
};

export default Properties;
