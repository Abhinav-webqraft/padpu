import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import AboutSection from '../components/home/AboutSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import GalleryPreview from '../components/home/GalleryPreview';
import Testimonials from '../components/home/Testimonials';

export default function HomePage() {
  return (
    <div style={{ overflowX: 'clip' }}>
      <HeroSection />
      <FeaturedProducts />
      <div className="relative">
        {/* Faded Background Image Layer starting after products */}
        <div 
          className="absolute inset-0 z-0 opacity-80 pointer-events-none"
          style={{
            background: 'url("/scenic-bg.jpeg") center/cover no-repeat fixed',
          }}
        />
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0f170c] via-[#0f170c]/40 to-[#0f170c]" />
        
        <div className="relative z-10">
          <AboutSection />
          <WhyChooseUs />
          <GalleryPreview />
          <Testimonials />
        </div>
      </div>
    </div>
  );
}
