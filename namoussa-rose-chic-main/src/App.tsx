import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import Nouveautes from "./pages/Nouveautes";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/nouveautes" element={<Nouveautes />} />
              <Route path="/robes" element={<CategoryPage />} />
              <Route path="/ensembles" element={<CategoryPage />} />
              <Route path="/chemises" element={<CategoryPage />} />
              <Route path="/pantalons" element={<CategoryPage />} />
              <Route path="/vestes" element={<CategoryPage />} />
              <Route path="/hijab" element={<CategoryPage />} />
              <Route path="/sacs" element={<CategoryPage />} />
              <Route path="/talons" element={<CategoryPage />} />
              <Route path="/top" element={<CategoryPage />} />
              <Route path="/pulls" element={<CategoryPage />} />
              <Route path="/collection" element={<CategoryPage />} />
              <Route path="/produit/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
