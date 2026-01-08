import { Card, Col, DatePicker, Row, Select, Statistic, Table, Typography, Progress, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getAnnonces } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { GiftOutlined, CheckCircleOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Annonce } from '../types/api';

const { Title } = Typography;

export default function Dashboard() {
  const [data, setData] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [communeFilter, setCommuneFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<any>();

  // Charger les données depuis le backend réel
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [annonces, cats] = await Promise.allSettled([
          getAnnonces().catch(() => []),
          getCategories().catch(() => [])
        ]);
        
        const annoncesData = annonces.status === 'fulfilled' ? annonces.value : [];
        const catsData = cats.status === 'fulfilled' ? cats.value : [];
        
        // S'assurer que c'est un tableau
        const annoncesArray = Array.isArray(annoncesData) ? annoncesData : [];
        const catsArray = Array.isArray(catsData) ? catsData : [];
        
        setData(annoncesArray);
        setCategories(catsArray);
      } catch (error: any) {
        console.error('[Dashboard] Erreur:', error);
        message.error('Erreur lors du chargement des données');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrer les données
  const filteredData = useMemo(() => {
    // S'assurer que data est un tableau
    if (!Array.isArray(data)) {
      return [];
    }
    
    let filtered = [...data];
    
    // Filtre par catégorie
    if (categoryFilter) {
      filtered = filtered.filter((a) => a.categorie?.id === categoryFilter);
    }
    
    // Filtre par commune
    if (communeFilter) {
      filtered = filtered.filter((a) => a.commune?.gid === communeFilter);
    }
    
    // Filtre par date
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter((a) => {
        if (!a.date) return false;
        const annonceDate = new Date(a.date);
        return annonceDate >= startDate && annonceDate <= endDate;
      });
    }
    
    return filtered;
  }, [data, categoryFilter, communeFilter, dateRange]);

  const totals = useMemo(() => {
    // S'assurer que filteredData est un tableau
    const safeData = Array.isArray(filteredData) ? filteredData : [];
    
    const total = safeData.length;
    const approved = safeData.filter((d) => d.status === 'approuvée' || d.status === 'APPROVED').length;
    const pending = safeData.filter((d) => d.status === 'déclarée' || d.status === 'PENDING').length;
    const donated = safeData.filter((d) => d.status === 'donné' || d.status === 'DONATED').length;
    const rejected = safeData.filter((d) => d.status === 'rejetée' || d.status === 'REJECTED').length;
    
    // Statistiques par catégorie
    const byCategory = safeData.reduce((acc, d) => {
      const catName = d.categorie?.nom || 'Non spécifiée';
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Total quantité
    const totalQuantity = safeData.reduce((sum, d) => sum + (d.quatite || 0), 0);
    
    return { total, approved, pending, donated, rejected, byCategory, totalQuantity };
  }, [filteredData]);

  // Plus besoin de categoryLabels, on utilise directement les noms des catégories

  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <Title level={2}>Tableau de Bord - Statistiques des Dons</Title>
      
      {/* Statistiques principales */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Annonces" 
              value={totals.total} 
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Annonces Validées" 
              value={totals.approved} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="En Attente" 
              value={totals.pending} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Donné" 
              value={totals.donated} 
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Histogramme par catégorie - Recharts */}
      <Card title="Nombre d'annonces par Catégorie">
        {Object.entries(totals.byCategory).length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(totals.byCategory).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#52c41a" name="Nombre d'annonces" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Aucune donnée disponible
          </div>
        )}
      </Card>

      {/* Histogramme par statut - Recharts */}
      <Card title="Répartition par Statut">
        {totals.total > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Approuvées', value: totals.approved },
                  { name: 'En attente', value: totals.pending },
                  { name: 'Données', value: totals.donated },
                  { name: 'Rejetées', value: totals.rejected }
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Approuvées', value: totals.approved },
                  { name: 'En attente', value: totals.pending },
                  { name: 'Données', value: totals.donated },
                  { name: 'Rejetées', value: totals.rejected }
                ].filter(item => item.value > 0).map((entry, index) => {
                  const colors = ['#52c41a', '#faad14', '#cf1322', '#ff4d4f'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Aucune donnée disponible
          </div>
        )}
      </Card>

      {/* Filtres */}
      <Card title="Filtres">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Catégorie"
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              loading={loading}
              options={categories.map((cat) => ({
                label: cat.nom,
                value: cat.id,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Commune"
              style={{ width: '100%' }}
              value={communeFilter}
              onChange={setCommuneFilter}
              disabled
              options={[]}
            />
          </Col>
          <Col xs={24} md={8}>
            <DatePicker.RangePicker style={{ width: '100%' }} onChange={setDateRange} />
          </Col>
        </Row>
      </Card>

      {/* Tableau des annonces */}
      <Card title="Liste des Annonces">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={Array.isArray(filteredData) ? filteredData : []}
          pagination={{ pageSize: 10 }}
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
              render: (qty) => qty || 0
            },
            { 
              title: 'Commune', 
              dataIndex: ['commune', 'nomCommune'],
              render: (nom) => nom || 'Non spécifiée'
            },
            { 
              title: 'Date', 
              dataIndex: 'date',
              render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A'
            }
          ]}
        />
      </Card>
    </div>
  );
}
