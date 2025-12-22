import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Namoussa - Prêt-à-porter Femme Tunisie | Mode Élégante et Accessible</title>
        <meta
          name="description"
          content="Découvrez Namoussa, votre boutique de prêt-à-porter féminin en Tunisie. Robes, ensembles, chemises, hijabs. Livraison partout en Tunisie. Paiement à la livraison."
        />
        <meta name="keywords" content="mode femme tunisie, prêt-à-porter, robes, ensembles, hijab, vêtements femme, boutique en ligne tunisie" />
        <link rel="canonical" href="https://xnamoussa.com" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <CategoriesSection />
          <FeaturedProducts />
          <FeaturesSection />
          <AboutSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
