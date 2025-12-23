import { Truck, CreditCard, RefreshCw, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Livraison Rapide",
    description: "Livraison partout en Tunisie sous 24-48h",
  },
  {
    icon: CreditCard,
    title: "Paiement à la Livraison",
    description: "Payez en espèces à la réception de votre commande",
  },
  {
    icon: RefreshCw,
    title: "Échange Facile",
    description: "7 jours pour échanger votre article",
  },
  {
    icon: MessageCircle,
    title: "Service Client",
    description: "Disponible par téléphone et email pour vous accompagner",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center group animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                <feature.icon size={28} className="text-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
