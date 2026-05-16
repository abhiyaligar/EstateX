import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Mail, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-black/5 bg-white text-black py-24 selection:bg-accent-orange/10 selection:text-accent-orange">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-4">
              <div className="h-10 w-10 bg-accent-orange flex items-center justify-center rounded-sm">
                <Zap className="h-6 w-6 text-white fill-white" />
              </div>
              <span className="text-2xl font-heading font-black tracking-tighter text-black uppercase">
                EstateX
              </span>
            </Link>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xs tracking-wide">
              The essential infrastructure for the next generation of real estate capital. Regulated. Built for execution.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-400 hover:text-accent-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-accent-orange transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-accent-orange transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent-orange font-black">Protocol</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/ipo" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  Trading Room
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  Market Explore
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  Technical Docs
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-black font-black">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-zinc-500 hover:text-black transition-colors font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-black font-black">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                <Mail className="h-4 w-4" />
                terminal@estatex.com
              </li>
              <li className="text-sm text-zinc-500 font-medium leading-relaxed">
                Institutional Node 01<br/>
                Cyber City, Bangalore
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            &copy; {new Date().getFullYear()} EstateX. Built for Sovereignty.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
            <a href="#" className="hover:text-black transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
