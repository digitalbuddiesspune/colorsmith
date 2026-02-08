import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WhyColorSmith from '../components/WhyColorSmith';
import Testimonials from '../components/Testimonials';
import CategoriesList from './CategoriesList';
import HeroSection from '../components/HeroSection';
import FAQ from '../components/FAQ';

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
    <div className="">
      <section id="hero">
        <HeroSection />
      </section>
      
      <section id="categories" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0">
        <CategoriesList />
      </section>
      
      <section id="why-color-smith" className="max-w-7xl mx-auto mt-16 pt-16 border-t border-slate-200 scroll-mt-20 px-4 lg:px-0">
        <WhyColorSmith />
      </section>
      
      <section id="testimonials" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0">
        <Testimonials />
      </section>
      <section id="faq" className="max-w-7xl mx-auto scroll-mt-20 px-4 lg:px-0 mb-10 ">
        <FAQ />
      </section>
    </div>
  );
}
