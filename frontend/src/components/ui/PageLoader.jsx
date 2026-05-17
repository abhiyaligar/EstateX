import React from 'react';
import { motion } from 'framer-motion';

const PageLoader = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-2 border-r-2 border-transparent border-t-blue-500 border-r-blue-500 rounded-full"
        />
        
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-16 h-16 border-b-2 border-l-2 border-transparent border-b-purple-500 border-l-purple-500 rounded-full"
        />
        
        {/* Pulsing Core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 bg-blue-500/20 rounded-full blur-xl"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-blue-400 font-medium tracking-widest text-sm uppercase"
      >
        Initializing EstateX
      </motion.div>
    </div>
  );
};

export default PageLoader;
