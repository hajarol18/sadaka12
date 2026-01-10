import { Button, Card, Form, Input, Modal, Space, Table, Tabs, Tag, message, Typography } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { exportAllDataAsJSON, importDataFromJSON } from '../utils/mock';
import { getAnnoncesEnCours, approveAnnonce, rejectAnnonce, getAllAnnonces } from '../services/annonceService';
import { getUtilisateurs } from '../services/utilisateurService';
import type { Annonce, Utilisateur } from '../types/api';

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
      setAllAnnonces(all);
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
        setAllAnnonces(Array.from(byId.values()));
      } catch {
        message.error('Erreur lors du chargement des annonces');
        setAllAnnonces([]);
      }
    } finally {
      setAllAnnoncesLoading(false);
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

  useEffect(() => {
    loadRoles();
    loadPending();
    loadAllAnnonces();
    loadUsers();
    loadNewsletter();
  }, []);

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

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Administration - Gestion de la Plateforme</Typography.Title>
      <Tabs
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
                      render: (text: string) => text || 'Sans titre'
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
                  dataSource={Array.isArray(allAnnonces) ? allAnnonces : []}
                  columns={[
                    { 
                      title: 'Titre',
                      dataIndex: 'titre',
                      render: (text: string) => text || 'Sans titre'
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
                      render: (_, record: Annonce) => (
                        isPendingStatus(record.status) ? (
                          <Space>
                            <Button type="primary" size="small" onClick={() => approve(record.id)}>Valider</Button>
                            <Button danger size="small" onClick={() => openRejectModal(record.id)}>Rejeter</Button>
                          </Space>
                        ) : (
                          <Typography.Text type="secondary">Aucune</Typography.Text>
                        )
                      )
                    }
                  ]}
                />
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
