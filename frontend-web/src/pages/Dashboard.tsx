import { Card, Col, DatePicker, Row, Select, Statistic, Table, Typography, Progress, message, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getAnnonces } from '../services/annonceService';
import { getCategories } from '../services/categoryService';
import { GiftOutlined, CheckCircleOutlined, ClockCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Annonce } from '../types/api';

const { Title, Text } = Typography;

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
        console.log('[Dashboard] ========================================');
        console.log('[Dashboard] Chargement des données...');
        
        const [annonces, cats] = await Promise.allSettled([
          getAnnonces().catch((e) => {
            console.error('[Dashboard] Erreur getAnnonces:', e);
            return [];
          }),
          getCategories().catch((e) => {
            console.error('[Dashboard] Erreur getCategories:', e);
            return [];
          })
        ]);
        
        const annoncesData = annonces.status === 'fulfilled' ? annonces.value : [];
        const catsData = cats.status === 'fulfilled' ? cats.value : [];
        
        // S'assurer que c'est un tableau
        const annoncesArray = Array.isArray(annoncesData) ? annoncesData : [];
        const catsArray = Array.isArray(catsData) ? catsData : [];
        
        console.log('[Dashboard] Annonces chargées:', annoncesArray.length);
        console.log('[Dashboard] Catégories chargées:', catsArray.length);
        console.log('[Dashboard] Exemple annonce:', annoncesArray[0]);
        console.log('[Dashboard] Exemple catégorie:', catsArray[0]);
        
        // Log détaillé des catégories pour debug
        if (catsArray.length > 0) {
          console.log('[Dashboard] Détails catégories:', catsArray.map(c => ({
            id: c.id,
            nom: c.nom,
            name: c.name,
            structure: Object.keys(c)
          })));
        }
        
        // Log détaillé des annonces pour debug
        if (annoncesArray.length > 0) {
          console.log('[Dashboard] Détails annonces:', annoncesArray.map(a => ({
            id: a.id,
            titre: a.titre,
            status: a.status,
            categorie_id: a.categorie?.id,
            categorie_nom: a.categorie?.nom,
            categorie_name: a.categorie?.name,
            categorie_structure: a.categorie ? Object.keys(a.categorie) : null
          })));
        }
        
        setData(annoncesArray);
        setCategories(catsArray);
        
        console.log('[Dashboard] Données chargées avec succès');
        console.log('[Dashboard] ========================================');
      } catch (error: any) {
        console.error('[Dashboard] Erreur globale:', error);
        console.error('[Dashboard] Stack:', error.stack);
        message.error('Erreur lors du chargement des données');
        setData([]);
        setCategories([]);
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

  // Créer un mapping fiable des catégories par ID
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((cat: any) => {
      if (cat && cat.id) {
        // Essayer plusieurs façons de récupérer le nom
        const nom = cat.nom || cat.name || (cat.getName && cat.getName()) || `Catégorie ${cat.id}`;
        map.set(cat.id, nom);
        console.log('[Dashboard] Mapping catégorie:', { id: cat.id, nom, keys: Object.keys(cat) });
      }
    });
    console.log('[Dashboard] CategoryMap créé:', Array.from(map.entries()));
    return map;
  }, [categories]);

  const totals = useMemo(() => {
    // S'assurer que filteredData est un tableau
    const safeData = Array.isArray(filteredData) ? filteredData : [];
    
    console.log('[Dashboard] Calcul des totaux pour', safeData.length, 'annonces');
    
    const total = safeData.length;
    
    // Compter les statuts avec validation stricte
    const statusCounts = {
      approved: 0,
      pending: 0,
      donated: 0,
      rejected: 0,
      cancelled: 0,
      other: 0
    };
    
    safeData.forEach((d) => {
      const status = (d.status || '').toLowerCase().trim();
      if (status === 'approuvée' || status === 'approved') {
        statusCounts.approved++;
      } else if (status === 'déclarée' || status === 'modifiée' || status === 'pending') {
        statusCounts.pending++;
      } else if (status === 'attribuée' || status === 'donné' || status === 'donated') {
        statusCounts.donated++;
      } else if (status === 'rejetée' || status === 'rejected') {
        statusCounts.rejected++;
      } else if (status === 'annulée' || status === 'cancelled') {
        statusCounts.cancelled++;
      } else {
        statusCounts.other++;
        console.warn('[Dashboard] Statut inconnu:', status, 'pour annonce', d.id);
      }
    });
    
    const approved = statusCounts.approved;
    const pending = statusCounts.pending;
    const donated = statusCounts.donated;
    const rejected = statusCounts.rejected;
    const cancelled = statusCounts.cancelled;
    
    console.log('[Dashboard] Statuts:', statusCounts);
    
    // Statistiques par catégorie - utiliser le mapping fiable
    const byCategory = safeData.reduce((acc, d) => {
      let catName = 'Non spécifiée';
      
      if (d.categorie) {
        // Essayer d'abord avec le mapping
        if (d.categorie.id && categoryMap.has(d.categorie.id)) {
          catName = categoryMap.get(d.categorie.id)!;
        } else {
          // Fallback: essayer plusieurs façons de récupérer le nom
          catName = d.categorie.nom 
            || d.categorie.name 
            || (d.categorie as any)?.nomCommune
            || (categories.find(c => c.id === d.categorie?.id)?.nom)
            || (categories.find(c => c.id === d.categorie?.id)?.name)
            || `Catégorie ${d.categorie.id || '?'}`;
        }
      } else if (d.categorie?.id) {
        // Si on a juste l'ID, utiliser le mapping
        catName = categoryMap.get(d.categorie.id) || `Catégorie ${d.categorie.id}`;
      }
      
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('[Dashboard] Par catégorie:', byCategory);
    
    // Statistiques par commune
    const byCommune = safeData.reduce((acc, d) => {
      const communeName = d.commune?.nomCommune || d.commune?.nom || 'Non spécifiée';
      acc[communeName] = (acc[communeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Total quantité avec validation
    const totalQuantity = safeData.reduce((sum, d) => {
      const qty = typeof d.quatite === 'number' ? d.quatite : (parseInt(String(d.quatite || 0), 10) || 0);
      return sum + qty;
    }, 0);
    
    // Statistiques par date (groupées par mois)
    const byMonth = safeData.reduce((acc, d) => {
      if (!d.date) return acc;
      try {
        const date = new Date(d.date);
        if (!isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        }
      } catch (e) {
        console.warn('[Dashboard] Date invalide:', d.date);
      }
      return acc;
    }, {} as Record<string, number>);
    
    const result = { 
      total, 
      approved, 
      pending, 
      donated, 
      rejected, 
      cancelled,
      byCategory, 
      byCommune,
      byMonth,
      totalQuantity 
    };
    
    console.log('[Dashboard] Totaux calculés:', result);
    
    return result;
  }, [filteredData, categories, categoryMap]);

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
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Annonces Validées" 
              value={totals.approved} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {totals.total > 0 && (
              <Progress 
                percent={Math.round((totals.approved / totals.total) * 100)} 
                size="small" 
                status="success"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            )}
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
            {totals.total > 0 && (
              <Progress 
                percent={Math.round((totals.pending / totals.total) * 100)} 
                size="small" 
                status="active"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Quantité" 
              value={totals.totalQuantity} 
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              {totals.total > 0 && `Moyenne: ${Math.round(totals.totalQuantity / totals.total)}`}
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Statistiques secondaires */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Attribuées/Données" 
              value={totals.donated} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Rejetées" 
              value={totals.rejected} 
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Annulées" 
              value={totals.cancelled} 
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Taux de Validation" 
              value={totals.total > 0 ? Math.round((totals.approved / totals.total) * 100) : 0}
              suffix="%"
              valueStyle={{ color: totals.total > 0 && (totals.approved / totals.total) >= 0.8 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Histogramme par catégorie - Recharts */}
      <Card title="Nombre d'annonces par Catégorie">
        {Object.entries(totals.byCategory).length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart 
              data={Object.entries(totals.byCategory)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: "Nombre d'annonces", angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} annonce${value > 1 ? 's' : ''}`, 'Quantité']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#52c41a" 
                name="Nombre d'annonces"
                radius={[8, 8, 0, 0]}
              >
                {Object.entries(totals.byCategory).map((_, index) => {
                  const colors = ['#52c41a', '#1890ff', '#722ed1', '#faad14', '#ff4d4f', '#13c2c2'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Aucune donnée disponible pour les catégories
          </div>
        )}
      </Card>

      {/* Histogramme par statut - Recharts */}
      <Card title="Répartition par Statut">
        {totals.total > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Approuvées', value: totals.approved },
                  { name: 'En attente', value: totals.pending },
                  { name: 'Attribuées/Données', value: totals.donated },
                  { name: 'Rejetées', value: totals.rejected },
                  { name: 'Annulées', value: totals.cancelled }
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(1)}%)` : ''
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Approuvées', value: totals.approved },
                  { name: 'En attente', value: totals.pending },
                  { name: 'Attribuées/Données', value: totals.donated },
                  { name: 'Rejetées', value: totals.rejected },
                  { name: 'Annulées', value: totals.cancelled }
                ].filter(item => item.value > 0).map((entry, index) => {
                  const colors = ['#52c41a', '#faad14', '#722ed1', '#ff4d4f', '#8c8c8c'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} annonce${value > 1 ? 's' : ''}`, name]}
                contentStyle={{ borderRadius: 8 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => {
                  const data = [
                    { name: 'Approuvées', value: totals.approved },
                    { name: 'En attente', value: totals.pending },
                    { name: 'Attribuées/Données', value: totals.donated },
                    { name: 'Rejetées', value: totals.rejected },
                    { name: 'Annulées', value: totals.cancelled }
                  ];
                  const item = data.find(d => d.name === value);
                  return item && item.value > 0 ? `${value} (${item.value})` : '';
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Aucune donnée disponible pour les statuts
          </div>
        )}
      </Card>

      {/* Graphique par commune (top 10) */}
      {Object.keys(totals.byCommune).length > 0 && (
        <Card title="Top 10 Communes par Nombre d'Annonces">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={Object.entries(totals.byCommune)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: "Nombre d'annonces", angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} annonce${value > 1 ? 's' : ''}`, 'Quantité']}
                contentStyle={{ borderRadius: 8 }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#1890ff" 
                name="Nombre d'annonces"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

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
      <Card title={`Liste des Annonces (${filteredData.length})`}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={Array.isArray(filteredData) ? filteredData : []}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true, 
            showTotal: (total) => `Total: ${total} annonce${total > 1 ? 's' : ''}` 
          }}
          columns={[
            { 
              title: 'Titre', 
              dataIndex: 'titre',
              render: (text) => text || 'Sans titre',
              ellipsis: true
            },
            { 
              title: 'Catégorie', 
              dataIndex: ['categorie', 'nom'],
              render: (nom, record) => {
                let catName = 'Non spécifiée';
                
                if (record.categorie) {
                  // Utiliser le mapping fiable
                  if (record.categorie.id && categoryMap.has(record.categorie.id)) {
                    catName = categoryMap.get(record.categorie.id)!;
                  } else {
                    // Fallback
                    catName = nom 
                      || record.categorie.name 
                      || record.categorie.nom
                      || (categories.find(c => c.id === record.categorie?.id)?.nom)
                      || (categories.find(c => c.id === record.categorie?.id)?.name)
                      || `Catégorie ${record.categorie.id || '?'}`;
                  }
                }
                
                return <Tag color="green">{catName}</Tag>;
              }
            },
            { 
              title: 'Quantité', 
              dataIndex: 'quatite',
              render: (qty) => <Text strong>{qty || 0}</Text>
            },
            { 
              title: 'Commune', 
              dataIndex: ['commune', 'nomCommune'],
              render: (nom) => nom || 'Non spécifiée'
            },
            { 
              title: 'Statut', 
              dataIndex: 'status',
              render: (status: string) => {
                const statusLabels: Record<string, { label: string; color: string }> = {
                  'approuvée': { label: '✅ Approuvée', color: 'green' },
                  'déclarée': { label: '⏳ En attente', color: 'orange' },
                  'modifiée': { label: '✏️ Modifiée', color: 'orange' },
                  'rejetée': { label: '❌ Rejetée', color: 'red' },
                  'annulée': { label: '🗑️ Annulée', color: 'default' },
                  'attribuée': { label: '💝 Attribuée', color: 'purple' }
                };
                const s = status || 'déclarée';
                const config = statusLabels[s] || { label: s, color: 'default' };
                return <Tag color={config.color}>{config.label}</Tag>;
              }
            },
            { 
              title: 'Date', 
              dataIndex: 'date',
              render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A',
              sorter: (a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateA - dateB;
              }
            }
          ]}
        />
      </Card>
    </div>
  );
}
