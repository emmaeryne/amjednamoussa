import { Button } from "@/components/ui/button";

const AboutSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-4">
              Notre Histoire
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Namoussa, c'est l'élégance accessible
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-6 leading-relaxed">
              Née en Tunisie, Namoussa célèbre la femme moderne qui recherche style et confort au quotidien. Chaque pièce est sélectionnée avec soin pour vous offrir qualité et tendance à prix accessible.
            </p>
            <p className="font-body text-muted-foreground mb-8 leading-relaxed">
              De la robe casual aux ensembles chics, en passant par nos hijabs élégants, nous habillons toutes les femmes avec goût et raffinement.
            </p>
            <Button variant="hero" size="lg">
              En Savoir Plus
            </Button>
          </div>

          {/* Visual element */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-rose-light rounded-full blur-2xl" />
              
              {/* Main content box */}
              <div className="relative bg-card p-8 md:p-12 rounded-lg shadow-elegant">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-2">500+</p>
                    <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">Clientes Satisfaites</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-2">100+</p>
                    <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">Modèles Exclusifs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-4xl md:text-5xl font-semibold text-secondary mb-2">48h</p>
                    <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">Délai Livraison</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-4xl md:text-5xl font-semibold text-secondary mb-2">100%</p>
                    <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">Qualité Garantie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
