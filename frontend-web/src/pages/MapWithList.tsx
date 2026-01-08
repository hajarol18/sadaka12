import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Col, Row, Select, Input, DatePicker, Table, Tag, Typography, Button, Spin, message } from 'antd';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { GiftOutlined, EnvironmentOutlined } from '@ant-design/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAnnonces } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import RequestButton from '../components/RequestButton';
import type { Annonce, Category, Commune } from '../types/api';

const { Title, Text, Paragraph } = Typography;

// Fix default icon path
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Composant pour zoomer sur un point spécifique
function MapController({ selectedAnnouncement, announcements }: { selectedAnnouncement: Annonce | null; announcements: Annonce[] }) {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    if (selectedAnnouncement && selectedAnnouncement.geom?.coordinates) {
      const [lng, lat] = selectedAnnouncement.geom.coordinates;
      if (lat && lng) {
        map.setView([lat, lng], 14, { animate: true });
        hasZoomedRef.current = true;
      }
    } else if (announcements.length > 0 && !hasZoomedRef.current) {
      // Ajuster la vue pour montrer tous les points
      const validAnnouncements = announcements.filter(a => {
        if (!a.geom || !a.geom.coordinates) return false;
        const [lng, lat] = a.geom.coordinates;
        return lat && lng;
      });
      
      if (validAnnouncements.length > 0) {
        const bounds = validAnnouncements.map(a => {
          const [lng, lat] = a.geom!.coordinates;
          return [lat, lng] as [number, number];
        });
        
        if (bounds.length === 1) {
          map.setView(bounds[0], 12);
        } else if (bounds.length > 1) {
          const latlngs = bounds.map(([lat, lng]) => L.latLng(lat, lng));
          const boundsObj = L.latLngBounds(latlngs);
          map.fitBounds(boundsObj as any, { padding: [50, 50], maxZoom: 12 });
        }
        hasZoomedRef.current = true;
      }
    }
  }, [selectedAnnouncement, announcements, map]);

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
  
  // Filtres communs (affectent carte ET liste)
  const [search, setSearch] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [communeIds, setCommuneIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<any>();

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

    // Filtre par recherche
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
      try {
        const startDate = dateRange[0].startOf('day').toDate();
        const endDate = dateRange[1].endOf('day').toDate();
        filtered = filtered.filter((a) => {
          if (!a.date) return false;
          const annonceDate = new Date(a.date);
          return annonceDate >= startDate && annonceDate <= endDate;
        });
      } catch (error) {
        console.error('[MapWithList] Erreur filtre date:', error);
      }
    }

    return filtered;
  }, [announcements, search, categoryId, communeIds, dateRange]);

  // Gérer le clic sur une ligne de la liste → zoom sur la carte
  const handleRowClick = (announcement: Annonce) => {
    setSelectedAnnouncementId(announcement.id);
    setHighlightedMarkerId(announcement.id);
  };

  // Gérer le clic sur un marqueur de la carte → highlight dans la liste
  const handleMarkerClick = (announcementId: number) => {
    setHighlightedMarkerId(announcementId);
    setSelectedAnnouncementId(announcementId);
  };

  const selectedAnnouncement = filteredAnnouncements.find(a => a.id === selectedAnnouncementId) || null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'approuvée': 'green',
      'déclarée': 'orange',
      'rejetée': 'red',
      'annulée': 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'approuvée': 'Approuvée',
      'déclarée': 'En attente',
      'rejetée': 'Rejetée',
      'annulée': 'Annulée'
    };
    return labels[status] || status;
  };

  const center: [number, number] = [28.5, -8.0]; // Centre du Maroc
  const moroccoBounds = L.latLngBounds(
    [23.0, -17.0],
    [35.8, -1.1]
  );

  const validAnnouncements = filteredAnnouncements.filter(a => {
    if (!a.geom || !a.geom.coordinates) return false;
    const [lng, lat] = a.geom.coordinates;
    return lat && lng;
  });

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
          
          <MapController selectedAnnouncement={selectedAnnouncement} announcements={validAnnouncements} />
          
          {validAnnouncements.map((announcement) => {
            const [lng, lat] = announcement.geom!.coordinates;
            const isHighlighted = highlightedMarkerId === announcement.id;
            
            // Icône personnalisée pour le marqueur highlighté
            const icon = isHighlighted 
              ? new L.Icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  iconSize: [35, 51],
                  iconAnchor: [17, 51],
                  popupAnchor: [1, -34],
                  shadowSize: [51, 51],
                  className: 'highlighted-marker'
                })
              : defaultIcon;
            
            return (
              <Marker
                key={announcement.id}
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(announcement.id)
                }}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {announcement.titre || 'Annonce de don'}
                    </Text>
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                      <Tag color={getStatusColor(announcement.status)}>
                        {getStatusLabel(announcement.status)}
                      </Tag>
                      {announcement.categorie && (
                        <Tag color="green" style={{ marginLeft: 4 }}>
                          {announcement.categorie.nom}
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
            <div>
              <EnvironmentOutlined style={{ marginRight: 8 }} />
              Filtres
            </div>
          }
          style={{ borderBottom: '1px solid #f0f0f0' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input
              placeholder="Recherche (titre, description)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Select
              allowClear
              placeholder="Catégorie"
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((cat) => ({
                label: cat.nom,
                value: cat.id,
              }))}
              notFoundContent={
                categories.length === 0 ? (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f' }}>
                    Aucune catégorie disponible
                  </div>
                ) : null
              }
            />
            <Select
              mode="multiple"
              allowClear
              placeholder="Communes"
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
              notFoundContent={
                communes.length === 0 ? (
                  <div style={{ padding: '8px 0', textAlign: 'center', color: '#ff4d4f' }}>
                    Aucune commune disponible
                  </div>
                ) : null
              }
            />
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
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
              pagination={{ pageSize: 10, size: 'small' }}
              size="small"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: {
                  cursor: 'pointer',
                  backgroundColor: highlightedMarkerId === record.id ? '#e6f7ff' : 'transparent',
                  transition: 'background-color 0.3s'
                }
              })}
              columns={[
                { 
                  title: 'Titre', 
                  dataIndex: 'titre',
                  ellipsis: true,
                  render: (text) => <Text strong>{text || 'Sans titre'}</Text>
                },
                {
                  title: 'Catégorie',
                  dataIndex: ['categorie', 'nom'],
                  render: (nom) => nom ? <Tag color="green">{nom}</Tag> : '-'
                },
                { 
                  title: 'Quantité', 
                  dataIndex: 'quatite',
                  width: 80,
                  render: (q) => q || 0
                },
                {
                  title: 'Commune',
                  dataIndex: ['commune', 'nomCommune'],
                  ellipsis: true,
                  render: (nom) => nom || '-'
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  width: 100,
                  render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : '-'
                },
                {
                  title: 'Action',
                  width: 140,
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

