import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../ui/Button';

const PropertyGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use dummy images if none provided
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687931-cebf09646baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1628624747186-a941c476b7ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ];

  const handleNext = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:h-[500px] rounded-2xl overflow-hidden mb-8">
        {/* Main Image */}
        <div 
          className="md:col-span-3 relative h-[300px] md:h-full cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <img 
            src={displayImages[0]} 
            alt="Property Main" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Gallery
          </div>
        </div>
        
        {/* Grid Images */}
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
          <div className="relative h-full cursor-pointer group overflow-hidden" onClick={() => { setSelectedIndex(1); setIsFullscreen(true); }}>
            <img src={displayImages[1]} alt="Property View 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="relative h-full cursor-pointer group overflow-hidden" onClick={() => { setSelectedIndex(2); setIsFullscreen(true); }}>
            <img src={displayImages[2]} alt="Property View 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white font-medium text-lg">+{displayImages.length - 2} Photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
            onClick={() => setIsFullscreen(false)}
          >
            <X size={32} />
          </button>
          
          <button 
            className="absolute left-4 md:left-12 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 backdrop-blur-md bg-black/20 hidden md:block"
            onClick={handlePrev}
          >
            <ChevronLeft size={36} />
          </button>
          
          <div className="relative w-full h-full md:w-[80vw] md:h-[80vh] flex items-center justify-center px-4 md:px-0">
             <img 
               src={displayImages[selectedIndex]} 
               alt={`Property Gallery ${selectedIndex + 1}`} 
               className="max-w-full max-h-full object-contain animate-in fade-in duration-300" 
             />
             
             {/* Mobile Navigation */}
             <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 md:hidden z-50">
                <button onClick={handlePrev} className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full border border-white/20">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={handleNext} className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full border border-white/20">
                  <ChevronRight size={24} />
                </button>
             </div>
          </div>
          
          <button 
            className="absolute right-4 md:right-12 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-50 backdrop-blur-md bg-black/20 hidden md:block"
            onClick={handleNext}
          >
            <ChevronRight size={36} />
          </button>
          
          {/* Thumbnails */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto hidden md:flex">
             {displayImages.map((img, idx) => (
                <button 
                   key={idx}
                   onClick={() => setSelectedIndex(idx)}
                   className={cn(
                     "w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                     selectedIndex === idx ? "border-primary-500 opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                   )}
                >
                   <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
             ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGallery;
