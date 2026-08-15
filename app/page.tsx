import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { Destinations } from '@/components/home/Destinations';
import { AmenitiesStrip } from '@/components/home/AmenitiesStrip';
import { MapPreviewSection } from '@/components/home/MapPreviewSection';
import { OwnerCTA } from '@/components/home/OwnerCTA';
import { RecentlyViewedSection } from '@/components/properties/RecentlyViewedSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <RecentlyViewedSection />
        <FeaturedProperties />
        <Destinations />
        <AmenitiesStrip />
        <MapPreviewSection />
        <OwnerCTA />
      </main>
      <Footer />
    </>
  );
}
