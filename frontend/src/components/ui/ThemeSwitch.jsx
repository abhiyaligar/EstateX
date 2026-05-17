import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeSwitch = ({ isPublic = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-500 overflow-hidden ${
        isDark 
          ? 'bg-accent-orange/20 border border-accent-orange/50 shadow-[0_0_15px_rgba(176,38,255,0.4)]' 
          : (isPublic ? 'bg-white/10 border border-white/20' : 'bg-foreground/5 border border-border')
      }`}
      aria-label="Toggle theme"
    >
      {/* Background Icons (static) */}
      <div className="absolute w-full flex justify-between px-[6px] pointer-events-none z-0 left-0">
        <Moon size={11} className={isDark ? 'text-accent-orange/50' : 'text-transparent'} />
        <Sun size={11} className={!isDark ? (isPublic ? 'text-white/50' : 'text-foreground/50') : 'text-transparent'} />
      </div>

      {/* The Handle */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`z-10 flex justify-center items-center h-5 w-5 rounded-full shadow-md ${
          isDark ? 'bg-accent-orange ml-auto' : 'bg-background mr-auto'
        }`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={11} className="text-white fill-white" />
          ) : (
            <Sun size={11} className="text-foreground fill-foreground" />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};

export default ThemeSwitch;
