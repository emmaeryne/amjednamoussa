import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl font-semibold mb-4">Namoussa</h3>
            <p className="font-body text-sm text-primary-foreground/70 mb-6 leading-relaxed">
              L'élégance féminine au quotidien. Mode tendance et accessible pour toutes les femmes tunisiennes.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/namoussa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Liens Rapides</h4>
            <ul className="space-y-3">
              {["Accueil", "Collection", "Robes", "Ensembles", "Hijab", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase()}`}
                    className="font-body text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Catégories</h4>
            <ul className="space-y-3">
              {["Robes Midi", "Robes Soirée", "Blazers", "Pantalons", "Chemises Satin", "Foulards"].map((cat) => (
                <li key={cat}>
                  <span className="font-body text-sm text-primary-foreground/70 hover:text-secondary transition-colors cursor-pointer">
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-primary-foreground/70">Téléphone</p>
                  <a
                    href="tel:+21655991961"
                    className="font-body text-sm font-medium hover:text-secondary transition-colors"
                  >
                    +216 55 991 961
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-primary-foreground/70">Email</p>
                  <a 
                    href="mailto:contact@xnamoussa.com"
                    className="font-body text-sm hover:text-secondary transition-colors"
                  >
                    contact@xnamoussa.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-sm text-primary-foreground/70">Livraison</p>
                  <span className="font-body text-sm">Partout en Tunisie</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-sm text-primary-foreground/50">
              © 2024 Namoussa. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <span className="font-body text-sm text-primary-foreground/50 hover:text-secondary cursor-pointer transition-colors">
                Conditions Générales
              </span>
              <span className="font-body text-sm text-primary-foreground/50 hover:text-secondary cursor-pointer transition-colors">
                Politique de Confidentialité
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
