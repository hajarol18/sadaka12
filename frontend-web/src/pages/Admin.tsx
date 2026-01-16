import { Button, Card, Form, Input, Modal, Space, Table, Tabs, Tag, message, Typography, InputNumber, Descriptions, Divider, Popconfirm } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState, useMemo } from 'react';
import { api } from '../utils/api';
import { exportAllDataAsJSON, importDataFromJSON } from '../utils/mock';
import { getAnnoncesEnCours, approveAnnonce, rejectAnnonce, getAllAnnonces } from '../services/annonceService';
import { getUtilisateurs } from '../services/utilisateurService';
import { getDemandesByAnnonce, assignDemande, deleteDemande } from '../services/demandeService';
import { getCategories } from '../services/categoryService';
import type { Annonce, Utilisateur, Category } from '../types/api';

type Role = { id: string; name: string; description?: string };
type NewsletterSubscriber = { id: string; email: string; subscribedAt: string };

export default function Admin() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const [pending, setPending] = useState<Annonce[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  
  const [allAnnonces, setAllAnnonces] = useState<Annonce[]>([]);
  const [allAnnoncesLoading, setAllAnnoncesLoading] = useState(false);
  
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string | number | null>(null);
  
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Gestion des demandes
  const [selectedAnnonceForDemands, setSelectedAnnonceForDemands] = useState<Annonce | null>(null);
  const [demandesForAnnonce, setDemandesForAnnonce] = useState<any[]>([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<any | null>(null);
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [demandesCountByAnnonce, setDemandesCountByAnnonce] = useState<Record<number | string, number>>({});
  const [activeTab, setActiveTab] = useState<string>('roles');
  const [categories, setCategories] = useState<Category[]>([]);
  const [quantitesDonneesByAnnonce, setQuantitesDonneesByAnnonce] = useState<Record<number | string, number>>({});

  // Calculer les quantités avec useMemo pour qu'elles se mettent à jour automatiquement
  const quantitesCalculees = useMemo(() => {
    console.log('[Admin] ========================================');
    console.log('[Admin] useMemo quantitesCalculees déclenché');
    console.log('[Admin] selectedAnnonceForDemands:', selectedAnnonceForDemands);
    console.log('[Admin] demandesForAnnonce.length:', demandesForAnnonce.length);
    
    if (!selectedAnnonceForDemands) {
      console.log('[Admin] useMemo: Pas d\'annonce sélectionnée');
      return { total: 0, attribuee: 0, disponible: 0 };
    }

    const totalQty = selectedAnnonceForDemands.quatite || 0;
    console.log('[Admin] useMemo: Quantité totale:', totalQty);
    
    // Si pas encore de demandes chargées, retourner les valeurs par défaut
    if (demandesForAnnonce.length === 0) {
      console.log('[Admin] useMemo: Pas encore de demandes chargées, retour valeurs par défaut');
      return {
        total: totalQty,
        attribuee: 0,
        disponible: totalQty
      };
    }
    
    // Debug: Log toutes les demandes avec TOUS les détails
    console.log('========================================');
    console.log('[Admin] ===== CALCUL QUANTITÉ DISPONIBLE (useMemo) =====');
    console.log('[Admin] Quantité totale:', totalQty);
    console.log('[Admin] Nombre de demandes:', demandesForAnnonce.length);
    console.log('[Admin] Toutes les demandes:', JSON.stringify(demandesForAnnonce, null, 2));
    
    // Afficher chaque demande avec TOUS ses champs
    demandesForAnnonce.forEach((d: any, index: number) => {
      console.log(`[Admin] --- Demande ${index + 1} (ID: ${d.id}) ---`);
      console.log(`[Admin]   Status brut: "${d.status}"`);
      console.log(`[Admin]   Status type: ${typeof d.status}`);
      console.log(`[Admin]   Status upper: "${String(d.status || '').toUpperCase()}"`);
      console.log(`[Admin]   quantiteAssignee: ${d.quantiteAssignee} (type: ${typeof d.quantiteAssignee})`);
      console.log(`[Admin]   quantite_assignee: ${d.quantite_assignee} (type: ${typeof d.quantite_assignee})`);
      console.log(`[Admin]   Tous les champs:`, Object.keys(d));
      console.log(`[Admin]   Objet complet:`, JSON.stringify(d, null, 2));
    });
    
    // Calculer la quantité attribuée (somme des quantités attribuées aux demandes approuvées)
    // Le backend utilise "APPROVED" (majuscules) selon le modèle Demande.java
    // Mais l'interface peut afficher "Approuvé" en français
    console.log('[Admin] ⚠️ FILTRAGE DES DEMANDES APPROUVÉES');
    console.log('[Admin] ⚠️ Nombre total de demandes:', demandesForAnnonce.length);
    
    const demandesApprouvees = demandesForAnnonce.filter((d: any) => {
      const statusRaw = d.status;
      const statusStr = String(statusRaw || '').trim();
      const statusUpper = statusStr.toUpperCase();
      
      // Vérifier TOUTES les variantes possibles (majuscules, minuscules, avec/sans accents)
      // IMPORTANT: Le backend stocke "APPROVED" mais peut retourner "Approuvé" selon la sérialisation
      const isApproved = statusUpper === 'APPROVED' || 
                        statusUpper === 'APPROUVÉ' || 
                        statusUpper === 'APPROUVE' ||
                        statusStr === 'Approuvé' ||
                        statusStr === 'approuvé' ||
                        statusStr === 'APPROVED' ||
                        statusStr === 'Approved' ||
                        statusRaw === 'Approuvé' ||
                        statusRaw === 'APPROVED' ||
                        statusRaw === 'Approved';
      
      // Log très visible pour chaque demande
      console.log(`[Admin] ⚠️ DEMANDE ${d.id}: status="${statusRaw}" (type: ${typeof statusRaw}) -> statusStr="${statusStr}" -> statusUpper="${statusUpper}" -> isApproved=${isApproved}`);
      
      return isApproved;
    });
    
    console.log('[Admin] ⚠️ NOMBRE DE DEMANDES APPROUVÉES TROUVÉES:', demandesApprouvees.length);
    console.log('[Admin] ⚠️ IDs des demandes approuvées:', demandesApprouvees.map((d: any) => d.id));
    
    const quantiteAttribuee = demandesApprouvees.reduce((sum: number, d: any) => {
      // Le backend utilise quantite_assignee (avec underscore) dans la base de données
      // mais le modèle Java le mappe en quantiteAssignee (camelCase)
      // Vérifier les deux noms possibles
      let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                d.quantite_assignee !== undefined ? d.quantite_assignee :
                null;
      
      console.log(`[Admin] Demande ${d.id}: quantiteAssignee=${d.quantiteAssignee}, quantite_assignee=${d.quantite_assignee}, qty=${qty}`);
      
      // Si pas de quantité attribuée explicite mais que la demande est approuvée,
      // cela signifie qu'elle a été approuvée avec la quantité par défaut (1)
      if (qty === null || qty === undefined || qty === 0) {
        qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
        console.log(`[Admin] Demande ${d.id}: qty par défaut = 1`);
      }
      
      const qtyNum = typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1);
      console.log(`[Admin] Demande ${d.id}: qty=${qty}, qtyNum=${qtyNum}, sum avant=${sum}, sum après=${sum + qtyNum}`);
      return sum + qtyNum;
    }, 0);
    
    const disponible = totalQty - quantiteAttribuee;
    
    console.log('[Admin] ===== RÉSULTAT FINAL (useMemo) =====');
    console.log('[Admin] Quantité totale:', totalQty);
    console.log('[Admin] Quantité attribuée:', quantiteAttribuee);
    console.log('[Admin] Quantité disponible:', disponible);
    console.log('========================================');
    
    return {
      total: totalQty,
      attribuee: quantiteAttribuee,
      disponible: disponible
    };
  }, [selectedAnnonceForDemands, demandesForAnnonce]);

  // Calculer le nom de la catégorie avec useMemo
  const nomCategorie = useMemo(() => {
    console.log('[Admin] ========================================');
    console.log('[Admin] useMemo nomCategorie déclenché');
    console.log('[Admin] selectedAnnonceForDemands:', selectedAnnonceForDemands);
    console.log('[Admin] categories.length:', categories.length);
    
    if (!selectedAnnonceForDemands) {
      console.log('[Admin] useMemo catégorie: Pas d\'annonce sélectionnée');
      return 'Non spécifiée';
    }
    
    console.log('========================================');
    console.log('[Admin] ===== DÉBOGAGE CATÉGORIE (useMemo) =====');
    console.log('[Admin] Annonce ID:', selectedAnnonceForDemands.id);
    console.log('[Admin] Catégorie dans selectedAnnonceForDemands:', selectedAnnonceForDemands.categorie);
    
    const categorie = selectedAnnonceForDemands.categorie;
    
    if (categorie) {
      console.log('[Admin] Catégorie existe, clés:', Object.keys(categorie));
      console.log('[Admin] Catégorie complète:', JSON.stringify(categorie, null, 2));
      console.log('[Admin] categorie.name:', (categorie as any)?.name);
      console.log('[Admin] categorie.nom:', (categorie as any)?.nom);
      console.log('[Admin] categorie.id:', (categorie as any)?.id);
    } else {
      console.warn('[Admin] Catégorie est null/undefined');
    }
    
    // Chercher dans allAnnonces aussi
    const annonceInList = allAnnonces.find(a => a.id === selectedAnnonceForDemands.id);
    console.log('[Admin] Annonce trouvée dans allAnnonces:', annonceInList ? 'OUI' : 'NON');
    if (annonceInList) {
      console.log('[Admin] Catégorie dans allAnnonces:', annonceInList.categorie);
      if (annonceInList.categorie) {
        console.log('[Admin] Catégorie allAnnonces complète:', JSON.stringify(annonceInList.categorie, null, 2));
      }
    }
    
    // Essayer plusieurs propriétés possibles
    let catName = (categorie as any)?.name || 
                (categorie as any)?.nom ||
                categorie?.nom ||
                (categorie as any)?.libelle ||
                (categorie as any)?.label;
    
    console.log('[Admin] Nom trouvé (première tentative):', catName);
    
    // Si toujours pas de nom, essayer de chercher dans allAnnonces
    if (!catName || catName === 'Non spécifiée') {
      if (annonceInList?.categorie) {
        catName = (annonceInList.categorie as any)?.name || 
                 annonceInList.categorie?.nom ||
                 (annonceInList.categorie as any)?.libelle ||
                 (annonceInList.categorie as any)?.label;
        console.log('[Admin] Nom trouvé dans allAnnonces:', catName);
      }
    }
    
    // Si toujours pas trouvé, chercher par ID dans la liste des catégories chargées
    if (!catName || catName === 'Non spécifiée') {
      // Essayer plusieurs façons de trouver l'ID de la catégorie
      const catId = (categorie as any)?.id || 
                    (annonceInList?.categorie as any)?.id ||
                    (selectedAnnonceForDemands as any)?.categorie_id ||
                    (selectedAnnonceForDemands as any)?.categorieId ||
                    (annonceInList as any)?.categorie_id ||
                    (annonceInList as any)?.categorieId;
      console.log('[Admin] ⚠️ Recherche catégorie par ID:', catId);
      console.log('[Admin] ⚠️ Nombre de catégories chargées:', categories.length);
      console.log('[Admin] ⚠️ Catégories disponibles:', categories.map(c => ({ id: c.id, nom: c.nom })));
      if (catId && categories.length > 0) {
        const catFromList = categories.find(c => 
          c.id === catId || 
          String(c.id) === String(catId) ||
          Number(c.id) === Number(catId)
        );
        console.log('[Admin] ⚠️ Catégorie trouvée par ID:', catFromList);
        if (catFromList) {
          catName = catFromList.nom || (catFromList as any)?.name || 'Non spécifiée';
          console.log('[Admin] ⚠️ Nom trouvé dans categories par ID:', catName);
        } else {
          console.log('[Admin] ⚠️ Aucune catégorie trouvée avec ID:', catId);
        }
      } else {
        console.log('[Admin] ⚠️ Pas d\'ID de catégorie ou pas de catégories chargées');
      }
    }
    
    console.log('[Admin] Nom final de la catégorie:', catName || 'Non spécifiée');
    console.log('========================================');
    
    return catName || 'Non spécifiée';
  }, [selectedAnnonceForDemands, allAnnonces, categories]);

  const handleExportData = () => {
    try {
      const data = exportAllDataAsJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sadaka-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('Données exportées avec succès!');
    } catch (e) {
      message.error('Erreur lors de l\'export des données');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (importDataFromJSON(data)) {
          message.success('Données importées avec succès! Veuillez recharger la page.');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          message.error('Erreur lors de l\'import des données');
        }
      } catch (e) {
        message.error('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);
  };

  const loadRoles = () => {
    setRolesLoading(true);
    api
      .get('/roles')
      .then((res) => {
        const data = res.data;
        setRoles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setRoles([]);
      })
      .finally(() => setRolesLoading(false));
  };

  const loadPending = async () => {
    setPendingLoading(true);
    try {
      console.log('[Admin] ========================================');
      console.log('[Admin] Chargement des annonces en cours...');
      const annonces = await getAnnoncesEnCours();
      console.log('[Admin] Annonces en cours reçues:', annonces);
      console.log('[Admin] Nombre d\'annonces:', annonces?.length || 0);
      
      if (annonces && annonces.length > 0) {
        annonces.forEach((a: any, index: number) => {
          console.log(`[Admin] Annonce ${index + 1}:`, {
            id: a.id,
            titre: a.titre,
            status: a.status,
            donnateur_id: a.donnateur?.id || a.donnateur_id
          });
        });
      } else {
        console.warn('[Admin] ⚠️ AUCUNE ANNONCE EN ATTENTE TROUVEE');
        console.warn('[Admin] Vérifiez que des annonces avec status="déclarée" existent dans la base');
      }
      
      // S'assurer que c'est un tableau
      const annoncesArray = Array.isArray(annonces) ? annonces : [];
      setPending(annoncesArray);
      
      if (annoncesArray.length === 0) {
        message.warning('Aucune annonce en attente de validation');
      }
    } catch (error: any) {
      console.error('[Admin] ❌ ERREUR lors du chargement des annonces en cours:', error);
      console.error('[Admin] Détails erreur:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url
      });
      message.error('Erreur lors du chargement des annonces en attente');
      setPending([]);
    } finally {
      setPendingLoading(false);
      console.log('[Admin] ========================================');
    }
  };

  const loadAllAnnonces = async () => {
    setAllAnnoncesLoading(true);
    try {
      console.log('[Admin] ========================================');
      console.log('[Admin] Chargement de toutes les annonces...');
      const res = await getAllAnnonces();
      const all = Array.isArray(res) ? res : [];
      console.log('[Admin] Toutes les annonces reçues:', all.length);
      // Debug: vérifier la structure des catégories
      if (all.length > 0 && all[0]?.categorie) {
        console.log('[Admin] Exemple de catégorie reçue:', all[0].categorie);
        console.log('[Admin] catégorie.name:', (all[0].categorie as any)?.name);
        console.log('[Admin] catégorie.nom:', all[0].categorie?.nom);
      }
      
      const annoncesApprouvees = all.filter(a => a.status === 'approuvée');
      console.log('[Admin] Annonces approuvées:', annoncesApprouvees.length);
      console.log('[Admin] IDs des annonces approuvées:', annoncesApprouvees.map(a => a.id));
      
      setAllAnnonces(all);
      
      // IMPORTANT: Charger le nombre de demandes AVANT de mettre loading à false
      console.log('[Admin] Début du chargement des nombres de demandes...');
      await loadDemandesCounts(annoncesApprouvees);
      console.log('[Admin] Chargement des nombres de demandes terminé');
      console.log('[Admin] État actuel de demandesCountByAnnonce:', demandesCountByAnnonce);
    } catch (error: any) {
      console.error('[Admin] Erreur lors du chargement de toutes les annonces:', error);
      // Fallback: essayer de charger approuvées + en cours
      try {
        const [approved, pendingAnnonces] = await Promise.all([
          getAnnoncesEnCours(),
          getAnnoncesEnCours()
        ]);
        const approvedList = Array.isArray(approved) ? approved : [];
        const pendingList = Array.isArray(pendingAnnonces) ? pendingAnnonces : [];
        const byId = new Map<number, Annonce>();
        approvedList.forEach((annonce) => byId.set(annonce.id, annonce));
        pendingList.forEach((annonce) => byId.set(annonce.id, annonce));
        const allList = Array.from(byId.values());
        const annoncesApprouvees = allList.filter(a => a.status === 'approuvée');
        setAllAnnonces(allList);
        await loadDemandesCounts(annoncesApprouvees);
      } catch {
        message.error('Erreur lors du chargement des annonces');
        setAllAnnonces([]);
      }
    } finally {
      console.log('[Admin] Fin du chargement - mise à jour de l\'état loading');
      setAllAnnoncesLoading(false);
    }
  };

  // Charger le nombre de demandes pour plusieurs annonces
  const loadDemandesCounts = async (annonces: Annonce[]) => {
    if (!annonces || annonces.length === 0) {
      console.log('[Admin] Aucune annonce à charger pour les demandes');
      return;
    }
    
    try {
      console.log('[Admin] Chargement du nombre de demandes pour', annonces.length, 'annonces...');
      
      // Charger en parallèle toutes les demandes et retourner les résultats
      const promises = annonces.map(async (annonce) => {
        try {
          console.log(`[Admin] Chargement demandes pour annonce ${annonce.id}...`);
          const demandes = await getDemandesByAnnonce(annonce.id);
          const demandesArray = Array.isArray(demandes) ? demandes : [];
          const count = demandesArray.length;
          
          // Calculer la quantité donnée (somme des quantités attribuées aux demandes approuvées)
          const demandesApprouvees = demandesArray.filter((d: any) => {
            const statusStr = String(d.status || '').trim();
            const statusUpper = statusStr.toUpperCase();
            return statusUpper === 'APPROVED' || 
                   statusUpper === 'APPROUVÉ' || 
                   statusUpper === 'APPROUVE' ||
                   statusStr === 'Approuvé' ||
                   statusStr === 'approuvé' ||
                   statusStr === 'APPROVED' ||
                   statusStr === 'Approved';
          });
          
          const quantiteDonnee = demandesApprouvees.reduce((sum: number, d: any) => {
            let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                      d.quantite_assignee !== undefined ? d.quantite_assignee :
                      null;
            if (qty === null || qty === undefined || qty === 0) {
              qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
            }
            return sum + (typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1));
          }, 0);
          
          console.log(`[Admin] Annonce ${annonce.id}: ${count} demandes trouvées, ${quantiteDonnee} quantités données`);
          return { annonceId: annonce.id, count, quantiteDonnee };
        } catch (error) {
          console.error(`[Admin] Erreur chargement demandes pour annonce ${annonce.id}:`, error);
          return { annonceId: annonce.id, count: 0, quantiteDonnee: 0 };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Construire les objets de comptage
      // IMPORTANT: Utiliser à la fois number et string comme clés pour éviter les problèmes de type
      const counts: Record<number | string, number> = {};
      const quantitesDonnees: Record<number | string, number> = {};
      results.forEach(({ annonceId, count, quantiteDonnee }) => {
        // Stocker avec le type number
        const idNum = typeof annonceId === 'string' ? parseInt(annonceId, 10) : annonceId;
        counts[idNum] = count;
        quantitesDonnees[idNum] = quantiteDonnee;
        // Stocker aussi avec le type string au cas où
        counts[annonceId.toString()] = count;
        quantitesDonnees[annonceId.toString()] = quantiteDonnee;
      });
      
      console.log('[Admin] ========================================');
      console.log('[Admin] RÉSULTATS DU CHARGEMENT DES DEMANDES:');
      console.log('[Admin] Nombre de demandes chargées pour chaque annonce:', counts);
      console.log('[Admin] Quantités données pour chaque annonce:', quantitesDonnees);
      console.log('[Admin] ========================================');
      
      // Mettre à jour l'état avec les deux formats de clés
      setDemandesCountByAnnonce(counts);
      setQuantitesDonneesByAnnonce(quantitesDonnees);
      
      // Vérifier que l'état est bien mis à jour
      setTimeout(() => {
        console.log('[Admin] État après mise à jour (dans setTimeout):', counts);
      }, 100);
    } catch (error) {
      console.error('[Admin] Erreur lors du chargement des nombres de demandes:', error);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      console.log('[Admin] Chargement des utilisateurs...');
      const utilisateurs = await getUtilisateurs();
      console.log('[Admin] Utilisateurs reçus:', utilisateurs);
      
      // S'assurer que c'est un tableau
      const utilisateursArray = Array.isArray(utilisateurs) ? utilisateurs : [];
      setUsers(utilisateursArray);
    } catch (error: any) {
      console.error('[Admin] Erreur lors du chargement des utilisateurs:', error);
      message.error('Erreur lors du chargement des utilisateurs');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadNewsletter = () => {
    setNewsletterLoading(true);
    // Mock: Simuler la récupération des abonnés newsletter
    api
      .get('/newsletter/subscribers')
      .then((res) => {
        const data = res.data;
        setNewsletterSubscribers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Si l'endpoint n'existe pas, utiliser des données mock
        setNewsletterSubscribers([
          { id: '1', email: 'subscriber1@example.com', subscribedAt: new Date().toISOString() },
          { id: '2', email: 'subscriber2@example.com', subscribedAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
      })
      .finally(() => setNewsletterLoading(false));
  };

  const loadCategories = async () => {
    try {
      console.log('[Admin] Chargement des catégories...');
      const cats = await getCategories();
      console.log('[Admin] Catégories chargées:', cats);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error: any) {
      console.error('[Admin] Erreur chargement catégories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPending();
    loadAllAnnonces();
    loadUsers();
    loadNewsletter();
    loadCategories();
  }, []);

  // Forcer le recalcul quand les demandes changent
  useEffect(() => {
    if (selectedAnnonceForDemands && demandesForAnnonce.length > 0) {
      console.log('[Admin] ⚠️ useEffect: Demandes changées, force recalcul');
      console.log('[Admin] Nombre de demandes:', demandesForAnnonce.length);
      // Forcer le recalcul en mettant à jour selectedAnnonceForDemands
      setSelectedAnnonceForDemands({ ...selectedAnnonceForDemands });
    }
  }, [demandesForAnnonce.length]);

  // Recharger les compteurs de demandes quand l'onglet "Gestion des demandes" est ouvert
  useEffect(() => {
    if (activeTab === 'demandes') {
      console.log('[Admin] ========================================');
      console.log('[Admin] Onglet "Gestion des demandes" ouvert');
      console.log('[Admin] Nombre d\'annonces totales:', allAnnonces.length);
      
      if (allAnnonces.length > 0) {
        const annoncesApprouvees = allAnnonces.filter(a => a.status === 'approuvée');
        console.log('[Admin] Annonces approuvées:', annoncesApprouvees.length);
        console.log('[Admin] IDs des annonces approuvées:', annoncesApprouvees.map(a => a.id));
        
        if (annoncesApprouvees.length > 0) {
          console.log('[Admin] Début du rechargement des compteurs...');
          loadDemandesCounts(annoncesApprouvees);
        } else {
          console.log('[Admin] Aucune annonce approuvée à charger');
        }
      } else {
        console.log('[Admin] Aucune annonce chargée - rechargement de toutes les annonces...');
        // Recharger les annonces si elles ne sont pas encore chargées
        loadAllAnnonces();
      }
      console.log('[Admin] ========================================');
    }
  }, [activeTab]);

  const openCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setRoleModalOpen(true);
  };
  const openEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue(role);
    setRoleModalOpen(true);
  };

  const saveRole = async () => {
    const values = await form.validateFields();
    try {
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, values);
        message.success('Rôle mis à jour');
      } else {
        await api.post('/roles', values);
        message.success('Rôle créé');
      }
      setRoleModalOpen(false);
      loadRoles();
    } catch (e) {
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteRole = async (role: Role) => {
    try {
      await api.delete(`/roles/${role.id}`);
      message.success('Rôle supprimé');
      loadRoles();
    } catch (e) {
      message.error('Suppression impossible');
    }
  };

  const approve = async (id: string | number) => {
    try {
      const annonceId = typeof id === 'string' ? parseInt(id) : id;
      console.log('[Admin] Approbation de l\'annonce:', annonceId);
      await approveAnnonce(annonceId);
      message.success('Annonce validée avec succès');
      loadPending();
      loadAllAnnonces();
    } catch (error: any) {
      console.error('[Admin] Erreur lors de l\'approbation:', error);
      message.error('Erreur lors de la validation de l\'annonce');
    }
  };
  const openRejectModal = (id: string | number) => {
    setSelectedDonationId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'déclarée':
        return 'En attente';
      case 'approuvée':
        return 'Approuvée';
      case 'rejetée':
        return 'Rejetée (par admin)';
      case 'annulée':
        return 'Annulée (par utilisateur)';
      case 'modifiée':
        return 'Modifiée';
      case 'attribuée':
        return 'Attribuée';
      default:
        return status || 'Inconnu';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'déclarée':
        return 'orange';
      case 'approuvée':
        return 'green';
      case 'rejetée':
        return 'red';
      case 'annulée':
        return 'default';
      case 'modifiée':
        return 'gold';
      case 'attribuée':
        return 'blue';
      default:
        return 'blue';
    }
  };

  const isPendingStatus = (status?: string) => {
    const normalized = status?.toLowerCase();
    return normalized === 'déclarée' || normalized === 'modifiée' || normalized === 'declared' || normalized === 'pending';
  };

  const reject = async () => {
    if (!selectedDonationId) return;
    try {
      const annonceId = typeof selectedDonationId === 'string' ? parseInt(selectedDonationId) : selectedDonationId;
      console.log('[Admin] Rejet de l\'annonce:', annonceId, 'Motif:', rejectReason);
      await rejectAnnonce(annonceId);
      message.success(rejectReason ? 'Annonce rejetée avec motif' : 'Annonce rejetée');
      setRejectModalOpen(false);
      setSelectedDonationId(null);
      setRejectReason('');
      loadPending();
      loadAllAnnonces();
    } catch (error: any) {
      console.error('[Admin] Erreur lors du rejet:', error);
      message.error('Erreur lors du rejet de l\'annonce');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: Le backend n'a peut-être pas d'endpoint DELETE pour utilisateur
      // Pour l'instant, on affiche juste un message
      message.warning('Fonctionnalité de suppression d\'utilisateur non implémentée dans le backend');
      // TODO: Implémenter l'endpoint DELETE /api/v1/utilisateur/{id} dans le backend
      // await api.delete(`/api/v1/utilisateur/${userId}`);
      // message.success('Utilisateur supprimé');
      // loadUsers();
    } catch (error: any) {
      console.error('[Admin] Erreur suppression utilisateur:', error);
      message.error('Erreur de suppression');
    }
  };

  const deleteSubscriber = async (subscriberId: string) => {
    try {
      await api.delete(`/newsletter/subscribers/${subscriberId}`);
      message.success('Abonné supprimé');
      loadNewsletter();
    } catch {
      message.error('Erreur de suppression');
    }
  };

  // ========== GESTION DES DEMANDES (par admin uniquement) ==========
  const loadDemandesForAnnonce = async (annonceId: number): Promise<number> => {
    setDemandesLoading(true);
    try {
      console.log(`[Admin] loadDemandesForAnnonce: Chargement demandes pour annonce ${annonceId}...`);
      const demandes = await getDemandesByAnnonce(annonceId);
      const demandesArray = Array.isArray(demandes) ? demandes : [];
      console.log(`[Admin] loadDemandesForAnnonce: ${demandesArray.length} demandes chargées pour annonce ${annonceId}`);
      
      // Log détaillé de chaque demande pour déboguer
      console.log('[Admin] ========================================');
      console.log(`[Admin] DÉTAILS DES DEMANDES POUR ANNONCE ${annonceId}:`);
      demandesArray.forEach((d: any, index: number) => {
        console.log(`[Admin] Demande ${index + 1}:`, {
          id: d.id,
          status: d.status,
          statusUpper: (d.status || '').toUpperCase(),
          quantiteAssignee: d.quantiteAssignee,
          quantite_assignee: d.quantite_assignee,
          quantiteDemandee: d.quantiteDemandee,
          quantite_demandee: d.quantite_demandee,
          demandeur: d.demandeur?.prenom + ' ' + d.demandeur?.nom,
          allKeys: Object.keys(d)
        });
      });
      console.log('[Admin] ========================================');
      
      setDemandesForAnnonce(demandesArray);
      
      // FORCER LE RECALCUL en mettant à jour selectedAnnonceForDemands
      // Cela déclenchera le useMemo
      if (selectedAnnonceForDemands && selectedAnnonceForDemands.id === annonceId) {
        console.log('[Admin] Force recalcul en mettant à jour selectedAnnonceForDemands');
        setSelectedAnnonceForDemands({ ...selectedAnnonceForDemands });
      }
      
      // Mettre à jour le compteur immédiatement
      setDemandesCountByAnnonce(prev => {
        const updated = { ...prev, [annonceId]: demandesArray.length };
        console.log(`[Admin] Compteur mis à jour pour annonce ${annonceId}: ${demandesArray.length}`);
        return updated;
      });
      return demandesArray.length;
    } catch (error: any) {
      console.error('[Admin] Erreur chargement demandes:', error);
      message.error('Erreur lors du chargement des demandes');
      setDemandesForAnnonce([]);
      setDemandesCountByAnnonce(prev => ({ ...prev, [annonceId]: 0 }));
      return 0;
    } finally {
      setDemandesLoading(false);
    }
  };

  const handleViewDemandes = async (annonce: Annonce) => {
    console.log('[Admin] ========================================');
    console.log('[Admin] handleViewDemandes appelé avec annonce:', annonce);
    console.log('[Admin] Catégorie dans annonce reçue:', annonce.categorie);
    
    // Chercher l'annonce complète dans allAnnonces pour avoir toutes les données
    // Essayer de trouver par ID (peut être number ou string)
    const annonceComplete = allAnnonces.find(a => 
      a.id === annonce.id || 
      String(a.id) === String(annonce.id)
    ) || annonce;
    
    console.log('[Admin] Annonce complète trouvée:', annonceComplete);
    console.log('[Admin] Catégorie dans annonce complète:', annonceComplete.categorie);
    
    // Si la catégorie n'est pas dans l'annonce, essayer de la charger depuis categories
    if (!annonceComplete.categorie && categories.length > 0) {
      // Chercher la catégorie par ID si l'annonce a un categorie_id
      const categorieId = (annonceComplete as any).categorie_id || (annonceComplete as any).categorieId;
      if (categorieId) {
        const cat = categories.find(c => c.id === categorieId || String(c.id) === String(categorieId));
        if (cat) {
          (annonceComplete as any).categorie = cat;
          console.log('[Admin] Catégorie chargée depuis categories:', cat);
        }
      }
    }
    
    setSelectedAnnonceForDemands(annonceComplete);
    const count = await loadDemandesForAnnonce(annonce.id);
    console.log(`[Admin] handleViewDemandes: ${count} demandes pour annonce ${annonce.id}`);
    console.log('[Admin] ========================================');
  };

  const handleAssignDemande = async () => {
    if (!selectedAnnonceForDemands || !selectedDemande) {
      message.error('Données manquantes');
      return;
    }

    const totalQty = selectedAnnonceForDemands.quatite || 0;
    // Calculer la quantité déjà attribuée (demandes avec status APPROVED)
    const currentAttributed = demandesForAnnonce
      .filter((d: any) => d.status === 'APPROVED')
      .reduce((sum: number, d: any) => sum + (d.quantiteAssignee || d.quantite_assignee || 0), 0);
    const available = totalQty - currentAttributed;

    if (assignQuantity > available) {
      message.error(`Quantité demandée (${assignQuantity}) supérieure à la quantité disponible (${available})`);
      return;
    }

    if (assignQuantity <= 0) {
      message.error('La quantité doit être supérieure à 0');
      return;
    }

    try {
      const demandeId = parseInt(selectedDemande.id) || 0;
      const donnateurId = selectedAnnonceForDemands.donnateur?.id || 0;
      
      await assignDemande(demandeId, assignQuantity, donnateurId);
      message.success(`Quantité de ${assignQuantity} attribuée avec succès`);
      
      // Recharger les demandes et annonces
      await loadDemandesForAnnonce(selectedAnnonceForDemands.id);
      // Mettre à jour le compteur
      const demandes = await getDemandesByAnnonce(selectedAnnonceForDemands.id);
      const count = Array.isArray(demandes) ? demandes.length : 0;
      setDemandesCountByAnnonce(prev => ({ ...prev, [selectedAnnonceForDemands.id]: count }));
      // Recharger toutes les annonces pour mettre à jour les autres statistiques
      await loadAllAnnonces();
      
      // Vérifier si toute la quantité est attribuée
      const newAttributed = currentAttributed + assignQuantity;
      if (newAttributed >= totalQty) {
        message.success('Toute la quantité de cette annonce a été attribuée. L\'annonce ne sera plus affichée publiquement.');
      }
      
      setAssignModalOpen(false);
      setSelectedDemande(null);
    } catch (error: any) {
      console.error('[Admin] Erreur attribution:', error);
      message.error(error?.message || 'Erreur lors de l\'attribution');
    }
  };

  const handleDeleteDemande = async (demandeId: number) => {
    try {
      await deleteDemande(demandeId);
      message.success('Demande supprimée');
      if (selectedAnnonceForDemands) {
        await loadDemandesForAnnonce(selectedAnnonceForDemands.id);
        // Mettre à jour le compteur
        const demandes = await getDemandesByAnnonce(selectedAnnonceForDemands.id);
        const count = Array.isArray(demandes) ? demandes.length : 0;
        setDemandesCountByAnnonce(prev => ({ ...prev, [selectedAnnonceForDemands.id]: count }));
      }
    } catch (error: any) {
      console.error('[Admin] Erreur suppression:', error);
      message.error(error?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Administration - Gestion de la Plateforme</Typography.Title>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          console.log('[Admin] Changement d\'onglet:', key);
          setActiveTab(key);
        }}
        items={[
          {
            key: 'roles',
            label: 'Rôles',
            children: (
              <Card
                title="Gestion des rôles"
                extra={<Button type="primary" onClick={openCreate}>Nouveau rôle</Button>}
              >
                <Table
                  rowKey="id"
                  loading={rolesLoading}
                  dataSource={Array.isArray(roles) ? roles : []}
                  columns={[
                    { title: 'Nom', dataIndex: 'name' },
                    { title: 'Description', dataIndex: 'description' },
                    {
                      title: 'Actions',
                      render: (_, r: Role) => (
                        <Space>
                          <Button size="small" onClick={() => openEdit(r)}>Modifier</Button>
                          <Button size="small" danger onClick={() => deleteRole(r)}>Supprimer</Button>
                        </Space>
                      )
                    }
                  ]}
                />
                <Modal
                  title={editingRole ? 'Modifier le rôle' : 'Créer un rôle'}
                  open={roleModalOpen}
                  onCancel={() => setRoleModalOpen(false)}
                  onOk={saveRole}
                >
                  <Form layout="vertical" form={form}>
                    <Form.Item label="Nom" name="name" rules={[{ required: true, message: 'Nom requis' }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Form>
                </Modal>
              </Card>
            )
          },
          {
            key: 'pending',
            label: 'Annonces en attente',
            children: (
              <Card title="Gestion des annonces - Validation/Rejet">
                <Table
                  rowKey="id"
                  loading={pendingLoading}
                  dataSource={Array.isArray(pending) ? pending : []}
                  columns={[
                    { 
                      title: 'Titre', 
                      dataIndex: 'titre',
                      render: (text: string, record: any) => {
                        const isEpuise = record.isEpuise;
                        return (
                          <Space>
                            <span style={{ color: isEpuise ? '#999' : 'inherit' }}>{text || 'Sans titre'}</span>
                            {isEpuise && (
                              <Tag color="default" style={{ backgroundColor: '#f5f5f5', color: '#999' }}>
                                Épuisé
                              </Tag>
                            )}
                          </Space>
                        );
                      }
                    },
                    { 
                      title: 'Description', 
                      dataIndex: 'description',
                      render: (text: string) => text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : '-'
                    },
                    { 
                      title: 'Catégorie', 
                      dataIndex: ['categorie', 'name'],
                      render: (name: string, record: Annonce) => {
                        // Jackson sérialise getName() comme 'name' (pas 'nom')
                        const catName = (record.categorie as any)?.name || record.categorie?.nom || 'Non spécifiée';
                        return catName;
                      }
                    },
                    { 
                      title: 'Quantité', 
                      dataIndex: 'quatite',
                      render: (qty: number) => qty || 1
                    },
                    { 
                      title: 'Commune', 
                      dataIndex: ['commune', 'nomCommune'],
                      render: (nom: string, record: Annonce) => {
                        return record.commune?.nomCommune || 'Non spécifiée';
                      }
                    },
                    { 
                      title: 'Date', 
                      dataIndex: 'date',
                      render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'
                    },
                    {
                      title: 'Statut',
                      dataIndex: 'status',
                      render: (status: string) => (
                        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
                      )
                    },
                    {
                      title: 'Actions',
                      render: (_, r: Annonce) => (
                        <Space>
                          <Button type="primary" size="small" onClick={() => approve(r.id)}>Valider</Button>
                          <Button danger size="small" onClick={() => openRejectModal(r.id)}>Rejeter</Button>
                        </Space>
                      )
                    }
                  ]}
                />
                <Modal
                  title="Rejeter l'annonce"
                  open={rejectModalOpen}
                  onOk={reject}
                  onCancel={() => {
                    setRejectModalOpen(false);
                    setSelectedDonationId(null);
                    setRejectReason('');
                  }}
                >
                  <Form layout="vertical">
                    <Form.Item label="Motif du rejet">
                      <Input.TextArea 
                        rows={4} 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Indiquez le motif du rejet..."
                      />
                    </Form.Item>
                  </Form>
                </Modal>
              </Card>
            )
          },
          {
            key: 'all',
            label: 'Toutes les annonces',
            children: (
              <Card title="Toutes les annonces avec statuts">
                <Table
                  rowKey="id"
                  loading={allAnnoncesLoading}
                  dataSource={useMemo(() => {
                    const all = Array.isArray(allAnnonces) ? allAnnonces : [];
                    // Calculer la quantité disponible pour chaque annonce et trier
                    const annoncesAvecQuantite = all.map(annonce => {
                      const annonceId = typeof annonce.id === 'string' ? parseInt(annonce.id, 10) : annonce.id;
                      const quantiteTotale = annonce.quatite || 0;
                      const quantiteDonnee = quantitesDonneesByAnnonce[annonceId] ?? 
                                           quantitesDonneesByAnnonce[annonceId?.toString()] ?? 
                                           0;
                      const quantiteDisponible = quantiteTotale - quantiteDonnee;
                      const isEpuise = quantiteDisponible <= 0 && quantiteTotale > 0;
                      return { ...annonce, quantiteDisponible, isEpuise };
                    });
                    // Trier: annonces non épuisées en premier, puis épuisées
                    return annoncesAvecQuantite.sort((a, b) => {
                      if (a.isEpuise && !b.isEpuise) return 1;
                      if (!a.isEpuise && b.isEpuise) return -1;
                      return 0;
                    });
                  }, [allAnnonces, quantitesDonneesByAnnonce])}
                  rowClassName={(record: any) => {
                    return record.isEpuise ? 'annonce-epuisee' : '';
                  }}
                  columns={[
                    { 
                      title: 'Titre',
                      dataIndex: 'titre',
                      render: (text: string, record: any) => {
                        const isEpuise = record.isEpuise;
                        return (
                          <Space>
                            <span style={{ color: isEpuise ? '#999' : 'inherit' }}>{text || 'Sans titre'}</span>
                            {isEpuise && (
                              <Tag color="default" style={{ backgroundColor: '#f5f5f5', color: '#999' }}>
                                Épuisé
                              </Tag>
                            )}
                          </Space>
                        );
                      }
                    },
                    { 
                      title: 'Catégorie',
                      dataIndex: 'categorie',
                      render: (_: unknown, record: Annonce) => {
                        // Dans Category.java, le champ s'appelle 'nom' mais le getter est 'getName()'
                        // Jackson sérialise avec le getter, donc le JSON contient 'name' (pas 'nom')
                        const catName = (record.categorie as any)?.name || record.categorie?.nom || 'Non précisée';
                        return catName;
                      }
                    },
                    { 
                      title: 'Quantité',
                      dataIndex: 'quatite',
                      render: (value: number) => value ?? '-'
                    },
                    { 
                      title: 'Commune',
                      dataIndex: 'commune',
                      render: (_: unknown, record: Annonce) => record.commune?.nomCommune || 'Non précisée'
                    },
                    { 
                      title: 'Date',
                      dataIndex: 'date',
                      render: (date: string) => (date ? new Date(date).toLocaleDateString('fr-FR') : '-')
                    },
                    {
                      title: 'Statut',
                      dataIndex: 'status',
                      render: (status: string) => (
                        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
                      )
                    },
                    {
                      title: 'Actions',
                      render: (_, record: any) => {
                        // Désactiver les actions pour les annonces épuisées
                        if (record.isEpuise) {
                          return (
                            <Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>
                              Aucune action disponible
                            </Typography.Text>
                          );
                        }
                        return (
                          isPendingStatus(record.status) ? (
                            <Space>
                              <Button type="primary" size="small" onClick={() => approve(record.id)}>Valider</Button>
                              <Button danger size="small" onClick={() => openRejectModal(record.id)}>Rejeter</Button>
                            </Space>
                          ) : (
                            <Typography.Text type="secondary">Aucune</Typography.Text>
                          )
                        );
                      }
                    }
                  ]}
                />
              </Card>
            )
          },
          {
            key: 'demandes',
            label: 'Gestion des demandes',
            children: (
              <Card title="Gestion des demandes - Attribution des dons">
                <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  Sélectionnez une annonce pour voir et gérer les demandes. Seul l'administrateur peut attribuer les dons.
                </Typography.Paragraph>
                <Table
                  rowKey="id"
                  loading={allAnnoncesLoading}
                  dataSource={useMemo(() => {
                    const annoncesApprouvees = Array.isArray(allAnnonces) ? allAnnonces.filter(a => a.status === 'approuvée') : [];
                    // Calculer la quantité disponible pour chaque annonce et trier
                    const annoncesAvecQuantite = annoncesApprouvees.map(annonce => {
                      const annonceId = typeof annonce.id === 'string' ? parseInt(annonce.id, 10) : annonce.id;
                      const quantiteTotale = annonce.quatite || 0;
                      const quantiteDonnee = quantitesDonneesByAnnonce[annonceId] ?? 
                                           quantitesDonneesByAnnonce[annonceId?.toString()] ?? 
                                           0;
                      const quantiteDisponible = quantiteTotale - quantiteDonnee;
                      const isEpuise = quantiteDisponible <= 0 && quantiteTotale > 0;
                      return { ...annonce, quantiteDisponible, isEpuise };
                    });
                    // Trier: annonces non épuisées en premier, puis épuisées
                    return annoncesAvecQuantite.sort((a, b) => {
                      if (a.isEpuise && !b.isEpuise) return 1;
                      if (!a.isEpuise && b.isEpuise) return -1;
                      return 0;
                    });
                  }, [allAnnonces, quantitesDonneesByAnnonce])}
                  rowClassName={(record: any) => {
                    return record.isEpuise ? 'annonce-epuisee' : '';
                  }}
                  columns={[
                    { 
                      title: 'Titre',
                      dataIndex: 'titre',
                      render: (text: string, record: any) => {
                        const isEpuise = record.isEpuise;
                        return (
                          <Space>
                            <span style={{ color: isEpuise ? '#999' : 'inherit' }}>{text || 'Sans titre'}</span>
                            {isEpuise && (
                              <Tag color="default" style={{ backgroundColor: '#f5f5f5', color: '#999' }}>
                                Épuisé
                              </Tag>
                            )}
                          </Space>
                        );
                      }
                    },
                    { 
                      title: 'Catégorie',
                      dataIndex: 'categorie',
                      render: (_: unknown, record: Annonce) => {
                        const catName = (record.categorie as any)?.name || record.categorie?.nom || 'Non précisée';
                        return catName;
                      }
                    },
                    { 
                      title: 'Quantité totale',
                      dataIndex: 'quatite',
                      render: (qty: number) => qty ?? '-'
                    },
                    { 
                      title: 'Commune',
                      dataIndex: 'commune',
                      render: (_: unknown, record: Annonce) => record.commune?.nomCommune || 'Non précisée'
                    },
                    {
                      title: 'Nombre de demandeurs',
                      dataIndex: 'id',
                      render: (id: number | string, record: Annonce) => {
                        // Essayer plusieurs formats d'ID pour être sûr
                        const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
                        const recordIdNum = typeof record.id === 'string' ? parseInt(record.id.toString(), 10) : record.id;
                        const count = demandesCountByAnnonce[idNum] ?? 
                                     demandesCountByAnnonce[recordIdNum] ?? 
                                     demandesCountByAnnonce[id?.toString()] ?? 
                                     demandesCountByAnnonce[record.id?.toString()] ?? 
                                     0;
                        return (
                          <Tag color={count > 0 ? 'blue' : 'default'}>
                            {count} {count === 1 ? 'demandeur' : 'demandeurs'}
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Actions',
                      render: (_, record: any) => {
                        // Désactiver les actions pour les annonces épuisées
                        if (record.isEpuise) {
                          return (
                            <Typography.Text type="secondary" style={{ fontStyle: 'italic' }}>
                              Aucune action disponible
                            </Typography.Text>
                          );
                        }
                        // Essayer plusieurs formats d'ID pour être sûr
                        const idNum = typeof record.id === 'string' ? parseInt(record.id.toString(), 10) : record.id;
                        const count = demandesCountByAnnonce[idNum] ?? 
                                     demandesCountByAnnonce[record.id?.toString()] ?? 
                                     0;
                        return (
                          <Button 
                            type="primary" 
                            size="small" 
                            onClick={() => handleViewDemandes(record)}
                          >
                            Voir demandes {count > 0 ? `(${count})` : ''}
                          </Button>
                        );
                      }
                    }
                  ]}
                />
                
                {/* Modal pour voir et gérer les demandes d'une annonce */}
                <Modal
                  title={`Demandes - ${selectedAnnonceForDemands?.titre || 'Annonce'}`}
                  open={!!selectedAnnonceForDemands}
                  onCancel={() => {
                    setSelectedAnnonceForDemands(null);
                    setDemandesForAnnonce([]);
                  }}
                  footer={null}
                  width={900}
                >
                  {selectedAnnonceForDemands && (
                    <div>
                      <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
                        <Descriptions.Item label="Quantité totale">
                          {quantitesCalculees.total}
                        </Descriptions.Item>
                        <Descriptions.Item label="Quantité disponible">
                          {quantitesCalculees.disponible}
                        </Descriptions.Item>
                        <Descriptions.Item label="Quantité donnée">
                          {quantitesCalculees.attribuee}
                        </Descriptions.Item>
                        <Descriptions.Item label="Catégorie">
                          <Tag color="green">
                            {nomCategorie}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>

                      <Divider>Liste des demandes</Divider>

                      <Table
                        rowKey="id"
                        loading={demandesLoading}
                        dataSource={demandesForAnnonce}
                        pagination={{ pageSize: 5 }}
                        columns={[
                          {
                            title: 'Demandeur',
                            render: (_, demande: any) => (
                              <div>
                                <div><strong>{demande.demandeur?.prenom || ''} {demande.demandeur?.nom || ''}</strong></div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                  📧 {demande.demandeur?.email || '-'}
                                </div>
                                {demande.demandeur?.telephone && (
                                  <div style={{ fontSize: 12, color: '#999' }}>
                                    📞 {demande.demandeur.telephone}
                                  </div>
                                )}
                              </div>
                            )
                          },
                          {
                            title: 'Quantité demandée',
                            render: (_, demande: any) => demande.quantiteDemandee || demande.quantite_demandee || 1
                          },
                          {
                            title: 'Quantité attribuée',
                            render: (_, demande: any) => (
                              <Tag color={demande.quantiteAssignee || demande.quantite_assignee ? 'green' : 'default'}>
                                {demande.quantiteAssignee || demande.quantite_assignee || 0}
                              </Tag>
                            )
                          },
                          {
                            title: 'Date de demande',
                            dataIndex: 'date',
                            render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'
                          },
                          {
                            title: 'Statut',
                            dataIndex: 'status',
                            render: (status: string, demande: any) => {
                              // Normaliser le statut pour la comparaison
                              const statusUpper = (status || '').toUpperCase();
                              const isApproved = statusUpper === 'APPROVED' || statusUpper === 'APPROUVÉ' || statusUpper === 'APPROUVE';
                              const isRejected = statusUpper === 'REJECTED' || statusUpper === 'REJETÉ' || statusUpper === 'REJETE';
                              
                              console.log(`[Admin] Rendu statut pour demande ${demande.id}: status="${status}", statusUpper="${statusUpper}", isApproved=${isApproved}`);
                              
                              return (
                                <Tag color={isApproved ? 'green' : isRejected ? 'red' : 'orange'}>
                                  {isApproved ? '✓ Attribuée' : 
                                   isRejected ? '✗ Rejetée' : 
                                   '⏳ En attente'}
                                </Tag>
                              );
                            }
                          },
                          {
                            title: 'Actions',
                            render: (_, demande: any) => {
                              const totalQty = selectedAnnonceForDemands.quatite || 0;
                              const demandesApprouvees = demandesForAnnonce.filter((d: any) => {
                                const status = (d.status || '').toUpperCase();
                                return status === 'APPROVED' || status === 'APPROUVÉ' || status === 'APPROUVE';
                              });
                              const currentAttributed = demandesApprouvees.reduce((sum: number, d: any) => {
                                // Le backend utilise quantite_assignee (avec underscore) dans la base de données
                                // mais le modèle Java le mappe en quantiteAssignee (camelCase)
                                let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                                          d.quantite_assignee !== undefined ? d.quantite_assignee :
                                          null;
                                
                                // Si pas de quantité attribuée explicite mais que la demande est approuvée,
                                // cela signifie qu'elle a été approuvée avec la quantité par défaut (1)
                                if (qty === null || qty === undefined || qty === 0) {
                                  qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
                                }
                                
                                return sum + (typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1));
                              }, 0);
                              const available = totalQty - currentAttributed;
                              
                              return (
                                <Space>
                                  {demande.status !== 'APPROVED' && available > 0 && (
                                    <Button
                                      size="small"
                                      type="primary"
                                      onClick={() => {
                                        setSelectedDemande(demande);
                                        setAssignQuantity(demande.quantiteDemandee || demande.quantite_demandee || 1);
                                        setAssignModalOpen(true);
                                      }}
                                    >
                                      Attribuer
                                    </Button>
                                  )}
                                  <Popconfirm
                                    title="Supprimer cette demande ?"
                                    onConfirm={() => handleDeleteDemande(parseInt(demande.id) || 0)}
                                  >
                                    <Button size="small" danger>
                                      Supprimer
                                    </Button>
                                  </Popconfirm>
                                </Space>
                              );
                            }
                          }
                        ]}
                      />
                    </div>
                  )}
                </Modal>

                {/* Modal pour attribuer une quantité */}
                <Modal
                  title="Attribuer une quantité"
                  open={assignModalOpen}
                  onOk={handleAssignDemande}
                  onCancel={() => {
                    setAssignModalOpen(false);
                    setSelectedDemande(null);
                  }}
                >
                  {selectedDemande && selectedAnnonceForDemands && (
                    <div>
                      <p><strong>Demandeur:</strong> {selectedDemande.demandeur?.prenom || ''} {selectedDemande.demandeur?.nom || ''}</p>
                      <p><strong>Email:</strong> {selectedDemande.demandeur?.email || '-'}</p>
                      <Divider />
                      <p><strong>Quantité totale de l'annonce:</strong> {selectedAnnonceForDemands.quatite || 0}</p>
                      <p><strong>Quantité disponible:</strong> {
                        (() => {
                          const total = selectedAnnonceForDemands.quatite || 0;
                          const demandesApprouvees = demandesForAnnonce.filter((d: any) => {
                            const status = (d.status || '').toUpperCase();
                            return status === 'APPROVED' || status === 'APPROUVÉ' || status === 'APPROUVE';
                          });
                          const attributed = demandesApprouvees.reduce((sum: number, d: any) => {
                            // Le backend utilise quantite_assignee (avec underscore) dans la base de données
                            // mais le modèle Java le mappe en quantiteAssignee (camelCase)
                            let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                                      d.quantite_assignee !== undefined ? d.quantite_assignee :
                                      null;
                            
                            // Si pas de quantité attribuée explicite mais que la demande est approuvée,
                            // cela signifie qu'elle a été approuvée avec la quantité par défaut (1)
                            if (qty === null || qty === undefined || qty === 0) {
                              qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
                            }
                            
                            return sum + (typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1));
                          }, 0);
                          return total - attributed;
                        })()
                      }</p>
                      <p><strong>Quantité à attribuer:</strong></p>
                      <InputNumber
                        min={1}
                        max={
                          (() => {
                            const total = selectedAnnonceForDemands.quatite || 0;
                            const demandesApprouvees = demandesForAnnonce.filter((d: any) => {
                              const status = (d.status || '').toUpperCase();
                              return status === 'APPROVED' || status === 'APPROUVÉ' || status === 'APPROUVE';
                            });
                            const attributed = demandesApprouvees.reduce((sum: number, d: any) => {
                              // Le backend utilise quantite_assignee (avec underscore) dans la base de données
                              // mais le modèle Java le mappe en quantiteAssignee (camelCase)
                              let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                                        d.quantite_assignee !== undefined ? d.quantite_assignee :
                                        null;
                              
                              // Si pas de quantité attribuée explicite mais que la demande est approuvée,
                              // cela signifie qu'elle a été approuvée avec la quantité par défaut (1)
                              if (qty === null || qty === undefined || qty === 0) {
                                qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
                              }
                              
                              return sum + (typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1));
                            }, 0);
                            return total - attributed;
                          })()
                        }
                        value={assignQuantity}
                        onChange={(val) => setAssignQuantity(val || 1)}
                        style={{ width: '100%' }}
                      />
                      <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                        Après attribution, si toute la quantité est attribuée, l'annonce ne sera plus affichée publiquement.
                      </p>
                    </div>
                  )}
                </Modal>
              </Card>
            )
          },
          {
            key: 'users',
            label: 'Gestion des utilisateurs',
            children: (
              <Card title="Liste des utilisateurs">
                <Table
                  rowKey="id"
                  loading={usersLoading}
                  dataSource={Array.isArray(users) ? users : []}
                  columns={[
                    { title: 'Nom', dataIndex: 'nom' },
                    { title: 'Prénom', dataIndex: 'prenom' },
                    { title: 'Email', dataIndex: 'email' },
                    { 
                      title: 'Téléphone', 
                      dataIndex: 'telephone',
                      render: (tel: number) => tel ? tel.toString() : '-'
                    },
                    { 
                      title: 'Username', 
                      dataIndex: 'userName',
                      render: (userName: string) => userName || '-'
                    },
                    {
                      title: 'Actions',
                      render: (_, user: Utilisateur) => (
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => deleteUser(user.id.toString())}
                          disabled={user.email === 'admin@sadaka.ma' || user.email === 'admin@sadaqah.com'}
                        >
                          Supprimer
                        </Button>
                      )
                    }
                  ]}
                />
              </Card>
            )
          },
          {
            key: 'data',
            label: 'Données JSON',
            children: (
              <Card 
                title="Export/Import des données" 
                extra={
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />} 
                      onClick={handleExportData}
                    >
                      Exporter toutes les données
                    </Button>
                    <label>
                      <Button icon={<UploadOutlined />} style={{ cursor: 'pointer' }}>
                        Importer des données
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportData}
                      />
                    </label>
                  </Space>
                }
              >
                <Typography.Paragraph>
                  <strong>Export :</strong> Téléchargez toutes les données (utilisateurs, dons, etc.) au format JSON.
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <strong>Import :</strong> Importez des données depuis un fichier JSON (remplace les données actuelles).
                </Typography.Paragraph>
                <Typography.Text type="secondary">
                  Les données sont stockées dans le localStorage du navigateur. 
                  L'export permet de sauvegarder les données pour les réimporter plus tard ou les partager.
                </Typography.Text>
              </Card>
            )
          },
          {
            key: 'newsletter',
            label: 'Gestion Newsletter',
            children: (
              <Card title="Abonnés à la newsletter">
                <Table
                  rowKey="id"
                  loading={newsletterLoading}
                  dataSource={Array.isArray(newsletterSubscribers) ? newsletterSubscribers : []}
                  columns={[
                    { title: 'Email', dataIndex: 'email' },
                    { 
                      title: 'Date d\'inscription', 
                      dataIndex: 'subscribedAt',
                      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
                    },
                    {
                      title: 'Actions',
                      render: (_, subscriber: NewsletterSubscriber) => (
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => deleteSubscriber(subscriber.id)}
                        >
                          Supprimer
                        </Button>
                      )
                    }
                  ]}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
