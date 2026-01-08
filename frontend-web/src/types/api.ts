// Types basés sur les modèles du backend

export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: number;
  photo?: string;
  userName: string;
  genre?: string;
  geom?: Point;
}

export interface Commune {
  gid: number;
  codeCommune: string;
  nomCommune: string;
  typeCommun: string;
  geom?: Point;
}

export interface Category {
  id: number;
  nom: string;
  famille: number;
}

export interface Annonce {
  id: number;
  geom?: Point;
  donnateur?: Utilisateur;
  titre: string;
  description: string;
  quatite: number; // Note: typo dans le backend
  date: string; // ISO date string
  photo?: string;
  status: 'déclarée' | 'approuvée' | 'rejetée' | 'annulée';
  commune?: Commune;
  categorie?: Category;
}

export interface Annonce_Perso {
  id: number;
  lat: number;
  longitude: number;
  commune: string;
  categorie: string;
  f_categorie: string;
}

export interface Annonce_Fcategorie {
  fcategorie: string;
  nbr_annonce: number;
}


