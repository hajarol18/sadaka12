import { Button, Card, Form, Input, Modal, Space, Table, Tabs, Tag, message, Typography } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { exportAllDataAsJSON, importDataFromJSON } from '../utils/mock';

type Role = { id: string; name: string; description?: string };
type PendingDonation = { 
  id: string; 
  title?: string;
  category: string; 
  quantity: number; 
  commune: string; 
  createdAt: string;
  description?: string;
};
type User = { id: string; firstName: string; lastName: string; email: string; role: string; phone?: string };
type NewsletterSubscriber = { id: string; email: string; subscribedAt: string };

export default function Admin() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const [pending, setPending] = useState<PendingDonation[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(null);
  
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
      .then((res) => setRoles(res.data as Role[]))
      .finally(() => setRolesLoading(false));
  };

  const loadPending = () => {
    setPendingLoading(true);
    api
      .get('/donations', { params: { status: 'PENDING' } })
      .then((res) => setPending(res.data as PendingDonation[]))
      .finally(() => setPendingLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    // Mock: Simuler la récupération des utilisateurs
    api
      .get('/users')
      .then((res) => setUsers(res.data as User[]))
      .catch(() => {
        // Si l'endpoint n'existe pas, utiliser des données mock
        setUsers([
          { id: '1', firstName: 'Ahmed', lastName: 'Alaoui', email: 'admin@sadaka.ma', role: 'ADMIN', phone: '0612345678' },
          { id: '2', firstName: 'Fatima', lastName: 'Benali', email: 'moderator@sadaka.ma', role: 'MODERATOR', phone: '0612345679' },
          { id: '3', firstName: 'Mohamed', lastName: 'Idrissi', email: 'user@sadaka.ma', role: 'USER', phone: '0612345680' }
        ]);
      })
      .finally(() => setUsersLoading(false));
  };

  const loadNewsletter = () => {
    setNewsletterLoading(true);
    // Mock: Simuler la récupération des abonnés newsletter
    api
      .get('/newsletter/subscribers')
      .then((res) => setNewsletterSubscribers(res.data as NewsletterSubscriber[]))
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

  const approve = async (id: string) => {
    try {
      await api.post(`/donations/${id}/approve`);
      message.success('Annonce validée');
      loadPending();
    } catch {
      message.error('Erreur de validation');
    }
  };
  const openRejectModal = (id: string) => {
    setSelectedDonationId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const reject = async () => {
    if (!selectedDonationId) return;
    try {
      await api.post(`/donations/${selectedDonationId}/reject`, { reason: rejectReason || 'Non conforme' });
      message.success('Annonce rejetée avec motif');
      setRejectModalOpen(false);
      setSelectedDonationId(null);
      loadPending();
    } catch {
      message.error('Erreur du rejet');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      message.success('Utilisateur supprimé');
      loadUsers();
    } catch {
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
                  dataSource={roles}
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
                  dataSource={pending}
                  columns={[
                    { 
                      title: 'Titre', 
                      dataIndex: 'title',
                      render: (text) => text || 'Sans titre'
                    },
                    { 
                      title: 'Catégorie', 
                      dataIndex: 'category',
                      render: (cat: string) => {
                        const labels: Record<string, string> = {
                          FOOD: 'Nourriture',
                          CLOTHES: 'Vêtements',
                          MEDICINE: 'Médicaments',
                          OTHER: 'Autres'
                        };
                        return labels[cat] || cat;
                      }
                    },
                    { title: 'Quantité', dataIndex: 'quantity' },
                    { title: 'Commune', dataIndex: 'commune' },
                    { 
                      title: 'Date', 
                      dataIndex: 'createdAt',
                      render: (date: string) => new Date(date).toLocaleDateString('fr-FR')
                    },
                    {
                      title: 'Actions',
                      render: (_, r: PendingDonation) => (
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
            key: 'users',
            label: 'Gestion des utilisateurs',
            children: (
              <Card title="Liste des utilisateurs">
                <Table
                  rowKey="id"
                  loading={usersLoading}
                  dataSource={users}
                  columns={[
                    { title: 'Nom', dataIndex: 'lastName' },
                    { title: 'Prénom', dataIndex: 'firstName' },
                    { title: 'Email', dataIndex: 'email' },
                    { title: 'Téléphone', dataIndex: 'phone' },
                    { 
                      title: 'Rôle', 
                      dataIndex: 'role',
                      render: (role: string) => (
                        <Tag color={role === 'ADMIN' ? 'red' : role === 'MODERATOR' ? 'orange' : 'green'}>
                          {role}
                        </Tag>
                      )
                    },
                    {
                      title: 'Actions',
                      render: (_, user: User) => (
                        <Button 
                          danger 
                          size="small" 
                          onClick={() => deleteUser(user.id)}
                          disabled={user.role === 'ADMIN'}
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
                  dataSource={newsletterSubscribers}
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
