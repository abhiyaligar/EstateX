import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, TrendingUp, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PropertyGrid from '../components/property/PropertyGrid';
import propertyService from '../services/propertyService';
import LiquidChrome from '../components/ui/LiquidChrome';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await propertyService.getProperties('active');
        setFeaturedProperties(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden px-6 lg:px-8">
        {/* Local Background - Localized to Home Only */}
        <div className="absolute inset-0 z-0">
          <LiquidChrome 
            baseColor={[1.0, 1.0, 1.0]} 
            speed={0.12} 
            amplitude={0.6} 
            interactive={true}
          />
        </div>
 
        <div className="mx-auto max-w-5xl text-center space-y-16 relative z-10">
          <div className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold mb-4">
            <span className="h-px w-10 bg-white/10"></span>
            System Status: 01 // Wealth Synchronization
          </div>
          
          <h1 className="text-4xl sm:text-7xl md:text-9xl font-bold text-white leading-tight md:leading-[0.9] tracking-tighter uppercase font-heading">
            Architect your <br />
            <span className="italic opacity-20">Attention.</span>
          </h1>

          <p className="mt-12 text-lg md:text-xl leading-relaxed text-zinc-400 max-w-3xl mx-auto font-medium tracking-tight">
            Real estate investment is a fractured landscape of noise. <br className="hidden md:block" />
            EstateX is the fortress—an adaptive digital environment for institutional-grade growth.
          </p>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/properties">
              <Button size="lg" className="px-16 py-8 bg-primary-600 text-white hover:bg-primary-700 rounded-[var(--radius)] text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-primary-900/20 border-none">
                Enter the Sanctuary
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-16 py-8 border-white/10 text-white hover:bg-white/5 rounded-[var(--radius)] text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
              onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it works
            </Button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="absolute bottom-12 left-12 hidden lg:block z-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold leading-loose">
            Validation Protocol // <br />
            <span className="text-zinc-400 font-semibold uppercase">Linear, OpenAI, and Teenage Engineering.</span>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="methodology" className="py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent-red font-bold">The Methodology</div>
            <h2 className="text-4xl md:text-5xl font-serif text-white">
              Why Invest with EstateX
            </h2>
            <p className="text-white/40 font-light tracking-wide max-w-lg mx-auto">
              A sovereign approach to capital allocation. We've removed the noise from real estate acquisition.
            </p>
          </div>
          <div className="mx-auto mt-24 max-w-2xl lg:max-w-none">
            <dl className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-3">
              <div className="flex flex-col space-y-6">
                <dt className="flex flex-col gap-4">
                  <div className="h-px w-12 bg-accent-red"></div>
                  <span className="text-xl font-serif text-white">Institutional Sovereignty</span>
                </dt>
                <dd className="text-white/40 font-light leading-relaxed">
                  Fully audited KYC, secure escrow protocols, and blockchain-immutable records ensure your positions are absolute.
                </dd>
              </div>
              <div className="flex flex-col space-y-6 border-l border-white/5 lg:pl-12">
                <dt className="flex flex-col gap-4">
                  <div className="h-px w-12 bg-white/20"></div>
                  <span className="text-xl font-serif text-white">Fractional Precision</span>
                </dt>
                <dd className="text-white/40 font-light leading-relaxed">
                  Start with focus. Deploy capital into premium commercial and residential tranches with total liquidity.
                </dd>
              </div>
              <div className="flex flex-col space-y-6 border-l border-white/5 lg:pl-12">
                <dt className="flex flex-col gap-4">
                  <div className="h-px w-12 bg-white/20"></div>
                  <span className="text-xl font-serif text-white">Curated Sanctuaries</span>
                </dt>
                <dd className="text-white/40 font-light leading-relaxed">
                  Every asset undergoes multi-point legal validation and financial symmetry modeling before entering the vault.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-32 px-6 lg:px-12 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-20">
            <div className="space-y-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-accent-red font-bold">Featured Assets</div>
              <h2 className="text-4xl md:text-5xl font-serif text-white">Current Listings</h2>
            </div>
            <Link to="/properties" className="hidden sm:block pb-1">
              <Button variant="ghost" className="text-[10px] uppercase tracking-widest flex items-center gap-2">
                All Properties <ArrowRight size={12} />
              </Button>
            </Link>
          </div>

          <PropertyGrid properties={featuredProperties} loading={loading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="bg-[#141414] px-6 py-24 sm:p-24 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-red/5 blur-[100px] rounded-full"></div>
            <div className="mx-auto max-w-2xl text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                Begin your <br />
                <span className="italic opacity-80">Sovereign Session.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg font-light text-white/40 tracking-wide">
                Join the vanguard of institutional fractional investing. Secure your position in the next generation of real estate.
              </p>
              <div className="mt-12 flex items-center justify-center">
                <Link to="/register">
                  <Button size="lg" className="px-16 bg-white text-black hover:bg-neutral-200">Get started today</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
