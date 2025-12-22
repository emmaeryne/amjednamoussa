import { useState, useEffect } from "react";
import { Menu, X, Search, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CartSheet from "@/components/CartSheet";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useSearchProducts } from "@/hooks/useProducts";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const { data: searchResults, isLoading: isSearching } = useSearchProducts(searchQuery);

  // Raccourci clavier pour ouvrir la recherche (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Réinitialiser la recherche quand le dialog se ferme
  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Robes", href: "/robes" },
    { name: "Ensembles", href: "/ensembles" },
    { name: "Sacs", href: "/sacs" },
    { name: "Talons", href: "/talons" },
    { name: "Top", href: "/top" },
    { name: "Hijab", href: "/hijab" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-1 md:flex-none text-center md:text-left flex items-center gap-3">
            {logoError ? (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                <span className="font-display text-xl md:text-2xl font-bold text-foreground">N</span>
              </div>
            ) : (
              <img 
                src="/logo.svg" 
                alt="Namoussa Logo" 
                className="w-10 h-10 md:w-12 md:h-12"
                onError={() => setLogoError(true)}
              />
            )}
            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
              Namoussa
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="font-body text-sm tracking-wider uppercase text-foreground hover:text-secondary transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground hover:text-secondary transition-colors hidden md:block"
              aria-label="Rechercher"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-foreground hover:text-secondary transition-colors md:hidden"
              aria-label="Rechercher"
            >
              <Search size={20} />
            </button>
            <CartSheet />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 bg-background border-t border-border">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-3 font-body text-sm tracking-wider uppercase text-foreground hover:text-secondary transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Rechercher un produit..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isSearching && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Recherche en cours...
            </div>
          )}
          {!isSearching && searchQuery && searchResults && searchResults.length === 0 && (
            <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
          )}
          {!isSearching && searchResults && searchResults.length > 0 && (
            <CommandGroup heading="Produits">
              {searchResults.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    navigate(`/produit/${product.id}`);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {product.price} TND
                      {product.category && ` • ${product.category.name}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </nav>
  );
};

export default Navbar;
