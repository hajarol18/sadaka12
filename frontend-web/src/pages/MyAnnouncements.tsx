import { Card, Table, Tag, Button, Empty, Typography, Space, Modal, InputNumber, Descriptions, message, Divider, Popconfirm, Select, Badge } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnnoncesByUser } from '../services/annonceService';
import { getDemandesByAnnonce } from '../services/demandeService';
import { Link } from 'react-router-dom';
import { PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, CheckOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Annonce } from '../types/api';

const { Title, Text } = Typography;

// Utiliser le type Annonce du backend
type MyAnn = Annonce & {
  donatedQuantity?: number;
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
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<InterestRequest | null>(null);
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

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

  // Charger les annonces de l'utilisateur connecté
  useEffect(() => {
    loadData();
  }, [isAuthenticated, user?.id]);

  // Recharger quand on arrive sur la page (pour capturer les nouvelles annonces)
  useEffect(() => {
    // Recharger après un court délai pour s'assurer que la navigation est terminée
    const timer = setTimeout(() => {
      if (isAuthenticated && user?.id) {
        loadData();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Filtrer les annonces par statut
  const filteredData = useMemo(() => {
    if (!statusFilter) {
      return data;
    }
    return data.filter(ann => ann.status === statusFilter);
  }, [data, statusFilter]);

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
    } catch (e: any) {
      console.error('[MyAnnouncements] Erreur chargement demandes:', e);
      message.error('Erreur lors du chargement des demandes');
      setInterests([]);
    } finally {
      setInterestsLoading(false);
    }
  };

  const handleViewInterests = (announcement: MyAnn) => {
    setSelectedAnnouncement(announcement);
    const announcementId = typeof announcement.id === 'number' ? announcement.id : parseInt(announcement.id) || 0;
    if (announcementId > 0) {
      loadInterests(announcementId);
    }
  };

  const handleAssign = async () => {
    if (!selectedAnnouncement || !selectedInterest) return;
    
    const available = (selectedAnnouncement.quatite || 0) - (selectedAnnouncement.donatedQuantity || 0);
    if (assignQuantity > available) {
      message.error('Quantité demandée supérieure à la quantité disponible');
      return;
    }

    try {
      // Utiliser le service demandeService pour assigner
      const announcementId = typeof selectedAnnouncement.id === 'number' ? selectedAnnouncement.id : parseInt(selectedAnnouncement.id) || 0;
      const interestId = selectedInterest.id;
      
      // Note: Le backend n'a pas encore d'endpoint pour assigner une quantité
      // Pour l'instant, on affiche juste un message
      message.success(`Quantité de ${assignQuantity} sera assignée (fonctionnalité en cours de développement)`);
      setAssignModalOpen(false);
      setSelectedInterest(null);
      
      // Recharger les données
      if (user?.id) {
        const userId = parseInt(user.id) || 0;
        if (userId > 0) {
          try {
            const annonces = await getAnnoncesByUser(userId);
            const annoncesArray = Array.isArray(annonces) ? annonces : [];
            setData(annoncesArray);
            loadInterests(announcementId);
          } catch (e) {
            console.error('[MyAnnouncements] Erreur rechargement:', e);
          }
        }
      }
    } catch (e: any) {
      console.error('[MyAnnouncements] Erreur assignation:', e);
      message.error(e?.message || 'Erreur lors de l\'assignation');
    }
  };

  const handleDeleteInterest = async (interestId: string) => {
    try {
      const demandeId = parseInt(interestId) || 0;
      if (demandeId === 0) {
        message.error('ID de demande invalide');
        return;
      }
      
      const { deleteDemande } = await import('../services/demandeService');
      await deleteDemande(demandeId);
      message.success('Demande supprimée');
      
      if (selectedAnnouncement) {
        const announcementId = typeof selectedAnnouncement.id === 'number' ? selectedAnnouncement.id : parseInt(selectedAnnouncement.id) || 0;
        if (announcementId > 0) {
          loadInterests(announcementId);
        }
      }
    } catch (e: any) {
      console.error('[MyAnnouncements] Erreur suppression:', e);
      message.error(e?.message || 'Erreur lors de la suppression');
    }
  };

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
      'rejetée': '❌ Refusée',
      'annulée': 'Annulée',
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
                { label: `Refusées (${statusStats['rejetée']})`, value: 'rejetée' },
                { label: `Annulées (${statusStats['annulée']})`, value: 'annulée' }
              ]}
            />
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
                <Text><CloseCircleOutlined /> Refusées: {statusStats['rejetée']}</Text>
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
                render: (text) => text || 'Sans titre'
              },
              { 
                title: 'Catégorie', 
                dataIndex: ['categorie', 'nom'],
                render: (nom: string) => nom ? <Tag color="green">{nom}</Tag> : '-'
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
                title: 'Quantité disponible', 
                render: (_, record: MyAnn) => {
                  const available = (record.quatite || 0) - (record.donatedQuantity || 0);
                  return (
                    <div>
                      <Text strong>{available}</Text>
                      {record.donatedQuantity && record.donatedQuantity > 0 && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          ({record.donatedQuantity} donné{record.donatedQuantity > 1 ? 's' : ''})
                        </Text>
                      )}
                    </div>
                  );
                }
              },
              { 
                title: 'Statut', 
                dataIndex: 'status',
                width: 200,
                render: (v: string) => {
                  const status = v || 'déclarée';
                  const icon = status === 'approuvée' ? <CheckCircleOutlined /> 
                    : status === 'rejetée' ? <CloseCircleOutlined />
                    : <ClockCircleOutlined />;
                  
                  return (
                    <Tag 
                      color={getStatusColor(status)} 
                      icon={icon}
                      style={{ fontSize: 13, padding: '4px 8px' }}
                    >
                      {getStatusLabel(status)}
                    </Tag>
                  );
                },
                filters: [
                  { text: 'En attente', value: 'déclarée' },
                  { text: 'Approuvée', value: 'approuvée' },
                  { text: 'Refusée', value: 'rejetée' },
                  { text: 'Annulée', value: 'annulée' }
                ],
                onFilter: (value, record) => record.status === value
              },
              {
                title: 'Actions',
                render: (_, record: MyAnn) => (
                  <Space>
                    <Button 
                      size="small" 
                      type="primary"
                      onClick={() => handleViewInterests(record)}
                    >
                      Voir demandeurs
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
                {(selectedAnnouncement.quatite || 0) - (selectedAnnouncement.donatedQuantity || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Quantité donnée">{selectedAnnouncement.donatedQuantity || 0}</Descriptions.Item>
              <Descriptions.Item label="Catégorie">
                <Tag color="green">{selectedAnnouncement.categorie?.nom || 'Non spécifiée'}</Tag>
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
                    const available = (selectedAnnouncement.quatite || 0) - (selectedAnnouncement.donatedQuantity || 0);
                    return (
                      <Space>
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => {
                            setSelectedInterest(interest);
                            setAssignQuantity(interest.requestedQuantity || available);
                            setAssignModalOpen(true);
                          }}
                          disabled={available <= 0 || interest.status === 'APPROVED'}
                        >
                          Assigner
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => handleDeleteInterest(interest.id)}
                        >
                          Supprimer
                        </Button>
                      </Space>
                    );
                  }
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal pour assigner une quantité */}
      <Modal
        title="Assigner une quantité"
        open={assignModalOpen}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedInterest(null);
        }}
      >
        {selectedInterest && selectedAnnouncement && (
          <div>
            <p><strong>Demandeur:</strong> {selectedInterest.userName}</p>
            <p><strong>Email:</strong> {selectedInterest.userEmail}</p>
            {selectedInterest.userPhone && <p><strong>Téléphone:</strong> {selectedInterest.userPhone}</p>}
            <Divider />
            <p><strong>Quantité disponible:</strong> {(selectedAnnouncement.quatite || 0) - (selectedAnnouncement.donatedQuantity || 0)}</p>
            <p><strong>Quantité à assigner:</strong></p>
            <InputNumber
              min={1}
              max={(selectedAnnouncement.quatite || 0) - (selectedAnnouncement.donatedQuantity || 0)}
              value={assignQuantity}
              onChange={(val) => setAssignQuantity(val || 1)}
              style={{ width: '100%' }}
            />
            <p style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              Après assignation, la quantité sera décomptée de votre annonce.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}


