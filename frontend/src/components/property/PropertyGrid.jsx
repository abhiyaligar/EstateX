import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyGrid = ({ properties, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-secondary-100 p-4 dark:bg-secondary-800/50">
            <div className="mb-4 aspect-[4/3] rounded-xl bg-secondary-200 dark:bg-secondary-700" />
            <div className="mb-3 h-6 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
            <div className="mb-4 h-4 w-1/2 rounded bg-secondary-200 dark:bg-secondary-700" />
            <div className="flex justify-between border-t border-secondary-200 pt-4 dark:border-secondary-700">
              <div className="h-5 w-10 rounded bg-secondary-200 dark:bg-secondary-700" />
              <div className="h-5 w-10 rounded bg-secondary-200 dark:bg-secondary-700" />
              <div className="h-5 w-16 rounded bg-secondary-200 dark:bg-secondary-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-secondary-300 bg-secondary-50 p-8 text-center dark:border-secondary-700 dark:bg-secondary-900/20">
        <div className="mb-4 rounded-full bg-secondary-100 p-4 dark:bg-secondary-800">
          <svg className="h-8 w-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-secondary-900 dark:text-foreground">No properties found</h3>
        <p className="max-w-md text-sm text-secondary-500 dark:text-secondary-400">
          We couldn't find any properties matching your criteria. Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export default PropertyGrid;
