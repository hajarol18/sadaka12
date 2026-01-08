import { Button, Card, Col, DatePicker, Drawer, Input, Row, Select, Slider, Table, Tag, message, Divider } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { getAnnonces, getAnnoncesForFilter } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { getCommunes } from '../services/communeService';
import type { Annonce, Category, Commune } from '../types/api';

type InterestRecord = {
  announcementId: number;
  interestId: string;
};

export default function Announcements() {
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
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [selected, setSelected] = useState<Annonce | null>(null);
  
  const [interestedRecords, setInterestedRecords] = useState<InterestRecord[]>(() => {
    try {
      const stored = localStorage.getItem('sadaka_interest_records');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // S'assurer que c'est un tableau
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

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
        setData(Array.isArray(annoncesData) ? annoncesData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setCommunes(Array.isArray(commsData) ? commsData : []);
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

    // Filtre par distance (nécessite la géolocalisation de l'utilisateur)
    // Pour l'instant, on ignore ce filtre car il nécessite la position de l'utilisateur

    setFilteredData(filtered);
  }, [data, search, categoryId, communeIds, dateRange, distanceKm]);

  useEffect(() => {
    localStorage.setItem('sadaka_interest_records', JSON.stringify(interestedRecords));
  }, [interestedRecords]);

  const isInterested = useMemo(
    () => (announcementId: number) => {
      if (!Array.isArray(interestedRecords)) return false;
      return interestedRecords.some((r) => r.announcementId === announcementId);
    },
    [interestedRecords]
  );

  const getInterestId = (announcementId: number) => {
    if (!Array.isArray(interestedRecords)) return undefined;
    return interestedRecords.find((r) => r.announcementId === announcementId)?.interestId;
  };

  const handleToggleInterest = async (announcement: Annonce) => {
    if (!announcement) return;
    const alreadyInterested = isInterested(announcement.id);
    try {
      if (!alreadyInterested) {
        // TODO: Implémenter l'endpoint de demande d'intérêt quand il sera disponible
        const interestId = `local-${Date.now()}`;
        setInterestedRecords((prev) => [...prev, { announcementId: announcement.id, interestId }]);
        message.success('Demande d\'intérêt enregistrée');
        setSelected(null);
      } else {
        const interestId = getInterestId(announcement.id);
        // TODO: Implémenter la suppression de demande d'intérêt
        setInterestedRecords((prev) => prev.filter((r) => r.announcementId !== announcement.id));
        message.info('Demande d\'intérêt retirée');
        setSelected(null);
      }
    } catch (e: any) {
      message.error(e?.message || 'Action impossible');
    }
  };

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
          <Col xs={24} md={8}>
            <div>
              <div>Distance (km) - À implémenter</div>
              <Slider 
                min={0} 
                max={50} 
                step={1} 
                value={distanceKm} 
                onChange={setDistanceKm}
                disabled
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card title={`Annonces (${filteredData.length})`}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredData}
          columns={[
            { 
              title: 'Titre', 
              dataIndex: 'titre',
              render: (text) => text || 'Sans titre'
            },
            {
              title: 'Catégorie',
              dataIndex: ['categorie', 'nom'],
              render: (nom) => nom || 'Non spécifiée'
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
              title: 'Statut',
              dataIndex: 'status',
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                  {getStatusLabel(status)}
                </Tag>
              )
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
                  {selected.categorie?.nom || 'Non spécifiée'}
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
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: '#52c41a' }}>Statut:</strong>
                <Tag color={getStatusColor(selected.status)} style={{ marginLeft: 8 }}>
                  {getStatusLabel(selected.status)}
                </Tag>
              </div>
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
            <Button
              type={isInterested(selected.id) ? 'default' : 'primary'}
              danger={isInterested(selected.id)}
              size="large"
              block
              onClick={() => handleToggleInterest(selected)}
            >
              {isInterested(selected.id) ? 'Retirer ma demande' : 'Je suis intéressé(e)'}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
