import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-black/10 dark:border-white/5 bg-background text-foreground py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-accent-red">
                <Building2 className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-2xl font-serif tracking-tight text-foreground uppercase">
                EstateX
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed max-w-xs tracking-wide">
              A sovereign real estate platform for the institutional investor. We provide the fortress for your financial sanctuary.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-500 hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent-red font-bold">Properties</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/properties" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  New Projects
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-300 font-bold">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors font-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-800 dark:text-zinc-300 font-bold">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                <Mail className="h-4 w-4" />
                info@estatex.com
              </li>
              <li className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                123 Real Estate Blvd<br/>
                New York, NY 10001
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 pt-12 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            &copy; {new Date().getFullYear()} EstateX. Institutional Grade Real Estate.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest text-zinc-500">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
