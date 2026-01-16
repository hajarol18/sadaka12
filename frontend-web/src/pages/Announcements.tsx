import { Button, Card, Col, DatePicker, Drawer, Image, Input, Row, Select, Table, Tag, message, Divider } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { getAnnonces, getAnnoncesForFilter } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import RequestButton from '../components/RequestButton';
import { useAuth } from '../context/AuthContext';
import type { Annonce, Category, Commune } from '../types/api';

export default function Announcements() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<Annonce[]>([]);
  const [filteredData, setFilteredData] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  
  // Filtres
  const [search, setSearch] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [communeIds, setCommuneIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<any>();
  const [selected, setSelected] = useState<Annonce | null>(null);

  // Fonction pour résoudre l'URL de la photo
  const resolvePhotoUrl = (photo?: string, annonceId?: number) => {
    if (!photo) {
      // Si pas de photo mais qu'on a un ID, essayer l'endpoint par défaut
      if (annonceId) {
        return `/api/v1/annonce/${annonceId}/image`;
      }
      return '';
    }
    // Si c'est déjà une URL complète (http/https/data)
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
      return photo;
    }
    // Si c'est un chemin relatif qui commence par /api/v1/annonce, le garder tel quel
    if (photo.startsWith('/api/v1/annonce/')) {
      return photo;
    }
    // Sinon, construire l'URL avec l'ID si disponible
    if (annonceId && !photo.startsWith('/')) {
      return `/api/v1/annonce/${annonceId}/image`;
    }
    // Si c'est un chemin relatif, le garder
    if (photo.startsWith('/')) {
      return photo;
    }
    // Par défaut, utiliser l'endpoint avec l'ID
    if (annonceId) {
      return `/api/v1/annonce/${annonceId}/image`;
    }
    return '';
  };

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [annonces, cats, comms] = await Promise.allSettled([
          getAnnonces().catch(() => []),
          getCategories().catch(() => []),
          getCommunes().catch(() => []),
        ]);
        
        const annoncesData = annonces.status === 'fulfilled' ? annonces.value : [];
        const catsData = cats.status === 'fulfilled' ? cats.value : [];
        const commsData = comms.status === 'fulfilled' ? comms.value : [];
        
        // S'assurer que ce sont des tableaux
        const annoncesArray = Array.isArray(annoncesData) ? annoncesData : [];
        console.log('[Announcements] Annonces chargées:', annoncesArray.length, annoncesArray);
        setData(annoncesArray);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCommunes(Array.isArray(commsData) ? commsData : []);
        
        if (annoncesArray.length === 0) {
          console.warn('[Announcements] ⚠️ Aucune annonce trouvée!');
          console.warn('[Announcements] Vérifiez que le backend est démarré et accessible');
        }
      } catch (error: any) {
        console.error('[Announcements] Erreur:', error);
        message.error(error?.message || 'Erreur lors du chargement des données');
        setData([]);
        setCategories([]);
        setCommunes([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    // S'assurer que data est un tableau
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }
    
    let filtered = [...data];

    // Filtre par recherche (titre, description)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.titre?.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par catégorie
    if (categoryId) {
      filtered = filtered.filter((a) => a.categorie?.id === categoryId);
    }

    // Filtre par communes
    if (communeIds.length > 0) {
      filtered = filtered.filter((a) => a.commune && communeIds.includes(a.commune.gid));
    }

    // Filtre par date
    if (dateRange && dateRange[0] && dateRange[1]) {
      // Ant Design DatePicker retourne des objets dayjs
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter((a) => {
        const annonceDate = new Date(a.date);
        return annonceDate >= startDate && annonceDate <= endDate;
      });
    }

    // Filtre: Afficher seulement les annonces approuvées et avec quantité disponible
    // Note: Pour une détection précise des annonces épuisées, il faudrait calculer la quantité disponible
    // en soustrayant les quantités attribuées aux demandes approuvées. Pour l'instant, on filtre simplement
    // les annonces avec quatite = 0 ou null. Une amélioration future serait de calculer cela côté backend.
    filtered = filtered.filter((a) => {
      // Exclure les annonces non approuvées
      if (a.status !== 'approuvée') {
        return false;
      }
      // Exclure les annonces avec quantité = 0 ou null (épuisées ou invalides)
      const quantite = a.quatite || 0;
      if (quantite <= 0) {
        return false;
      }
      return true;
    });

    setFilteredData(filtered);
    console.log('[Announcements] Filtres appliqués:', {
      totalData: data.length,
      filteredCount: filtered.length,
      search,
      categoryId,
      communeIds,
      dateRange
    });
  }, [data, search, categoryId, communeIds, dateRange]);

  // Vérifier si l'utilisateur connecté est le donateur d'une annonce
  const isOwner = useMemo(
    () => (annonce: Annonce) => {
      if (!isAuthenticated || !user?.id || !annonce?.donnateur) {
        return false;
      }
      const donnateurId = annonce.donnateur?.id || (annonce.donnateur as any)?.id || null;
      const userId = parseInt(user.id) || 0;
      return donnateurId !== null && (donnateurId === userId || donnateurId.toString() === user.id);
    },
    [isAuthenticated, user?.id]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approuvée':
        return 'green';
      case 'déclarée':
        return 'orange';
      case 'rejetée':
        return 'red';
      case 'annulée':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approuvée':
        return 'Approuvé';
      case 'déclarée':
        return 'En attente';
      case 'rejetée':
        return 'Rejeté';
      case 'annulée':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <Card title="Filtrer les annonces">
        <Row gutter={12}>
          <Col xs={24} md={6}>
            <Input 
              placeholder="Recherche (titre, description)" 
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              allowClear
              placeholder="Catégorie"
              style={{ width: '100%' }}
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((cat) => ({
                label: cat.nom,
                value: cat.id,
              }))}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              mode="multiple"
              allowClear
              placeholder="Communes (une ou plusieurs)"
              style={{ width: '100%' }}
              value={communeIds}
              onChange={setCommuneIds}
              options={communes.map((comm) => ({
                label: comm.nomCommune,
                value: comm.gid,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <DatePicker.RangePicker 
              style={{ width: '100%' }} 
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
      </Card>

      <Card title={`Annonces (${filteredData.length})`}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={Array.isArray(filteredData) ? filteredData : []}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucune annonce trouvée. Vérifiez que le backend est démarré.'
          }}
          columns={[
            {
              title: 'Photo',
              dataIndex: 'photo',
              width: 90,
              render: (photo: string | undefined, record: Annonce) => {
                const photoUrl = resolvePhotoUrl(photo || record.photo, record.id);
                if (!photoUrl) {
                  return null; // Ne rien afficher si pas de photo
                }
                return (
                  <Image
                    src={photoUrl}
                    alt={record.titre || 'Photo annonce'}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                    preview={{ mask: 'Aperçu' }}
                  />
                );
              }
            },
            { 
              title: 'Titre', 
              dataIndex: 'titre',
              render: (text) => text || 'Sans titre'
            },
            {
              title: 'Catégorie',
              dataIndex: ['categorie'],
              render: (categorie: any, record: Annonce) => {
                // Le backend peut sérialiser comme 'name' ou 'nom' selon Jackson
                const catName = (record.categorie as any)?.name || record.categorie?.nom || 'Non spécifiée';
                return catName;
              }
            },
            { 
              title: 'Quantité', 
              dataIndex: 'quatite',
              render: (q) => q || 0
            },
            {
              title: 'Commune',
              dataIndex: ['commune', 'nomCommune'],
              render: (nom) => nom || 'Non spécifiée'
            },
            {
              title: 'Date',
              dataIndex: 'date',
              render: (date: string) => new Date(date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            },
            {
              title: 'Actions',
              render: (_, r: Annonce) => (
                <Button size="small" type="link" onClick={() => setSelected(r)}>
                  Détails
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.titre || 'Détails annonce'}
        width={520}
      >
        {selected && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#52c41a' }}>Catégorie:</strong>
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {(selected.categorie as any)?.name || selected.categorie?.nom || 'Non spécifiée'}
                </Tag>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#52c41a' }}>Quantité:</strong> {selected.quatite || 0}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#52c41a' }}>Commune:</strong>{' '}
                {selected.commune?.nomCommune || 'Non spécifiée'}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#52c41a' }}>Date de publication:</strong>{' '}
                {new Date(selected.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {/* Le statut n'est pas affiché car toutes les annonces affichées sont approuvées */}
            </div>
            {selected.description && (
              <div>
                <strong style={{ color: '#52c41a', display: 'block', marginBottom: 8 }}>
                  Description:
                </strong>
                <p
                  style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {selected.description}
                </p>
              </div>
            )}
            {resolvePhotoUrl(selected.photo, selected.id) && (
              <div>
                <strong style={{ color: '#52c41a', display: 'block', marginBottom: 8 }}>
                  Photo de l'annonce:
                </strong>
                <Image
                  src={resolvePhotoUrl(selected.photo, selected.id)}
                  alt={selected.titre || 'Photo annonce'}
                  style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8 }}
                  preview={{ mask: 'Aperçu' }}
                />
              </div>
            )}
            {selected.donnateur && (
              <>
                <Divider>Contact du donateur</Divider>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(selected.donnateur.nom || selected.donnateur.prenom) && (
                    <div>
                      <UserOutlined />{' '}
                      <strong style={{ marginLeft: 6 }}>
                        {selected.donnateur.prenom} {selected.donnateur.nom}
                      </strong>
                    </div>
                  )}
                  {selected.donnateur.email && (
                    <div>
                      <MailOutlined />{' '}
                      <span style={{ marginLeft: 6 }}>{selected.donnateur.email}</span>
                    </div>
                  )}
                  {selected.donnateur.telephone && (
                    <div>
                      <PhoneOutlined />{' '}
                      <span style={{ marginLeft: 6 }}>{selected.donnateur.telephone}</span>
                    </div>
                  )}
                </div>
              </>
            )}
            <Divider />
            <div style={{ textAlign: 'center' }}>
              {isOwner(selected) ? (
                <div style={{ padding: '16px', background: '#fffbe6', borderRadius: 4, border: '1px solid #ffe58f' }}>
                  <Tag color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>
                    ⚠️ C'est votre propre annonce
                  </Tag>
                  <p style={{ marginTop: 8, marginBottom: 0, color: '#666', fontSize: 13 }}>
                    Vous ne pouvez pas faire de demande sur votre propre annonce.
                    Gérez les demandes dans "Mes annonces".
                  </p>
                </div>
              ) : (
                <RequestButton 
                  annonce={selected} 
                  onSuccess={() => {
                    // Recharger les annonces après une demande réussie si nécessaire
                    setSelected(null);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
