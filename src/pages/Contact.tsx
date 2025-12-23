import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact - Namoussa | Prêt-à-porter Femme Tunisie</title>
        <meta name="description" content="Contactez Namoussa pour toute question sur nos collections de prêt-à-porter femme en Tunisie." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <p className="font-body text-sm tracking-[0.3em] uppercase text-secondary mb-4">
                Contactez-nous
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Nous Sommes Là Pour Vous
              </h1>
              <p className="font-body text-muted-foreground max-w-2xl mx-auto">
                Une question? Besoin d'aide? N'hésitez pas à nous contacter par téléphone ou email.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">Téléphone</h3>
                      <p className="text-muted-foreground mb-3">Réponse rapide garantie</p>
                      <a href="tel:+21655991961">
                        <Button variant="elegant">
                          +216 55 991 961
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground mb-3">Pour les demandes détaillées</p>
                      <a 
                        href="mailto:contact@xnamoussa.com"
                        className="text-secondary hover:underline"
                      >
                        contact@xnamoussa.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">Horaires</h3>
                      <p className="text-muted-foreground">
                        Lundi - Samedi: 9h - 18h<br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 shadow-soft">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-1">Livraison</h3>
                      <p className="text-muted-foreground">
                        Livraison dans toute la Tunisie<br />
                        Paiement à la livraison
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order CTA */}
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-4">
                  Commandez en ligne
                </h2>
                <p className="text-muted-foreground mb-6">
                  Parcourez notre collection et passez votre commande directement sur notre site. Livraison rapide et paiement à la livraison!
                </p>
                <Link to="/category/robes">
                  <Button variant="elegant" size="lg">
                    Découvrir la collection
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
