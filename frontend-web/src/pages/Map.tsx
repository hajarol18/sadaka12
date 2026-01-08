import { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Select, Input, DatePicker, Slider, Space, Typography } from 'antd';
import MapView from '../components/MapView';
import { getAnnonces } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import type { Annonce, Category, Commune } from '../types/api';

const { Title } = Typography;

export default function MapPage() {
  const [announcements, setAnnouncements] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  
  // Filtres
  const [search, setSearch] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [communeIds, setCommuneIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<any>();
  const [distanceKm, setDistanceKm] = useState<number>(0);

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [annonces, cats, comms] = await Promise.all([
          getAnnonces(),
          getCategories(),
          getCommunes(),
        ]);
        setAnnouncements(annonces);
        setCategories(cats);
        setCommunes(comms);
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Appliquer les filtres
  const filteredAnnouncements = useMemo(() => {
    let filtered = [...announcements];

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
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter((a) => {
        const annonceDate = new Date(a.date);
        return annonceDate >= startDate && annonceDate <= endDate;
      });
    }

    return filtered;
  }, [announcements, search, categoryId, communeIds, dateRange, distanceKm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={3} style={{ margin: 0, marginBottom: 16 }}>
          Carte SIG - Géolocalisation des Dons
        </Title>
        <Card size="small">
          <Row gutter={12}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Recherche (titre, description)"
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
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
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                allowClear
                placeholder="Communes (sélection multiple)"
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
            <Col xs={24} sm={12} md={6}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <span>Distance: {distanceKm} km (À implémenter)</span>
                <Slider
                  min={0}
                  max={50}
                  step={5}
                  value={distanceKm}
                  onChange={setDistanceKm}
                  tooltip={{ formatter: (value) => `${value} km` }}
                  disabled
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView announcements={filteredAnnouncements} loading={loading} />
      </div>
    </div>
  );
}
