import { ProductTypePreset } from '@/types/variants'

export const WORLD_PRODUCT_PRESETS: ProductTypePreset[] = [
  {
    id: 'smartphones',
    categoryLabel: 'Smartphones & Téléphones',
    iconName: 'Smartphone',
    description: 'Smartphones, Feature Phones, Phablettes (Couleur, Stockage, RAM)',
    defaultOptions: [
      {
        name: 'Couleur',
        display_type: 'color',
        defaultValues: [
          { value: 'Noir Sidéral', hex: '#1c1c1e' },
          { value: 'Titanium Naturel', hex: '#8a8886' },
          { value: 'Bleu Nuit', hex: '#1b2a4a' },
          { value: 'Argent / Blanc', hex: '#f0f0f5' },
          { value: 'Or / Champagne', hex: '#e3c896' },
        ],
      },
      {
        name: 'Stockage Interne',
        display_type: 'button',
        defaultValues: [
          { value: '128 Go' },
          { value: '256 Go' },
          { value: '512 Go' },
          { value: '1 To' },
        ],
      },
      {
        name: 'Mémoire RAM',
        display_type: 'button',
        defaultValues: [
          { value: '6 Go' },
          { value: '8 Go' },
          { value: '12 Go' },
          { value: '16 Go' },
        ],
      },
    ],
  },
  {
    id: 'laptops',
    categoryLabel: 'Ordinateurs & Laptops',
    iconName: 'Laptop',
    description: 'PC Portables, Desktops, Laptops Gamer (RAM, SSD, Processeur, Couleur)',
    defaultOptions: [
      {
        name: 'Mémoire RAM',
        display_type: 'button',
        defaultValues: [
          { value: '8 Go' },
          { value: '16 Go' },
          { value: '32 Go' },
          { value: '64 Go' },
        ],
      },
      {
        name: 'Stockage SSD',
        display_type: 'button',
        defaultValues: [
          { value: '256 Go SSD' },
          { value: '512 Go SSD' },
          { value: '1 To SSD' },
          { value: '2 To SSD' },
        ],
      },
      {
        name: 'Processeur',
        display_type: 'select',
        defaultValues: [
          { value: 'Intel Core i5 / AMD Ryzen 5' },
          { value: 'Intel Core i7 / AMD Ryzen 7' },
          { value: 'Intel Core i9 / AMD Ryzen 9' },
          { value: 'Apple M2 / M3 / M4' },
        ],
      },
      {
        name: 'Couleur',
        display_type: 'color',
        defaultValues: [
          { value: 'Gris Sidéral', hex: '#4b4c4e' },
          { value: 'Noir Mat', hex: '#111111' },
          { value: 'Argent', hex: '#e0e0e0' },
        ],
      },
    ],
  },
  {
    id: 'clothing',
    categoryLabel: 'Mode & Vêtements',
    iconName: 'Shirt',
    description: 'Chemises, T-shirts, Robes, Pantalons, Vestes (Couleur, Taille, Matière)',
    defaultOptions: [
      {
        name: 'Couleur',
        display_type: 'color',
        defaultValues: [
          { value: 'Noir', hex: '#000000' },
          { value: 'Blanc', hex: '#ffffff' },
          { value: 'Bleu Marine', hex: '#000080' },
          { value: 'Rouge', hex: '#cc0000' },
          { value: 'Vert Olive', hex: '#556b2f' },
          { value: 'Beige', hex: '#f5f5dc' },
        ],
      },
      {
        name: 'Taille',
        display_type: 'button',
        defaultValues: [
          { value: 'S' },
          { value: 'M' },
          { value: 'L' },
          { value: 'XL' },
          { value: 'XXL' },
          { value: '3XL' },
        ],
      },
      {
        name: 'Matière',
        display_type: 'button',
        defaultValues: [
          { value: '100% Coton' },
          { value: 'Soie' },
          { value: 'Lainage' },
          { value: 'Jean / Denim' },
          { value: 'Polyester Premium' },
        ],
      },
    ],
  },
  {
    id: 'shoes',
    categoryLabel: 'Chaussures & Sneakers',
    iconName: 'Footprints',
    description: 'Baskets, Mocasins, Escarpins, Bottes (Couleur, Pointure, Matière)',
    defaultOptions: [
      {
        name: 'Couleur',
        display_type: 'color',
        defaultValues: [
          { value: 'Noir', hex: '#000000' },
          { value: 'Blanc Pure', hex: '#ffffff' },
          { value: 'Maron / Cuir', hex: '#5c4033' },
          { value: 'Bleu Royal', hex: '#4169e1' },
        ],
      },
      {
        name: 'Pointure (EU)',
        display_type: 'button',
        defaultValues: [
          { value: '37' },
          { value: '38' },
          { value: '39' },
          { value: '40' },
          { value: '41' },
          { value: '42' },
          { value: '43' },
          { value: '44' },
          { value: '45' },
        ],
      },
      {
        name: 'Matière',
        display_type: 'button',
        defaultValues: [
          { value: 'Cuir Véritable' },
          { value: 'Daim / Suédine' },
          { value: 'Similicuir' },
          { value: 'Tissu Respirant Mesh' },
        ],
      },
    ],
  },
  {
    id: 'bedding_mattress',
    categoryLabel: 'Matelas & Literie',
    iconName: 'BedDouble',
    description: 'Matelas, Sommiers, Draps (Nombre de places, Épaisseur, Densité)',
    defaultOptions: [
      {
        name: 'Nombre de places',
        display_type: 'button',
        defaultValues: [
          { value: '1 Place (90/190)' },
          { value: '2 Places (140/190)' },
          { value: '3 Places (160/190)' },
          { value: '4 Places King Size (180/190)' },
          { value: '5 Places Carré (200/200)' },
        ],
      },
      {
        name: 'Épaisseur',
        display_type: 'button',
        defaultValues: [
          { value: '10 CM' },
          { value: '12 CM' },
          { value: '15 CM' },
          { value: '18 CM' },
          { value: '20 CM' },
          { value: '25 CM' },
        ],
      },
    ],
  },
  {
    id: 'furniture_sofas',
    categoryLabel: 'Meubles, Canapés & Salons',
    iconName: 'Armchair',
    description: 'Canapés, Fauteuils, Tables, Buffets (Nombre de places, Matière, Couleur)',
    defaultOptions: [
      {
        name: 'Nombre de places',
        display_type: 'button',
        defaultValues: [
          { value: '1 Place (Fauteuil)' },
          { value: '2 Places' },
          { value: '3 Places' },
          { value: '5 Places (Angle L)' },
          { value: '7 Places (Salon Complet)' },
        ],
      },
      {
        name: 'Matière / Revêtement',
        display_type: 'button',
        defaultValues: [
          { value: 'Velours Anti-tache' },
          { value: 'Cuir Italien' },
          { value: 'Similicuir Luxe' },
          { value: 'Tissu Tissé' },
        ],
      },
      {
        name: 'Couleur',
        display_type: 'color',
        defaultValues: [
          { value: 'Gris Anthracite', hex: '#383838' },
          { value: 'Bleu Canard', hex: '#005f73' },
          { value: 'Beige / Crème', hex: '#f5f5dc' },
          { value: 'Maron Chocolat', hex: '#3d2314' },
        ],
      },
    ],
  },
  {
    id: 'appliances_tv',
    categoryLabel: 'Télévisions, Hi-Fi & Électroménager',
    iconName: 'Tv',
    description: 'TV Smart, Réfrigérateurs, Climatiseurs, Cuisinières (Taille Écran, Puissance, Couleur)',
    defaultOptions: [
      {
        name: 'Taille Écran / Capacité',
        display_type: 'button',
        defaultValues: [
          { value: '32 Pouces (80cm)' },
          { value: '43 Pouces (108cm)' },
          { value: '55 Pouces (140cm)' },
          { value: '65 Pouces (165cm)' },
          { value: '75 Pouces (190cm)' },
        ],
      },
      {
        name: 'Couleur / Finition',
        display_type: 'color',
        defaultValues: [
          { value: 'Noir Mat', hex: '#111111' },
          { value: 'Inox Brossé', hex: '#d3d3d3' },
          { value: 'Gris Métallisé', hex: '#808080' },
        ],
      },
    ],
  },
  {
    id: 'beauty_perfumes',
    categoryLabel: 'Parfums & Cosmétiques',
    iconName: 'Sparkles',
    description: 'Parfums, Crèmes, Maquillage (Volume ml, Concentration, Fragrance)',
    defaultOptions: [
      {
        name: 'Volume',
        display_type: 'button',
        defaultValues: [
          { value: '30 ML' },
          { value: '50 ML' },
          { value: '100 ML' },
          { value: '200 ML' },
        ],
      },
      {
        name: 'Concentration',
        display_type: 'select',
        defaultValues: [
          { value: 'Eau de Parfum (EdP)' },
          { value: 'Eau de Toilette (EdT)' },
          { value: 'Extrait de Parfum / Elixir' },
        ],
      },
    ],
  },
  {
    id: 'auto_moto',
    categoryLabel: 'Auto, Moto & Pièces Détachées',
    iconName: 'Car',
    description: 'Pneus, Casques, Accessoires Auto/Moto (Compatibilité, Année, Finition)',
    defaultOptions: [
      {
        name: 'Compatibilité / Marque',
        display_type: 'select',
        defaultValues: [
          { value: 'Toyota' },
          { value: 'Mercedes-Benz' },
          { value: 'BMW' },
          { value: 'Hyundai / Kia' },
          { value: 'Universel' },
        ],
      },
      {
        name: 'Couleur / Finition',
        display_type: 'color',
        defaultValues: [
          { value: 'Noir Carbone', hex: '#1a1a1a' },
          { value: 'Chromé / Argent', hex: '#e6e6e6' },
          { value: 'Rouge Sport', hex: '#d60000' },
        ],
      },
    ],
  },
  {
    id: 'custom_generic',
    categoryLabel: 'Produit Sur-mesure / Autre',
    iconName: 'Layers',
    description: 'Créez vos propres critères 100% librement sans aucune restriction.',
    defaultOptions: [],
  },
]
