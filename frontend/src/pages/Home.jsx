import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WhyColorSmith from '../components/WhyColorSmith';
import Testimonials from '../components/Testimonials';
import CategoriesList from './CategoriesList';
import HeroSection from '../components/HeroSection';
import FAQ from '../components/FAQ';
import ContactUs from '../components/ContactUs';

import StartBusinessMid from './StartBusinessMid';

export default function Home() {
  const location = useLocation();

  // Handle scroll to section when navigating with hash
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="relative overflow-hidden">
      {/* Pinkish decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Top-right pink glow */}
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full bg-pink-200/40 blur-[120px]" />
        {/* Left mid-page rose glow */}
        <div className="absolute top-[800px] -left-40 w-[400px] h-[400px] rounded-full bg-rose-200/30 blur-[100px]" />
        {/* Center fuchsia accent */}
        <div className="absolute top-[1600px] right-1/4 w-[350px] h-[350px] rounded-full bg-fuchsia-200/25 blur-[110px]" />
        {/* Bottom-left pink glow */}
        <div className="absolute top-[2800px] -left-20 w-[450px] h-[450px] rounded-full bg-pink-200/30 blur-[120px]" />
        {/* Bottom-right rose glow */}
        <div className="absolute top-[3600px] right-0 w-[400px] h-[400px] rounded-full bg-rose-100 blur-[100px]" />
      </div>

      <section id="hero">
        <HeroSection />
      </section>
      
      <section id="categories" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0">
        <CategoriesList />
      </section>
      <section id="start-business-mid" className="scroll-mt-20">
        <StartBusinessMid />
      </section>
     
     
      
      <section id="why-color-smith" className=" mt-16 pt-16 border-t border-slate-200/60 scroll-mt-20 lg:px-0">
        <WhyColorSmith />
      </section>

     
      
      <section id="testimonials" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0">
        <Testimonials />
      </section>
      <section id="faq" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0">
        <FAQ />
      </section>
      <section id="contact" className="scroll-mt-20">
        <ContactUs />
      </section>
    </div>
  );
}
