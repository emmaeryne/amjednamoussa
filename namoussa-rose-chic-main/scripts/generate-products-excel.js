import XLSX from 'xlsx';

// Données de produits d'exemple pour Namoussa
const products = [
  // ROBES
  {
    'Nom du produit': 'Robe Midi Élégante',
    'Description': 'Robe midi élégante en satin avec manches longues. Parfaite pour toutes les occasions.',
    'Prix (DT)': 89.99,
    'URL Image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    'Catégorie': 'Robes',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Rose',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Robe Soirée Longue',
    'Description': 'Robe de soirée longue et élégante avec broderies délicates. Idéale pour les événements spéciaux.',
    'Prix (DT)': 159.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    'Catégorie': 'Robes',
    'Tailles (séparées par virgule)': 'M, L, XL',
    'Couleurs (séparées par virgule)': 'Noir, Bleu marine, Bordeaux',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Robe Casual Satin',
    'Description': 'Robe casual en satin fluide, confortable et élégante pour le quotidien.',
    'Prix (DT)': 79.99,
    'URL Image': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800',
    'Catégorie': 'Robes',
    'Tailles (séparées par virgule)': 'S, M, L, XL, XXL',
    'Couleurs (séparées par virgule)': 'Beige, Rose poudré, Blanc',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // ENSEMBLES
  {
    'Nom du produit': 'Ensemble Blazer Noir',
    'Description': 'Ensemble élégant composé d\'un blazer et d\'un pantalon assorti. Parfait pour le bureau.',
    'Prix (DT)': 199.99,
    'URL Image': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    'Catégorie': 'Ensembles',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Noir, Gris, Bleu marine',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Ensemble Jupe + Chemise',
    'Description': 'Ensemble coordonné jupe plissée et chemise élégante. Style moderne et féminin.',
    'Prix (DT)': 149.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
    'Catégorie': 'Ensembles',
    'Tailles (séparées par virgule)': 'S, M, L',
    'Couleurs (séparées par virgule)': 'Beige, Blanc, Rose',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // CHEMISES
  {
    'Nom du produit': 'Chemise Satin Oversize',
    'Description': 'Chemise oversize en satin fluide, confortable et tendance. Se porte avec tout.',
    'Prix (DT)': 69.99,
    'URL Image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'Catégorie': 'Chemises',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Blanc, Beige, Rose, Bleu ciel',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Blouse Élégante Manches Longues',
    'Description': 'Blouse élégante en coton avec manches longues et col boutonné. Style classique et raffiné.',
    'Prix (DT)': 59.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    'Catégorie': 'Chemises',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Blanc, Noir, Beige',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // PANTALONS
  {
    'Nom du produit': 'Pantalon Palazzo Large',
    'Description': 'Pantalon palazzo large et fluide, très confortable. Style élégant et moderne.',
    'Prix (DT)': 89.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
    'Catégorie': 'Pantalons',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Gris, Bordeaux',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Pantalon Taille Haute',
    'Description': 'Pantalon taille haute en tissu stretch, confortable et flatteur.',
    'Prix (DT)': 79.99,
    'URL Image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'Catégorie': 'Pantalons',
    'Tailles (séparées par virgule)': 'S, M, L, XL, XXL',
    'Couleurs (séparées par virgule)': 'Noir, Bleu marine, Gris',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // VESTES
  {
    'Nom du produit': 'Blazer Classique',
    'Description': 'Blazer classique et intemporel, parfait pour compléter toutes vos tenues.',
    'Prix (DT)': 129.99,
    'URL Image': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800',
    'Catégorie': 'Vestes',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Bleu marine',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Veste Kimono Élégante',
    'Description': 'Veste kimono en satin avec motifs élégants. Style bohème et raffiné.',
    'Prix (DT)': 99.99,
    'URL Image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    'Catégorie': 'Vestes',
    'Tailles (séparées par virgule)': 'S, M, L',
    'Couleurs (séparées par virgule)': 'Beige, Rose, Bleu',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // HIJAB & FOULARDS
  {
    'Nom du produit': 'Hijab Satin Premium',
    'Description': 'Hijab en satin premium, doux et confortable. Ne glisse pas et reste en place.',
    'Prix (DT)': 29.99,
    'URL Image': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800',
    'Catégorie': 'Hijab & Foulards',
    'Tailles (séparées par virgule)': 'Unique',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Blanc, Rose, Bleu, Gris',
    'En stock (Oui/Non)': 'Oui'
  },
  {
    'Nom du produit': 'Foulard Soie Élégant',
    'Description': 'Foulard en soie avec motifs délicats. Accessoire parfait pour toutes les occasions.',
    'Prix (DT)': 39.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    'Catégorie': 'Hijab & Foulards',
    'Tailles (séparées par virgule)': 'Unique',
    'Couleurs (séparées par virgule)': 'Beige, Rose, Bleu, Vert, Multicolore',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // SACS
  {
    'Nom du produit': 'Sac à Main Élégant',
    'Description': 'Sac à main élégant en cuir synthétique avec poignées et bandoulière. Style moderne.',
    'Prix (DT)': 89.99,
    'URL Image': 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800',
    'Catégorie': 'Sacs',
    'Tailles (séparées par virgule)': 'Unique',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Rose, Bleu',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // TALONS
  {
    'Nom du produit': 'Escarpins Classiques',
    'Description': 'Escarpins classiques en cuir avec talon moyen. Confortables et élégants.',
    'Prix (DT)': 119.99,
    'URL Image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'Catégorie': 'Talons',
    'Tailles (séparées par virgule)': '36, 37, 38, 39, 40, 41',
    'Couleurs (séparées par virgule)': 'Noir, Beige, Rouge, Bleu',
    'En stock (Oui/Non)': 'Oui'
  },
  
  // PULLS
  {
    'Nom du produit': 'Pull Doux Confortable',
    'Description': 'Pull en laine douce et confortable. Parfait pour les saisons fraîches.',
    'Prix (DT)': 69.99,
    'URL Image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    'Catégorie': 'Pulls',
    'Tailles (séparées par virgule)': 'S, M, L, XL',
    'Couleurs (séparées par virgule)': 'Beige, Gris, Noir, Rose, Bleu',
    'En stock (Oui/Non)': 'Oui'
  }
];

// Créer un workbook
const wb = XLSX.utils.book_new();

// Créer la feuille de produits
const ws = XLSX.utils.json_to_sheet(products);

// Définir la largeur des colonnes
ws['!cols'] = [
  { wch: 30 }, // Nom du produit
  { wch: 50 }, // Description
  { wch: 12 }, // Prix
  { wch: 40 }, // URL Image
  { wch: 20 }, // Catégorie
  { wch: 35 }, // Tailles
  { wch: 35 }, // Couleurs
  { wch: 18 }, // En stock
];

// Ajouter la feuille au workbook
XLSX.utils.book_append_sheet(wb, ws, 'Produits');

// Créer une feuille avec les catégories disponibles
const categories = [
  { 'Catégories disponibles': 'Robes' },
  { 'Catégories disponibles': 'Ensembles' },
  { 'Catégories disponibles': 'Chemises' },
  { 'Catégories disponibles': 'Pantalons' },
  { 'Catégories disponibles': 'Vestes' },
  { 'Catégories disponibles': 'Hijab & Foulards' },
  { 'Catégories disponibles': 'Sacs' },
  { 'Catégories disponibles': 'Talons' },
  { 'Catégories disponibles': 'Pulls' },
];

const categoriesSheet = XLSX.utils.json_to_sheet(categories);
categoriesSheet['!cols'] = [{ wch: 25 }];
XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Catégories');

// Écrire le fichier
XLSX.writeFile(wb, 'produits-namoussa.xlsx');

console.log('✅ Fichier Excel créé avec succès: produits-namoussa.xlsx');
console.log(`📦 ${products.length} produits ajoutés`);
console.log('📋 Vous pouvez maintenant remplir ce fichier et l\'importer dans l\'application!');

