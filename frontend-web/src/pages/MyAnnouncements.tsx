import { Card, Table, Tag, Button, Empty, Typography, Space, Modal, Descriptions, message, Divider, Popconfirm, Select, Badge } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnnoncesByUser } from '../services/annonceService';
import { getDemandesByAnnonce } from '../services/demandeService';
import { getCategories } from '../services/categoryService';
import { Link } from 'react-router-dom';
import { PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Annonce, Category } from '../types/api';

const { Title, Text } = Typography;

// Utiliser le type Annonce du backend
type MyAnn = Annonce & {
  donatedQuantity?: number;
  expirationDate?: string;
  dateExpiration?: string;
  validUntil?: string;
  expiresAt?: string;
};

type InterestRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  requestedQuantity?: number;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export default function MyAnnouncements() {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<MyAnn[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<MyAnn | null>(null);
  const [interests, setInterests] = useState<InterestRequest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [expirationFilter, setExpirationFilter] = useState<'expiring' | undefined>(undefined);
  const [demandesCountByAnnonce, setDemandesCountByAnnonce] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [demandesForSelected, setDemandesForSelected] = useState<any[]>([]);
  const [quantitesDonneesByAnnonce, setQuantitesDonneesByAnnonce] = useState<Record<number, number>>({});

  const EXPIRING_SOON_DAYS = 7;
  const PENDING_ALERT_DAYS = 7;

  // Fonction pour charger les données
  const loadData = async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    
    setLoading(true);
    try {
      const userId = parseInt(user.id) || 0;
      if (userId === 0) {
        message.error('Erreur: utilisateur non identifié');
        return;
      }
      
      console.log('[MyAnnouncements] Chargement des annonces pour userId:', userId);
      const annonces = await getAnnoncesByUser(userId);
      console.log('[MyAnnouncements] Annonces reçues:', annonces);
      
      // S'assurer que c'est un tableau
      const annoncesArray = Array.isArray(annonces) ? annonces : [];
      console.log('[MyAnnouncements] Annonces après vérification:', annoncesArray.length, annoncesArray);
      setData(annoncesArray);
      
      // Charger le nombre de demandes pour chaque annonce
      await loadDemandesCountsForAll(annoncesArray);
      
      if (annoncesArray.length === 0) {
        console.log('[MyAnnouncements] Aucune annonce trouvée pour userId:', userId);
      }
    } catch (error: any) {
      console.error('[MyAnnouncements] Erreur:', error);
      message.error('Erreur lors du chargement de vos annonces');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre de demandes et les quantités données pour toutes les annonces
  const loadDemandesCountsForAll = async (annonces: MyAnn[]) => {
    if (!annonces || annonces.length === 0) {
      return;
    }
    
    try {
      console.log('[MyAnnouncements] Chargement du nombre de demandes et quantités données pour', annonces.length, 'annonces...');
      const counts: Record<number, number> = {};
      const quantitesDonnees: Record<number, number> = {};
      
      // Charger en parallèle toutes les demandes
      const promises = annonces.map(async (annonce) => {
        try {
          const annonceId = typeof annonce.id === 'number' ? annonce.id : parseInt(annonce.id) || 0;
          if (annonceId === 0) return;
          
          const demandes = await getDemandesByAnnonce(annonceId);
          const demandesArray = Array.isArray(demandes) ? demandes : [];
          counts[annonceId] = demandesArray.length;
          
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
          
          quantitesDonnees[annonceId] = quantiteDonnee;
          console.log(`[MyAnnouncements] Annonce ${annonceId}: ${demandesArray.length} demandes, ${quantiteDonnee} quantités données`);
        } catch (error) {
          console.error(`[MyAnnouncements] Erreur chargement demandes pour annonce ${annonce.id}:`, error);
          const annonceId = typeof annonce.id === 'number' ? annonce.id : parseInt(annonce.id) || 0;
          if (annonceId > 0) {
            counts[annonceId] = 0;
            quantitesDonnees[annonceId] = 0;
          }
        }
      });
      
      await Promise.all(promises);
      console.log('[MyAnnouncements] Nombre de demandes chargées:', counts);
      console.log('[MyAnnouncements] Quantités données chargées:', quantitesDonnees);
      setDemandesCountByAnnonce(counts);
      setQuantitesDonneesByAnnonce(quantitesDonnees);
    } catch (error) {
      console.error('[MyAnnouncements] Erreur lors du chargement des nombres de demandes:', error);
    }
  };

  // Charger les annonces de l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadData();
    }
  }, [isAuthenticated, user?.id]);

  const loadCategories = async () => {
    try {
      console.log('[MyAnnouncements] Chargement des catégories...');
      const cats = await getCategories();
      console.log('[MyAnnouncements] Catégories chargées:', cats);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error: any) {
      console.error('[MyAnnouncements] Erreur chargement catégories:', error);
      setCategories([]);
    }
  };

  // Recharger quand on arrive sur la page (pour capturer les nouvelles annonces)
  // Cela capture aussi les redirections depuis CreateAnnouncement
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCategories();
    }
    
    const handleFocus = () => {
      // Recharger quand la fenêtre reprend le focus
      if (isAuthenticated && user?.id) {
        console.log('[MyAnnouncements] Rechargement au focus de la fenêtre');
        loadData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Recharger après un délai initial
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.id) {
        console.log('[MyAnnouncements] Rechargement automatique après 1 seconde');
        loadData();
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user?.id]);

  // Fonctions utilitaires pour les dates
  const parseDate = (value?: string) => {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getExpirationDate = (announcement: MyAnn) => {
    return parseDate(
      announcement.expirationDate
      ?? announcement.dateExpiration
      ?? announcement.validUntil
      ?? announcement.expiresAt
    );
  };

  const isExpiringSoon = (announcement: MyAnn) => {
    const expirationDate = getExpirationDate(announcement);
    if (!expirationDate) {
      return false;
    }
    const now = new Date();
    const diffDays = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= EXPIRING_SOON_DAYS;
  };

  const getPendingAgeDays = (announcement: MyAnn) => {
    const status = announcement.status || 'déclarée';
    if (status !== 'déclarée' && status !== 'modifiée') {
      return null;
    }
    const createdAt = parseDate(announcement.date);
    if (!createdAt) {
      return null;
    }
    return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  };

  const hasExpiration = useMemo(() => {
    return data.some((announcement) => getExpirationDate(announcement));
  }, [data]);

  // Filtrer les annonces par statut + expiration
  const filteredData = useMemo(() => {
    let filtered = data;
    if (statusFilter) {
      filtered = filtered.filter(ann => ann.status === statusFilter);
    }
    if (expirationFilter === 'expiring' && hasExpiration) {
      filtered = filtered.filter(isExpiringSoon);
    }
    return filtered;
  }, [data, statusFilter, expirationFilter, hasExpiration]);

  // Statistiques des statuts
  const statusStats = useMemo(() => {
    const stats = {
      total: data.length,
      'déclarée': data.filter(a => a.status === 'déclarée' || a.status === 'modifiée').length,
      'approuvée': data.filter(a => a.status === 'approuvée').length,
      'rejetée': data.filter(a => a.status === 'rejetée').length,
      'annulée': data.filter(a => a.status === 'annulée').length
    };
    return stats;
  }, [data]);

  // Calculer la quantité donnée avec useMemo pour qu'elle se mette à jour automatiquement
  const quantiteDonneeCalculee = useMemo(() => {
    if (!selectedAnnouncement || demandesForSelected.length === 0) {
      return 0;
    }

    console.log('[MyAnnouncements] ⚠️ Calcul quantité donnée pour annonce', selectedAnnouncement.id);
    console.log('[MyAnnouncements] ⚠️ Nombre de demandes:', demandesForSelected.length);
    
    // Calculer la quantité attribuée (somme des quantités attribuées aux demandes approuvées)
    const demandesApprouvees = demandesForSelected.filter((d: any) => {
      const statusStr = String(d.status || '').trim();
      const statusUpper = statusStr.toUpperCase();
      const isApproved = statusUpper === 'APPROVED' || 
                        statusUpper === 'APPROUVÉ' || 
                        statusUpper === 'APPROUVE' ||
                        statusStr === 'Approuvé' ||
                        statusStr === 'approuvé' ||
                        statusStr === 'APPROVED' ||
                        statusStr === 'Approved';
      console.log(`[MyAnnouncements] ⚠️ Demande ${d.id}: status="${d.status}" -> isApproved=${isApproved}`);
      return isApproved;
    });
    
    console.log('[MyAnnouncements] ⚠️ Nombre de demandes approuvées:', demandesApprouvees.length);
    
    const quantiteDonnee = demandesApprouvees.reduce((sum: number, d: any) => {
      let qty = d.quantiteAssignee !== undefined ? d.quantiteAssignee : 
                d.quantite_assignee !== undefined ? d.quantite_assignee :
                null;
      
      console.log(`[MyAnnouncements] ⚠️ Demande ${d.id}: quantiteAssignee=${d.quantiteAssignee}, quantite_assignee=${d.quantite_assignee}, qty=${qty}`);
      
      if (qty === null || qty === undefined || qty === 0) {
        qty = 1; // Par défaut, chaque demande approuvée = 1 quantité
      }
      
      const qtyNum = typeof qty === 'number' ? qty : (parseInt(String(qty)) || 1);
      console.log(`[MyAnnouncements] ⚠️ Demande ${d.id}: qtyNum=${qtyNum}, sum avant=${sum}, sum après=${sum + qtyNum}`);
      return sum + qtyNum;
    }, 0);
    
    console.log('[MyAnnouncements] ⚠️ Quantité donnée calculée:', quantiteDonnee);
    
    return quantiteDonnee;
  }, [selectedAnnouncement, demandesForSelected]);

  const loadInterests = async (announcementId: number) => {
    setInterestsLoading(true);
    try {
      const demandes = await getDemandesByAnnonce(announcementId);
      
      // S'assurer que c'est un tableau
      const demandesArray = Array.isArray(demandes) ? demandes : [];
      
      // Mapper les demandes vers InterestRequest
      const mappedInterests: InterestRequest[] = demandesArray.map((d: any) => ({
        id: d.id?.toString() || '',
        userId: d.demandeur?.id?.toString() || d.demandeur_id?.toString() || '',
        userName: d.demandeur?.prenom && d.demandeur?.nom 
          ? `${d.demandeur.prenom} ${d.demandeur.nom}`
          : d.demandeur?.email || 'Utilisateur',
        userEmail: d.demandeur?.email || '',
        userPhone: d.demandeur?.telephone?.toString() || '',
        requestedQuantity: d.requestedQuantity || 1,
        requestedAt: d.date || new Date().toISOString(),
        status: (d.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED'
      }));
      
      setInterests(mappedInterests);
      
      // Mettre à jour les demandes pour le calcul de quantité donnée
      // Toujours mettre à jour car on vient de charger les demandes pour cette annonce
      console.log('[MyAnnouncements] ⚠️ Mise à jour demandesForSelected pour annonce', announcementId);
      setDemandesForSelected(demandesArray);
      
      // Mettre à jour le compteur pour cette annonce
      setDemandesCountByAnnonce(prev => ({
        ...prev,
        [announcementId]: demandesArray.length
      }));
    } catch (e: any) {
      console.error('[MyAnnouncements] Erreur chargement demandes:', e);
      message.error('Erreur lors du chargement des demandes');
      setInterests([]);
    } finally {
      setInterestsLoading(false);
    }
  };

  const handleViewInterests = (announcement: MyAnn) => {
    console.log('[MyAnnouncements] ⚠️ handleViewInterests appelé pour annonce', announcement.id);
    setSelectedAnnouncement(announcement);
    setDemandesForSelected([]); // Réinitialiser avant de charger
    const announcementId = typeof announcement.id === 'number' ? announcement.id : parseInt(announcement.id) || 0;
    if (announcementId > 0) {
      loadInterests(announcementId);
    }
  };

  // NOTE: L'attribution des dons est maintenant gérée uniquement par l'administrateur
  // Le donateur peut seulement voir les demandes, pas les attribuer

  // NOTE: La suppression des demandes est également gérée par l'administrateur
  // Le donateur ne peut pas supprimer les demandes

  const handleDeleteAnnouncement = async (announcement: MyAnn) => {
    try {
      const { deleteAnnonce } = await import('../services/annonceService');
      const announcementId = typeof announcement.id === 'number' ? announcement.id : parseInt(announcement.id) || 0;
      
      if (announcementId === 0) {
        message.error('ID d\'annonce invalide');
        return;
      }
      
      await deleteAnnonce(announcementId);
      message.success('Annonce supprimée');
      
      // Recharger les données
      if (user?.id) {
        const userId = parseInt(user.id) || 0;
        if (userId > 0) {
          const annonces = await getAnnoncesByUser(userId);
          const annoncesArray = Array.isArray(annonces) ? annonces : [];
          setData(annoncesArray);
        }
      }
    } catch (e: any) {
      console.error('[MyAnnouncements] Erreur suppression annonce:', e);
      message.error(e?.message || 'Suppression impossible');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'déclarée': 'En attente de validation',
      'approuvée': '✅ Approuvée',
      'rejetée': '❌ Refusée (par admin)',
      'annulée': '🗑️ Annulée (par vous)',
      'modifiée': 'Modifiée (en attente)',
      'PENDING': 'En attente',
      'APPROVED': '✅ Approuvée',
      'REJECTED': '❌ Refusée',
      'DONATED': 'Donnée'
    };
    return labels[status] || status || 'Non défini';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'déclarée': 'orange',        // En attente - orange
      'approuvée': 'green',         // Approuvée - vert
      'rejetée': 'red',            // Refusée - rouge
      'annulée': 'default',        // Annulée - gris
      'modifiée': 'orange',        // Modifiée - orange (en attente)
      'PENDING': 'orange',
      'APPROVED': 'green',
      'REJECTED': 'red',
      'DONATED': 'blue'
    };
    return colors[status] || 'default';
  };

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>Mes annonces</Title>
            <Link to="/create-announcement">
              <Button type="primary" icon={<PlusOutlined />}>
                Créer une annonce
              </Button>
            </Link>
          </Space>
        }
        extra={
          <Space>
            <Text type="secondary">Filtrer par statut:</Text>
            <Select
              style={{ width: 200 }}
              placeholder="Tous les statuts"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Toutes', value: undefined },
                { label: `En attente (${statusStats['déclarée']})`, value: 'déclarée' },
                { label: `Approuvées (${statusStats['approuvée']})`, value: 'approuvée' },
                { label: `Refusées par admin (${statusStats['rejetée']})`, value: 'rejetée' },
                { label: `Annulées par vous (${statusStats['annulée']})`, value: 'annulée' }
              ]}
            />
            {hasExpiration && (
              <>
                <Text type="secondary">Expiration:</Text>
                <Select
                  style={{ width: 220 }}
                  placeholder="Toutes"
                  allowClear
                  value={expirationFilter}
                  onChange={setExpirationFilter}
                  options={[
                    { label: 'Toutes', value: undefined },
                    { label: 'Proche d\'expiration', value: 'expiring' }
                  ]}
                />
              </>
            )}
          </Space>
        }
      >
        {/* Statistiques rapides */}
        {data.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Space size="large">
              <Badge count={statusStats.total} showZero color="#1890ff">
                <Text strong>Total: {statusStats.total} annonce{statusStats.total > 1 ? 's' : ''}</Text>
              </Badge>
              <Badge count={statusStats['déclarée']} showZero color="orange">
                <Text><ClockCircleOutlined /> En attente: {statusStats['déclarée']}</Text>
              </Badge>
              <Badge count={statusStats['approuvée']} showZero color="green">
                <Text><CheckCircleOutlined /> Approuvées: {statusStats['approuvée']}</Text>
              </Badge>
              <Badge count={statusStats['rejetée']} showZero color="red">
                <Text><CloseCircleOutlined /> Refusées (par admin): {statusStats['rejetée']}</Text>
              </Badge>
              <Badge count={statusStats['annulée']} showZero color="default">
                <Text>Annulées (par vous): {statusStats['annulée']}</Text>
              </Badge>
            </Space>
          </div>
        )}
        {filteredData.length === 0 && !loading ? (
          <Empty
            description={
              <div>
                {data.length === 0 ? (
                  <>
                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                      Vous n'avez pas encore créé d'annonces
                    </Text>
                    <Link to="/create-announcement">
                      <Button type="primary" icon={<PlusOutlined />} size="large">
                        Créer ma première annonce
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Aucune annonce ne correspond au filtre sélectionné
                  </Text>
                )}
              </div>
            }
          />
        ) : (
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
            columns={[
              { 
                title: 'Titre', 
                dataIndex: 'titre',
                render: (text, record: MyAnn) => {
                  const annonceId = typeof record.id === 'number' ? record.id : parseInt(record.id) || 0;
                  const quantiteTotale = record.quatite || 0;
                  const quantiteDonnee = quantitesDonneesByAnnonce[annonceId] || 0;
                  const quantiteDisponible = quantiteTotale - quantiteDonnee;
                  const isEpuise = quantiteDisponible <= 0 && quantiteTotale > 0;
                  
                  return (
                    <Space>
                      <span>{text || 'Sans titre'}</span>
                      {isEpuise && (
                        <Badge count="Épuisé" style={{ backgroundColor: '#ff4d4f' }} />
                      )}
                    </Space>
                  );
                }
              },
              { 
                title: 'Catégorie', 
                render: (_, record: MyAnn) => {
                  // Essayer plusieurs façons de trouver le nom de la catégorie
                  let catName = (record.categorie as any)?.nom || 
                               (record.categorie as any)?.name ||
                               record.categorie?.nom ||
                               (record.categorie as any)?.libelle ||
                               (record.categorie as any)?.label;
                  
                  // Si toujours pas trouvé, chercher par ID dans la liste des catégories chargées
                  if (!catName && categories.length > 0) {
                    const catId = (record.categorie as any)?.id || 
                                 (record as any)?.categorie_id ||
                                 (record as any)?.categorieId;
                    if (catId) {
                      const catFromList = categories.find(c => 
                        c.id === catId || 
                        String(c.id) === String(catId) ||
                        Number(c.id) === Number(catId)
                      );
                      if (catFromList) {
                        catName = catFromList.nom || (catFromList as any)?.name || 'Non spécifiée';
                      }
                    }
                  }
                  
                  return catName ? <Tag color="green">{catName}</Tag> : <Tag color="default">Non spécifiée</Tag>;
                }
              },
              { 
                title: 'Quantité', 
                dataIndex: 'quatite',
                render: (qty) => qty || 0
              },
              { 
                title: 'Commune', 
                dataIndex: ['commune', 'nomCommune'],
                render: (nom: string) => nom || '-'
              },
              { 
                title: 'Date', 
                dataIndex: 'date',
                render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'
              },
              { 
                title: 'Statut', 
                dataIndex: 'status',
                width: 200,
                render: (v: string, record: MyAnn) => {
                  const status = v || 'déclarée';
                  const icon = status === 'approuvée' ? <CheckCircleOutlined /> 
                    : status === 'rejetée' ? <CloseCircleOutlined />
                    : <ClockCircleOutlined />;
                  const pendingDays = getPendingAgeDays({ ...record, status });
                  
                  return (
                    <Space direction="vertical" size={4}>
                      <Tag 
                        color={getStatusColor(status)} 
                        icon={icon}
                        style={{ fontSize: 13, padding: '4px 8px' }}
                      >
                        {getStatusLabel(status)}
                      </Tag>
                      {pendingDays !== null && pendingDays >= PENDING_ALERT_DAYS && (
                        <Badge status="error" text={`En attente depuis ${pendingDays} j`} />
                      )}
                    </Space>
                  );
                },
                filters: [
                  { text: 'En attente', value: 'déclarée' },
                  { text: 'Approuvée', value: 'approuvée' },
                  { text: 'Refusée (par admin)', value: 'rejetée' },
                  { text: 'Annulée (par vous)', value: 'annulée' }
                ],
                onFilter: (value, record) => record.status === value
              },
              {
                title: 'Actions',
                render: (_, record: MyAnn) => (
                  <Space>
                    <Button 
                      size="small" 
                      type="default"
                      onClick={() => handleViewInterests(record)}
                    >
                      Voir demandeurs ({(() => {
                        const annonceId = typeof record.id === 'number' ? record.id : parseInt(record.id) || 0;
                        const count = demandesCountByAnnonce[annonceId] ?? 0;
                        return count;
                      })()})
                    </Button>
                    <Popconfirm
                      title="Supprimer cette annonce ?"
                      okText="Oui"
                      cancelText="Non"
                      onConfirm={() => handleDeleteAnnouncement(record)}
                    >
                      <Button size="small" danger>
                        Supprimer
                      </Button>
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
          />
        )}
      </Card>

      {/* Modal pour voir les demandeurs */}
      <Modal
        title={`Demandeurs - ${selectedAnnouncement?.title || 'Annonce'}`}
        open={!!selectedAnnouncement}
        onCancel={() => {
          setSelectedAnnouncement(null);
          setInterests([]);
        }}
        footer={null}
        width={800}
      >
        {selectedAnnouncement && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Quantité totale">{selectedAnnouncement.quatite || 0}</Descriptions.Item>
              <Descriptions.Item label="Quantité disponible">
                {(selectedAnnouncement.quatite || 0) - quantiteDonneeCalculee}
              </Descriptions.Item>
              <Descriptions.Item label="Quantité donnée">{quantiteDonneeCalculee}</Descriptions.Item>
              <Descriptions.Item label="Catégorie">
                <Tag color="green">
                  {(() => {
                    // Essayer plusieurs façons de trouver le nom de la catégorie
                    let catName = (selectedAnnouncement.categorie as any)?.nom || 
                                 (selectedAnnouncement.categorie as any)?.name ||
                                 selectedAnnouncement.categorie?.nom ||
                                 (selectedAnnouncement.categorie as any)?.libelle ||
                                 (selectedAnnouncement.categorie as any)?.label;
                    
                    // Si toujours pas trouvé, chercher par ID dans la liste des catégories chargées
                    if (!catName && categories.length > 0) {
                      const catId = (selectedAnnouncement.categorie as any)?.id || 
                                   (selectedAnnouncement as any)?.categorie_id ||
                                   (selectedAnnouncement as any)?.categorieId;
                      if (catId) {
                        const catFromList = categories.find(c => 
                          c.id === catId || 
                          String(c.id) === String(catId) ||
                          Number(c.id) === Number(catId)
                        );
                        if (catFromList) {
                          catName = catFromList.nom || (catFromList as any)?.name || 'Non spécifiée';
                        }
                      }
                    }
                    
                    return catName || 'Non spécifiée';
                  })()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Liste des demandeurs</Divider>

            <Table
              rowKey="id"
              loading={interestsLoading}
              dataSource={interests}
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: 'Demandeur',
                  render: (_, interest: InterestRequest) => (
                    <div>
                      <div><UserOutlined /> <Text strong>{interest.userName}</Text></div>
                      <div style={{ marginTop: 4 }}>
                        <MailOutlined /> <Text type="secondary" style={{ fontSize: 12 }}>{interest.userEmail}</Text>
                      </div>
                      {interest.userPhone && (
                        <div style={{ marginTop: 4 }}>
                          <PhoneOutlined /> <Text type="secondary" style={{ fontSize: 12 }}>{interest.userPhone}</Text>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: 'Quantité demandée',
                  render: (_, interest: InterestRequest) => interest.requestedQuantity || 'Tout'
                },
                {
                  title: 'Date de demande',
                  dataIndex: 'requestedAt',
                  render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
                },
                {
                  title: 'Statut',
                  dataIndex: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange'}>
                      {status === 'APPROVED' ? 'Approuvé' : status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                    </Tag>
                  )
                },
                {
                  title: 'Actions',
                  render: (_, interest: InterestRequest) => {
                    // Le donateur peut seulement voir, pas attribuer
                    // L'attribution est gérée par l'administrateur
                    return (
                      <Tag color={interest.status === 'APPROVED' ? 'green' : interest.status === 'REJECTED' ? 'red' : 'orange'}>
                        {interest.status === 'APPROVED' ? '✓ Attribué par admin' : 
                         interest.status === 'REJECTED' ? '✗ Refusé par admin' : 
                         '⏳ En attente de décision admin'}
                      </Tag>
                    );
                  }
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Info: L'attribution est gérée par l'administrateur */}
      {selectedAnnouncement && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#fff7e6', 
          border: '1px solid #ffd591',
          borderRadius: 4 
        }}>
          <Text type="warning">
            <strong>ℹ️ Information :</strong> L'attribution des dons est gérée par l'administrateur.
            Vous pouvez voir les demandes ici, mais seul l'admin peut attribuer les dons.
          </Text>
        </div>
      )}
    </div>
  );
}


