import type { AxiosRequestConfig } from 'axios';

const DATA_VERSION = 'v3'; // Incrémentez pour forcer un reset propre

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Fonction pour charger les dons depuis localStorage
function loadDonationsFromStorage(): any[] {
  try {
    const stored = localStorage.getItem('sadaka_donations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur lors du chargement des dons depuis localStorage', e);
  }
  return [];
}

// Fonction pour sauvegarder les dons dans localStorage
function saveDonationsToStorage(donations: any[]) {
  try {
    localStorage.setItem('sadaka_donations', JSON.stringify(donations));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des dons dans localStorage', e);
  }
}

// Fonction pour charger les utilisateurs depuis localStorage
function loadUsersFromStorage(): Record<string, any> {
  try {
    const stored = localStorage.getItem('sadaka_users');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur lors du chargement des utilisateurs depuis localStorage', e);
  }
  return {};
}

// Fonction pour sauvegarder les utilisateurs dans localStorage
function saveUsersToStorage(users: Record<string, any>) {
  try {
    localStorage.setItem('sadaka_users', JSON.stringify(users));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des utilisateurs dans localStorage', e);
  }
}

// Fonction pour charger les dons par utilisateur depuis localStorage
function loadUserDonationsFromStorage(): Record<string, any[]> {
  try {
    const stored = localStorage.getItem('sadaka_user_donations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erreur lors du chargement des dons utilisateurs depuis localStorage', e);
  }
  return {};
}

// Fonction pour sauvegarder les dons par utilisateur dans localStorage
function saveUserDonationsToStorage(userDonations: Record<string, any[]>) {
  try {
    localStorage.setItem('sadaka_user_donations', JSON.stringify(userDonations));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des dons utilisateurs dans localStorage', e);
  }
}

// Fonction pour exporter toutes les données en JSON
export function exportAllDataAsJSON() {
  const donations = loadDonationsFromStorage();
  const users = loadUsersFromStorage();
  const userDonations = loadUserDonationsFromStorage();
  
  return {
    donations,
    users,
    userDonations,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
}

// Fonction pour importer des données depuis JSON
export function importDataFromJSON(data: any) {
  try {
    if (data.donations) {
      saveDonationsToStorage(data.donations);
    }
    if (data.users) {
      saveUsersToStorage(data.users);
    }
    if (data.userDonations) {
      saveUserDonationsToStorage(data.userDonations);
    }
    return true;
  } catch (e) {
    console.error('Erreur lors de l\'import des données', e);
    return false;
  }
}

// Données de test réalistes pour la démonstration
// Charger les dons sauvegardés ou utiliser les données initiales
const initialDonations = [
  {
    id: '1',
    title: 'Don de vêtements d\'hiver pour enfants',
    category: 'CLOTHES',
    quantity: 45,
    commune: 'CASABLANCA',
    description: 'Vêtements chauds pour enfants de 5 à 12 ans. En très bon état, lavés et repassés.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 33.5731,
    longitude: -7.5898
  },
  {
    id: '2',
    title: 'Panier alimentaire complet',
    category: 'FOOD',
    quantity: 1,
    commune: 'RABAT',
    description: 'Panier contenant riz, pâtes, huile, sucre, thé et conserves. Valable pour une famille de 4 personnes.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0209,
    longitude: -6.8416
  },
  {
    id: '3',
    title: 'Médicaments et produits de première nécessité',
    category: 'MEDICINE',
    quantity: 30,
    commune: 'FES',
    description: 'Médicaments non utilisés, produits d\'hygiène et pansements. Tous dans leurs emballages d\'origine.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'PENDING',
    latitude: 34.0333,
    longitude: -5.0000
  },
  {
    id: '4',
    title: 'Livres et fournitures scolaires',
    category: 'OTHER',
    quantity: 120,
    commune: 'MARRAKECH',
    description: 'Livres scolaires, cahiers, stylos et cartables. Idéal pour la rentrée scolaire.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 31.6295,
    longitude: -7.9811
  },
  {
    id: '5',
    title: 'Couvertures et draps',
    category: 'CLOTHES',
    quantity: 25,
    commune: 'CASABLANCA',
    description: 'Couvertures chaudes et draps propres, parfaits pour l\'hiver.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: 'DONATED',
    latitude: 33.5731,
    longitude: -7.5898
  },
  {
    id: '6',
    title: 'Denrées alimentaires non périssables',
    category: 'FOOD',
    quantity: 50,
    commune: 'RABAT',
    description: 'Riz, lentilles, haricots secs et autres légumineuses. Emballages scellés.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0209,
    longitude: -6.8416
  },
  {
    id: '7',
    title: 'Jouets et jeux éducatifs',
    category: 'OTHER',
    quantity: 35,
    commune: 'FES',
    description: 'Jouets en bon état, puzzles et jeux de société pour enfants.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0333,
    longitude: -5.0000
  },
  {
    id: '8',
    title: 'Chaussures pour toute la famille',
    category: 'CLOTHES',
    quantity: 40,
    commune: 'MARRAKECH',
    description: 'Chaussures de différentes tailles, toutes en bon état et propres.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    status: 'PENDING',
    latitude: 31.6295,
    longitude: -7.9811
  },
  {
    id: '9',
    title: 'Produits d\'hygiène et de soin',
    category: 'MEDICINE',
    quantity: 60,
    commune: 'CASABLANCA',
    description: 'Savons, shampoings, dentifrices et produits d\'hygiène féminine.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 33.5731,
    longitude: -7.5898
  },
  {
    id: '10',
    title: 'Matériel de cuisine et vaisselle',
    category: 'OTHER',
    quantity: 1,
    commune: 'RABAT',
    description: 'Casseroles, poêles, assiettes et verres. Matériel complet pour équiper une cuisine.',
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0209,
    longitude: -6.8416
  },
  {
    id: '11',
    title: 'Fruits et légumes frais',
    category: 'FOOD',
    quantity: 20,
    commune: 'FES',
    description: 'Fruits et légumes de saison, récoltés du jardin. À consommer rapidement.',
    createdAt: new Date(Date.now() - 0.5 * 86400000).toISOString(),
    status: 'PENDING',
    latitude: 34.0333,
    longitude: -5.0000
  },
  {
    id: '12',
    title: 'Vêtements pour bébés',
    category: 'CLOTHES',
    quantity: 30,
    commune: 'MARRAKECH',
    description: 'Body, pyjamas et vêtements pour bébés de 0 à 24 mois. Tous lavés et désinfectés.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 31.6295,
    longitude: -7.9811
  },
  {
    id: '13',
    title: 'Appareils électroménagers',
    category: 'OTHER',
    quantity: 5,
    commune: 'CASABLANCA',
    description: 'Petits appareils électroménagers fonctionnels : bouilloire, grille-pain, mixeur.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'DONATED',
    latitude: 33.5731,
    longitude: -7.5898
  },
  {
    id: '14',
    title: 'Vitamines et compléments alimentaires',
    category: 'MEDICINE',
    quantity: 25,
    commune: 'RABAT',
    description: 'Compléments alimentaires et vitamines, non périmés, dans leurs emballages d\'origine.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0209,
    longitude: -6.8416
  },
  {
    id: '15',
    title: 'Céréales et produits de petit-déjeuner',
    category: 'FOOD',
    quantity: 40,
    commune: 'FES',
    description: 'Céréales, biscuits et produits pour le petit-déjeuner. Emballages individuels.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'APPROVED',
    latitude: 34.0333,
    longitude: -5.0000
  }
];

// Combiner les dons initiaux avec ceux sauvegardés dans localStorage
const savedDonations = loadDonationsFromStorage();
const sampleDonations = savedDonations.length > 0 
  ? savedDonations 
  : initialDonations;

// Si on utilise les données initiales, les sauvegarder
if (savedDonations.length === 0) {
  saveDonationsToStorage(initialDonations);
}

let token: string | null = 'mock-token';
let currentUser: any = null;

// Utilisateurs de test initiaux
const initialMockUsers = {
  admin: { 
    id: 'u1', 
    firstName: 'Ahmed', 
    lastName: 'Alaoui', 
    email: 'admin@sadaka.ma', 
    role: 'ADMIN' as const,
    phone: '0612345678',
    password: 'admin123' // Pour référence, pas utilisé en production
  },
  moderator: { 
    id: 'u2', 
    firstName: 'Fatima', 
    lastName: 'Benali', 
    email: 'moderator@sadaka.ma', 
    role: 'MODERATOR' as const,
    phone: '0612345679',
    password: 'mod123'
  },
  user: { 
    id: 'u3', 
    firstName: 'Mohamed', 
    lastName: 'Idrissi', 
    email: 'user@sadaka.ma', 
    role: 'USER' as const,
    phone: '0612345680',
    password: 'user123'
  }
};

// Charger les utilisateurs sauvegardés ou utiliser les initiaux
const savedUsers = loadUsersFromStorage();
const mockUsers: Record<string, any> = Object.keys(savedUsers).length > 0 
  ? { ...initialMockUsers, ...savedUsers }
  : initialMockUsers;

// Sauvegarder les utilisateurs initiaux si pas encore sauvegardés
const isFirstTime = Object.keys(savedUsers).length === 0;
if (isFirstTime) {
  saveUsersToStorage(initialMockUsers);
}

// Stockage des annonces créées par chaque utilisateur
// Charger depuis localStorage ou initialiser vide
const savedUserDonations = loadUserDonationsFromStorage();
const userDonations: Record<string, any[]> = savedUserDonations;

// Fabrique d'annonces démo (compte demo)
function createDemoDonations() {
  return [
    {
      id: 'demo1',
      title: 'Don de vêtements d\'hiver pour enfants',
      category: 'CLOTHES',
      quantity: 30,
      commune: 'CASABLANCA',
      description: 'Vêtements chauds pour enfants de 5 à 12 ans. En très bon état, lavés et repassés.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: 'APPROVED',
      latitude: 33.5731,
      longitude: -7.5898,
      userId: 'u4'
    },
    {
      id: 'demo2',
      title: 'Panier alimentaire complet',
      category: 'FOOD',
      quantity: 1,
      commune: 'RABAT',
      description: 'Panier contenant riz, pâtes, huile, sucre, thé et conserves. Valable pour une famille de 4 personnes.',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'APPROVED',
      latitude: 34.0209,
      longitude: -6.8416,
      userId: 'u4'
    },
    {
      id: 'demo3',
      title: 'Livres et fournitures scolaires',
      category: 'OTHER',
      quantity: 50,
      commune: 'MARRAKECH',
      description: 'Livres scolaires, cahiers, stylos et cartables. Idéal pour la rentrée scolaire.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: 'PENDING',
      latitude: 31.6295,
      longitude: -7.9811,
      userId: 'u4'
    }
  ];
}

// Réinitialisation forcée : seuls les comptes démo conservent des annonces
const storedVersion = localStorage.getItem('sadaka_data_version');
const shouldResetData = storedVersion !== DATA_VERSION;
if (shouldResetData) {
  localStorage.setItem('sadaka_data_version', DATA_VERSION);

  // Réinitialiser les annonces globales
  sampleDonations.length = 0;
  sampleDonations.push(...initialDonations);

  // Réinitialiser les annonces par utilisateur : uniquement pour le compte demo
  Object.keys(userDonations).forEach((k) => delete userDonations[k]);
  const demoDonations = createDemoDonations();
  userDonations['u4'] = demoDonations;

  // Ajouter les annonces démo dans la liste globale
  demoDonations.forEach((donation) => {
    if (!sampleDonations.find((d) => d.id === donation.id)) {
      sampleDonations.push(donation);
    }
  });

  // Sauvegarder
  saveDonationsToStorage(sampleDonations);
  saveUserDonationsToStorage(userDonations);
  saveUsersToStorage(mockUsers);
} else {
  // Si pas de reset mais pas d'annonces pour le compte demo, assurer la présence
  if (!userDonations['u4']) {
    const demoDonations = createDemoDonations();
    userDonations['u4'] = demoDonations;
    demoDonations.forEach((donation) => {
      if (!sampleDonations.find((d) => d.id === donation.id)) {
        sampleDonations.push(donation);
      }
    });
    saveUserDonationsToStorage(userDonations);
    saveDonationsToStorage(sampleDonations);
  }
}

export async function handleMock(config: AxiosRequestConfig) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  await delay(200);

  // Auth
  if (url.endsWith('/auth/login') && method === 'post') {
    const body = config.data || {};
    
    // Chercher l'utilisateur par email dans tous les utilisateurs (initiaux + créés)
    const foundUser = Object.values(mockUsers).find((u: any) => u.email === body.email);
    
    if (foundUser) {
      // Vérifier le mot de passe (en production, utiliser un hash!)
      // Pour les comptes de test, on accepte n'importe quel mot de passe
      // Pour les nouveaux comptes, vérifier le mot de passe stocké
      if (foundUser.password && body.password !== foundUser.password) {
        return { status: 401, data: { message: 'Email ou mot de passe incorrect' } };
      }
      
      currentUser = foundUser;
      token = 'mock-token-' + currentUser.id;

      // S'assurer que chaque utilisateur a sa propre liste d'annonces (sinon initialise vide)
      if (!userDonations[currentUser.id]) {
        userDonations[currentUser.id] = [];
        saveUserDonationsToStorage(userDonations);
      }

      return { status: 200, data: { token: token } };
    }
    
    // Si utilisateur non trouvé
    return { status: 401, data: { message: 'Email ou mot de passe incorrect' } };
  }
  if (url.endsWith('/auth/register') && method === 'post') {
    const body = config.data || {};
    
    // Vérifier si l'email existe déjà
    const existingUser = Object.values(mockUsers).find((u: any) => u.email === body.email);
    if (existingUser) {
      return { status: 400, data: { message: 'Cet email est déjà utilisé' } };
    }
    
    // Créer le nouvel utilisateur
    const newUserId = 'u' + Date.now();
    currentUser = {
      id: newUserId,
      firstName: body.firstName || 'Nouveau',
      lastName: body.lastName || 'Utilisateur',
      email: body.email,
      phone: body.phone || '',
      role: 'USER' as const,
      password: body.password // Stocké pour la connexion (en production, jamais stocker en clair!)
    };
    
    // Ajouter à la liste des utilisateurs
    mockUsers[newUserId] = currentUser;
    
    // Sauvegarder dans localStorage
    saveUsersToStorage(mockUsers);
    
    // Initialiser la liste de dons pour ce nouvel utilisateur
    if (!userDonations[newUserId]) {
      userDonations[newUserId] = [];
      saveUserDonationsToStorage(userDonations);
    }
    
    token = 'mock-token-' + currentUser.id;
    return { status: 200, data: { token: token } };
  }
  if (url.endsWith('/auth/me') && method === 'get') {
    return { status: 200, data: currentUser || mockUsers.user };
  }

  // Donations list with filters
  if (url.includes('/donations') && method === 'get') {
    let filtered = [...sampleDonations];
    const params = config.params || {};
    
    // Filter by search query
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(d => 
        d.title?.toLowerCase().includes(query) || 
        d.description?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (params.category) {
      filtered = filtered.filter(d => d.category === params.category);
    }
    
    // Filter by communes (single or multiple)
    if (params.communes) {
      const communesFilter = Array.isArray(params.communes) ? params.communes : [params.communes];
      filtered = filtered.filter(d => communesFilter.includes(d.commune));
    } else if (params.commune) {
      filtered = filtered.filter(d => d.commune === params.commune);
    }
    
    // Filter by status
    if (params.status) {
      filtered = filtered.filter(d => d.status === params.status);
    }
    
    return { status: 200, data: filtered };
  }
  if (url.endsWith('/donations') && method === 'post') {
    const body = config.data || {};
    const newId = String(Date.now());
    const newDonation = {
      id: newId,
      title: body.title || 'Nouvelle annonce',
      category: body.category || 'OTHER',
      quantity: body.quantity || 1,
      commune: body.commune || 'CASABLANCA',
      description: body.description || '',
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      latitude: body.latitude || 33.5731,
      longitude: body.longitude || -7.5898,
      userId: currentUser?.id || 'unknown'
    };
    
    // Ajouter à la liste globale
    sampleDonations.push(newDonation);
    
    // Sauvegarder dans localStorage pour persistance
    saveDonationsToStorage(sampleDonations);
    
    // Ajouter à la liste de l'utilisateur
    if (currentUser?.id) {
      if (!userDonations[currentUser.id]) {
        userDonations[currentUser.id] = [];
      }
      userDonations[currentUser.id].push(newDonation);
      // Sauvegarder les dons de l'utilisateur
      saveUserDonationsToStorage(userDonations);
    }
    
    return { status: 200, data: { id: newId } };
  }
  if (url.match(/\/donations\/[^/]+\/approve/) && method === 'post') {
    return { status: 200, data: { ok: true } };
  }
  if (url.match(/\/donations\/[^/]+\/reject/) && method === 'post') {
    return { status: 200, data: { ok: true } };
  }
  if (url.match(/\/donations\/[^/]+\/interest$/) && method === 'post') {
    // Simuler l'ajout d'une demande d'intérêt
    return { status: 200, data: { ok: true, interestId: 'i' + Date.now() } };
  }
  
  // Récupérer les demandes d'intérêt pour une annonce
  if (url.match(/\/donations\/[^/]+\/interests$/) && method === 'get') {
    const announcementId = url.match(/\/donations\/([^/]+)\/interests$/)?.[1];
    // Retourner des demandes d'intérêt mock
    return { status: 200, data: [
      {
        id: 'i1',
        userId: 'u4',
        userName: 'Aicha Benali',
        userEmail: 'aicha@example.com',
        userPhone: '0612345681',
        requestedQuantity: 10,
        requestedAt: new Date().toISOString(),
        status: 'PENDING'
      },
      {
        id: 'i2',
        userId: 'u5',
        userName: 'Hassan Alami',
        userEmail: 'hassan@example.com',
        userPhone: '0612345682',
        requestedQuantity: 5,
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'PENDING'
      }
    ] };
  }
  
  // Assigner une quantité à un demandeur
  if (url.match(/\/donations\/[^/]+\/assign$/) && method === 'post') {
    const body = config.data || {};
    // Simuler l'assignation
    return { status: 200, data: { ok: true, assignedQuantity: body.quantity } };
  }
  
  // Supprimer une demande d'intérêt
  if (url.match(/\/interests\/[^/]+$/) && method === 'delete') {
    return { status: 200, data: { ok: true } };
  }

  // My donations
  if (url.includes('/me/donations') && method === 'get') {
    // Retourner seulement les annonces créées par l'utilisateur connecté
    if (!currentUser?.id) {
      return { status: 401, data: { message: 'Non authentifié' } };
    }
    
    // Initialiser la liste si elle n'existe pas
    if (!userDonations[currentUser.id]) {
      userDonations[currentUser.id] = [];
      saveUserDonationsToStorage(userDonations);
    }
    
    // Retourner uniquement les annonces de cet utilisateur
    return { status: 200, data: userDonations[currentUser.id] || [] };
  }

  // Roles
  if (url.endsWith('/roles') && method === 'get') {
    return { status: 200, data: [
      { id: 'r1', name: 'ADMIN', description: 'Administrateur' },
      { id: 'r2', name: 'USER', description: 'Utilisateur' }
    ] };
  }
  if (url.endsWith('/roles') && method === 'post') {
    return { status: 200, data: { ok: true } };
  }
  if (url.match(/\/roles\/[^/]+$/) && (method === 'put' || method === 'delete')) {
    return { status: 200, data: { ok: true } };
  }

  // Newsletter
  if (url.endsWith('/newsletter/subscribe') && method === 'post') {
    return { status: 200, data: { ok: true } };
  }
  if (url.endsWith('/newsletter/subscribers') && method === 'get') {
    return { status: 200, data: [
      { id: '1', email: 'subscriber1@example.com', subscribedAt: new Date().toISOString() },
      { id: '2', email: 'subscriber2@example.com', subscribedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', email: 'subscriber3@example.com', subscribedAt: new Date(Date.now() - 172800000).toISOString() }
    ] };
  }
  if (url.match(/\/newsletter\/subscribers\/[^/]+$/) && method === 'delete') {
    return { status: 200, data: { ok: true } };
  }

  // Users management
  if (url.endsWith('/users') && method === 'get') {
    // Retourner tous les utilisateurs (initiaux + créés), sans le mot de passe
    const allUsers = Object.values(mockUsers).map((u: any) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      phone: u.phone || ''
    }));
    return { status: 200, data: allUsers };
  }
  if (url.match(/\/users\/[^/]+$/) && method === 'delete') {
    return { status: 200, data: { ok: true } };
  }

  // Default fallback
  return { status: 200, data: { ok: true } };
}


