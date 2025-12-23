import { ArrowRight } from "lucide-react";
import categoryRobes from "@/assets/category-robes.jpg";
import categoryEnsembles from "@/assets/category-ensembles.jpg";
import categoryChemises from "@/assets/category-chemises.jpg";
import categoryPantalons from "@/assets/category-pantalons.jpg";
import categoryVestes from "@/assets/category-vestes.jpg";
import categoryHijab from "@/assets/category-hijab.jpg";

const categories = [
  {
    id: 1,
    name: "Robes",
    description: "Midi, Casual, Soirée",
    image: categoryRobes,
    count: "24 articles",
  },
  {
    id: 2,
    name: "Ensembles",
    description: "Pantalon + Top, Jupe + Chemise",
    image: categoryEnsembles,
    count: "18 articles",
  },
  {
    id: 3,
    name: "Chemises",
    description: "Satin, Oversize, Coton",
    image: categoryChemises,
    count: "32 articles",
  },
  {
    id: 4,
    name: "Pantalons",
    description: "Large, Palazzo, Taille haute",
    image: categoryPantalons,
    count: "28 articles",
  },
  {
    id: 5,
    name: "Vestes",
    description: "Blazer, Jean, Kimono",
    image: categoryVestes,
    count: "15 articles",
  },
  {
    id: 6,
    name: "Hijab & Foulards",
    description: "Élégants et confortables",
    image: categoryHijab,
    count: "42 articles",
  },
];

const CategoriesSection = () => {
  return (
    <section id="collection" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-4">
            Nos Catégories
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
            Explorez Notre Collection
          </h2>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group relative overflow-hidden bg-card rounded-lg shadow-soft hover:shadow-elegant transition-all duration-500 cursor-pointer animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-body text-xs tracking-wider uppercase text-secondary mb-1">
                      {category.count}
                    </p>
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-foreground transition-colors duration-300">
                    <ArrowRight size={18} className="text-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
