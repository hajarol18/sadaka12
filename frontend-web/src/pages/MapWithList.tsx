import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Col, Row, Select, Input, DatePicker, Table, Tag, Typography, Button, Spin, message, Badge } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { GiftOutlined, EnvironmentOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAnnonces } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import RequestButton from '../components/RequestButton';
import { 
  prepareAnnouncementsWithOffsets, 
  createCategoryIcon,
  extractCoordinates,
  isValidMoroccoCoordinates
} from '../utils/mapHelpers';
import type { Annonce, Category, Commune } from '../types/api';

const { Title, Text, Paragraph } = Typography;

// Composant pour zoomer sur un point spécifique et ajuster la vue
function MapController({ 
  selectedAnnouncement, 
  announcements, 
  shouldFitBounds,
  onZoomChange
}: { 
  selectedAnnouncement: Annonce | null; 
  announcements: Annonce[]; 
  shouldFitBounds: boolean;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    // Suivre le niveau de zoom actuel
    const updateZoom = () => {
      onZoomChange(map.getZoom());
    };
    
    map.on('zoomend', updateZoom);
    map.on('zoom', updateZoom);
    updateZoom(); // Initial
    
    return () => {
      map.off('zoomend', updateZoom);
      map.off('zoom', updateZoom);
    };
  }, [map, onZoomChange]);

  useEffect(() => {
    // Si une annonce est sélectionnée, zoomer dessus
    if (selectedAnnouncement) {
      const coords = extractCoordinates(selectedAnnouncement);
      if (coords) {
        map.setView([coords.lat, coords.lng], 15, { animate: true, duration: 0.8 });
        hasZoomedRef.current = true;
        return;
      }
    }

    // Sinon, ajuster la vue pour montrer tous les points (si demandé)
    if (shouldFitBounds && announcements.length > 0 && !hasZoomedRef.current) {
      const validCoords = announcements
        .map(a => extractCoordinates(a))
        .filter((coords): coords is { lat: number; lng: number } => coords !== null);
      
      if (validCoords.length > 0) {
        if (validCoords.length === 1) {
          const { lat, lng } = validCoords[0];
          map.setView([lat, lng], 12, { animate: false });
        } else if (validCoords.length > 1) {
          const latlngs = validCoords.map(({ lat, lng }) => L.latLng(lat, lng));
          const boundsObj = L.latLngBounds(latlngs);
          map.fitBounds(boundsObj as any, { 
            padding: [80, 80], 
            maxZoom: 13,
            animate: false
          });
        }
        hasZoomedRef.current = true;
      }
    }
  }, [selectedAnnouncement, announcements, shouldFitBounds, map]);

  return null;
}

export default function MapWithList() {
  const [announcements, setAnnouncements] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  
  // État pour la synchronisation
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<number | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(6);
  
  // Filtres communs (affectent carte ET liste)
  const [search, setSearch] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [communeIds, setCommuneIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [shouldFitBounds, setShouldFitBounds] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('[MapWithList] Début du chargement des données');
      try {
        const [annonces, cats, comms] = await Promise.allSettled([
          getAnnonces().catch((e) => {
            console.error('[MapWithList] Erreur getAnnonces:', e);
            return [];
          }),
          getCategories().catch((e) => {
            console.error('[MapWithList] Erreur getCategories:', e);
            return [];
          }),
          getCommunes().catch((e) => {
            console.error('[MapWithList] Erreur getCommunes:', e);
            return [];
          })
        ]);
        
        const annoncesData = annonces.status === 'fulfilled' ? annonces.value : [];
        const catsData = cats.status === 'fulfilled' ? cats.value : [];
        const commsData = comms.status === 'fulfilled' ? comms.value : [];
        
        console.log('[MapWithList] Données reçues:', {
          annonces: Array.isArray(annoncesData) ? annoncesData.length : 'non-array',
          categories: Array.isArray(catsData) ? catsData.length : 'non-array',
          communes: Array.isArray(commsData) ? commsData.length : 'non-array'
        });
        
        setAnnouncements(Array.isArray(annoncesData) ? annoncesData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCommunes(Array.isArray(commsData) ? commsData : []);
        
        if (commsData.length === 0) {
          console.warn('[MapWithList] ⚠️ Aucune commune chargée - Vérifier le backend et PostgreSQL');
        }
        if (annoncesData.length === 0) {
          console.warn('[MapWithList] ⚠️ Aucune annonce chargée - Vérifier le backend et PostgreSQL');
        }
      } catch (error: any) {
        console.error('[MapWithList] Erreur lors du chargement des données:', error);
        message.error('Erreur lors du chargement des données. Vérifiez que le backend est démarré.');
      } finally {
        setLoading(false);
        console.log('[MapWithList] Chargement terminé');
      }
    };
    loadData();
  }, []);

  // Appliquer les filtres (UNE SEULE SOURCE DE DONNÉES)
  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

    console.log('[MapWithList] Filtrage avec:', {
      total: announcements.length,
      search,
      categoryId,
      communeIds: communeIds.length,
      statusFilter,
      dateRange: dateRange ? [dateRange[0]?.format('DD/MM/YYYY'), dateRange[1]?.format('DD/MM/YYYY')] : null
    });

    // Filtre par recherche (titre, description, commune, catégorie)
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((a) => {
        const titreMatch = a.titre?.toLowerCase().includes(searchLower);
        const descMatch = a.description?.toLowerCase().includes(searchLower);
        const communeMatch = a.commune?.nomCommune?.toLowerCase().includes(searchLower);
        const categorieMatch = a.categorie?.nom?.toLowerCase().includes(searchLower) || 
                              (a.categorie as any)?.name?.toLowerCase().includes(searchLower);
        return titreMatch || descMatch || communeMatch || categorieMatch;
      });
      console.log('[MapWithList] Après filtre recherche:', filtered.length);
    }

    // Filtre par catégorie
    if (categoryId) {
      filtered = filtered.filter((a) => a.categorie?.id === categoryId);
      console.log('[MapWithList] Après filtre catégorie:', filtered.length);
    }

    // Filtre par communes
    if (communeIds.length > 0) {
      filtered = filtered.filter((a) => a.commune && communeIds.includes(a.commune.gid));
      console.log('[MapWithList] Après filtre communes:', filtered.length);
    }

    // Filtre par statut
    if (statusFilter) {
      filtered = filtered.filter((a) => a.status === statusFilter);
      console.log('[MapWithList] Après filtre statut:', filtered.length);
    }

    // Filtre par date
    if (dateRange && dateRange[0] && dateRange[1]) {
      try {
        const startDate = dateRange[0].startOf('day').toDate();
        const endDate = dateRange[1].endOf('day').toDate();
        filtered = filtered.filter((a) => {
          if (!a.date) return false;
          const annonceDate = new Date(a.date);
          return annonceDate >= startDate && annonceDate <= endDate;
        });
        console.log('[MapWithList] Après filtre date:', filtered.length);
      } catch (error) {
        console.error('[MapWithList] Erreur filtre date:', error);
      }
    }

    // Filtrer les annonces avec coordonnées valides
    filtered = filtered.filter(a => {
      const coords = extractCoordinates(a);
      return coords !== null;
    });

    console.log('[MapWithList] Résultat final:', filtered.length, 'annonces');
    return filtered;
  }, [announcements, search, categoryId, communeIds, statusFilter, dateRange]);

  // Préparer les annonces avec offsets pour éviter la superposition
  // Utilise le zoom actuel pour décider d'afficher plusieurs markers selon la quantité
  // Seuil réduit à 10 pour afficher les markers multiples plus tôt
  const announcementsWithOffsets = useMemo(() => {
    return prepareAnnouncementsWithOffsets(filteredAnnouncements, currentZoom, 10);
  }, [filteredAnnouncements, currentZoom]);

  // Recalculer les bounds quand les filtres changent
  useEffect(() => {
    if (filteredAnnouncements.length > 0) {
      setShouldFitBounds(true);
      // Reset après un délai pour permettre le recalcul
      setTimeout(() => setShouldFitBounds(false), 100);
    }
  }, [filteredAnnouncements.length, categoryId, communeIds.length, statusFilter]);

  // Gérer le clic sur une ligne de la liste → zoom sur la carte
  const handleRowClick = (announcement: Annonce) => {
    setSelectedAnnouncementId(announcement.id);
    setHighlightedMarkerId(announcement.id);
    // Faire défiler la ligne dans la vue
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-row-id="${announcement.id}"]`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Gérer le clic sur un marqueur de la carte → highlight dans la liste
  const handleMarkerClick = (announcementId: number) => {
    setHighlightedMarkerId(announcementId);
    setSelectedAnnouncementId(announcementId);
    // Faire défiler la ligne correspondante dans la liste
    setTimeout(() => {
      const rowElement = document.querySelector(`[data-row-id="${announcementId}"]`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearch(undefined);
    setCategoryId(undefined);
    setCommuneIds([]);
    setDateRange(null);
    setStatusFilter(undefined);
    setSelectedAnnouncementId(null);
    setHighlightedMarkerId(null);
    message.info('Filtres réinitialisés');
  };

  const selectedAnnouncement = filteredAnnouncements.find(a => a.id === selectedAnnouncementId) || null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'approuvée': 'green',
      'déclarée': 'orange',
      'rejetée': 'red',
      'annulée': 'default',
      'modifiée': 'orange'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'approuvée': '✅ Approuvée',
      'déclarée': '⏳ En attente',
      'rejetée': '❌ Rejetée',
      'annulée': '🗑️ Annulée',
      'modifiée': '✏️ Modifiée'
    };
    return labels[status] || status;
  };

  const center: [number, number] = [28.5, -8.0]; // Centre du Maroc
  const moroccoBounds = L.latLngBounds(
    [23.0, -17.0],
    [35.8, -1.1]
  );

  // Statistiques pour affichage
  const stats = useMemo(() => {
    const total = filteredAnnouncements.length;
    const byStatus = filteredAnnouncements.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byCategory = filteredAnnouncements.reduce((acc, a) => {
      const catName = a.categorie?.nom || (a.categorie as any)?.name || 'Non spécifiée';
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byStatus, byCategory };
  }, [filteredAnnouncements]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* CARTE (GAUCHE) */}
      <div style={{ flex: 1, position: 'relative', borderRight: '1px solid #f0f0f0' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'white',
            padding: 20,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Spin size="large" />
          </div>
        )}
        <MapContainer 
          center={center} 
          zoom={6} 
          minZoom={5}
          maxZoom={18}
          maxBounds={moroccoBounds}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">ESRI</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
          
          <MapController 
            selectedAnnouncement={selectedAnnouncement} 
            announcements={filteredAnnouncements}
            shouldFitBounds={shouldFitBounds}
            onZoomChange={setCurrentZoom}
          />
          
          {announcementsWithOffsets.map(({ announcement, position, offsetIndex, totalAtLocation, quantityIndex, totalQuantity }) => {
            const isHighlighted = highlightedMarkerId === announcement.id;
            const isHovered = hoveredMarkerId === announcement.id;
            const categoryName = announcement.categorie?.nom || (announcement.categorie as any)?.name;
            
            // Créer une icône colorée par catégorie avec état hover
            // UN SEUL MARKER par annonce, même si quantité > 1
            const markerKey = announcement.id.toString();
            const icon = createCategoryIcon(categoryName, isHighlighted, isHovered, 0, totalQuantity);
            
            // Badge si plusieurs markers au même endroit
            const hasMultipleAtLocation = totalAtLocation > 1;
            
            return (
              <Marker
                key={markerKey}
                position={position}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(announcement.id),
                  mouseover: () => {
                    // Highlight et hover au survol
                    setHighlightedMarkerId(announcement.id);
                    setHoveredMarkerId(announcement.id);
                  },
                  mouseout: () => {
                    // Retirer le hover mais garder le highlight si c'est la sélection
                    setHoveredMarkerId(null);
                  }
                }}
              >
                <Popup maxWidth={280}>
                  <div style={{ minWidth: 200 }}>
                    {hasMultipleAtLocation && (
                      <Badge 
                        count={totalAtLocation} 
                        style={{ 
                          position: 'absolute', 
                          top: -8, 
                          right: -8,
                          zIndex: 1000
                        }}
                        title={`${totalAtLocation} annonce(s) à cet emplacement`}
                      />
                    )}
                    <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                      {announcement.titre || 'Annonce de don'}
                    </Text>
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                      <Tag color={getStatusColor(announcement.status)}>
                        {getStatusLabel(announcement.status)}
                      </Tag>
                      {categoryName && (
                        <Tag color="green" style={{ marginLeft: 4 }}>
                          {categoryName}
                        </Tag>
                      )}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Text type="secondary">Quantité: </Text>
                      <Text strong>{announcement.quatite || 0}</Text>
                    </div>
                    {announcement.commune && (
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary">Commune: </Text>
                        <Text strong>{announcement.commune.nomCommune}</Text>
                      </div>
                    )}
                    {hasMultipleAtLocation && (
                      <div style={{ marginBottom: 4, padding: 4, background: '#fffbe6', borderRadius: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          ⚠️ {totalAtLocation} annonce(s) au même endroit (marker #{offsetIndex + 1})
                        </Text>
                      </div>
                    )}
                    {announcement.description && (
                      <Paragraph 
                        ellipsis={{ rows: 2, expandable: true }}
                        style={{ margin: '8px 0', fontSize: 12 }}
                      >
                        {announcement.description}
                      </Paragraph>
                    )}
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <RequestButton annonce={announcement} />
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* LISTE (DROITE) */}
      <div style={{ width: 500, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Filtres */}
        <Card 
          size="small" 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <FilterOutlined style={{ marginRight: 8 }} />
                Filtres
              </div>
              {(search || categoryId || communeIds.length > 0 || statusFilter || dateRange) && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleResetFilters}
                  title="Réinitialiser les filtres"
                />
              )}
            </div>
          }
          style={{ borderBottom: '1px solid #f0f0f0' }}
          extra={
            <Badge count={filteredAnnouncements.length} showZero style={{ backgroundColor: '#52c41a' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Résultats</Text>
            </Badge>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              placeholder="Recherche (titre, description, commune, catégorie)"
              value={search}
              onChange={(e) => setSearch(e.target.value || undefined)}
              allowClear
              prefix={<FilterOutlined />}
            />
            <Select
              allowClear
              placeholder="Catégorie"
              value={categoryId}
              onChange={(value) => setCategoryId(value || undefined)}
              options={categories.map((cat) => ({
                label: cat.nom || (cat as any).name || 'Non spécifiée',
                value: cat.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={
                categories.length === 0 ? (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f', fontSize: 12 }}>
                    ⚠️ Aucune catégorie disponible
                  </div>
                ) : (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#999', fontSize: 12 }}>
                    Aucun résultat
                  </div>
                )
              }
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="Communes (recherche possible)"
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
              maxTagCount="responsive"
              notFoundContent={
                communes.length === 0 ? (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f', fontSize: 12 }}>
                    ⚠️ Aucune commune disponible
                  </div>
                ) : (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#999', fontSize: 12 }}>
                    Aucun résultat
                  </div>
                )
              }
            />
            <Select
              allowClear
              placeholder="Statut"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || undefined)}
              options={[
                { label: '✅ Approuvée', value: 'approuvée' },
                { label: '⏳ En attente', value: 'déclarée' },
                { label: '✏️ Modifiée', value: 'modifiée' },
                { label: '❌ Rejetée', value: 'rejetée' },
                { label: '🗑️ Annulée', value: 'annulée' }
              ]}
            />
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              format="DD/MM/YYYY"
              placeholder={['Date début', 'Date fin']}
            />
          </div>
        </Card>

        {/* Liste des annonces */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Card 
            size="small"
            title={
              <div>
                <GiftOutlined style={{ marginRight: 8 }} />
                Annonces ({filteredAnnouncements.length})
              </div>
            }
            style={{ height: '100%', border: 'none' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <Table
              rowKey="id"
              loading={loading}
              dataSource={filteredAnnouncements}
              pagination={{ 
                pageSize: 10, 
                size: 'small',
                showSizeChanger: true,
                showTotal: (total) => `${total} annonce(s)`
              }}
              size="small"
              scroll={{ y: 'calc(100vh - 300px)' }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                'data-row-id': record.id,
                style: {
                  cursor: 'pointer',
                  backgroundColor: highlightedMarkerId === record.id ? '#e6f7ff' : 'transparent',
                  transition: 'background-color 0.3s',
                  borderLeft: highlightedMarkerId === record.id ? '3px solid #1890ff' : 'none'
                }
              })}
              columns={[
                { 
                  title: 'Titre', 
                  dataIndex: 'titre',
                  ellipsis: { showTitle: true },
                  render: (text, record) => (
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 4 }}>
                        {text || 'Sans titre'}
                      </Text>
                      <Tag color={getStatusColor(record.status)} style={{ fontSize: 11 }}>
                        {getStatusLabel(record.status)}
                      </Tag>
                    </div>
                  )
                },
                {
                  title: 'Catégorie',
                  dataIndex: ['categorie', 'nom'],
                  width: 120,
                  render: (nom, record) => {
                    const catName = nom || (record.categorie as any)?.name || 'Non spécifiée';
                    return <Tag color="green">{catName}</Tag>;
                  }
                },
                { 
                  title: 'Quantité', 
                  dataIndex: 'quatite',
                  width: 80,
                  align: 'center' as const,
                  render: (q) => <Text strong>{q || 0}</Text>
                },
                {
                  title: 'Commune',
                  dataIndex: ['commune', 'nomCommune'],
                  ellipsis: { showTitle: true },
                  render: (nom) => nom ? <Text>{nom}</Text> : '-'
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  width: 100,
                  render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
                },
                {
                  title: 'Action',
                  width: 140,
                  fixed: 'right' as const,
                  render: (_: any, record: Annonce) => (
                    <RequestButton annonce={record} />
                  )
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

