import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-model.jpg";

const HeroSection = () => {
  const scrollToCollection = () => {
    const element = document.getElementById("collection");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-rose" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4 animate-fade-in-up opacity-0 animation-delay-100">
              Nouvelle Collection
            </p>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight mb-6 animate-fade-in-up opacity-0 animation-delay-200">
              L'Élégance
              <br />
              <span className="text-gradient-rose">au Féminin</span>
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 animate-fade-in-up opacity-0 animation-delay-300">
              Découvrez notre collection de prêt-à-porter féminin alliant style moderne et élégance intemporelle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up opacity-0 animation-delay-400">
              <Button variant="hero" size="xl" onClick={scrollToCollection}>
                Découvrir
              </Button>
              <Link to="/nouveautes">
                <Button variant="heroOutline" size="xl">
                  Nouvelle Arrivée
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start animate-fade-in-up opacity-0 animation-delay-500">
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">100%</p>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Qualité</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">24h</p>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Livraison</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">COD</p>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Paiement</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
              <img
                src={heroImage}
                alt="Collection Namoussa - Mode féminine élégante"
                className="relative w-full h-auto object-cover rounded-lg shadow-elegant animate-fade-in opacity-0 animation-delay-200"
              />
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-secondary rounded-full animate-float" />
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-secondary/30 rounded-full animate-float animation-delay-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
