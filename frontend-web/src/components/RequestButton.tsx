import { Button, message, Tooltip } from 'antd';
import { HeartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { createDemande, hasRecentDemande } from '../services/demandeService';
import { useAuth } from '../context/AuthContext';
import type { Annonce } from '../types/api';

interface RequestButtonProps {
  annonce: Annonce;
  onSuccess?: () => void;
}

export default function RequestButton({ annonce, onSuccess }: RequestButtonProps) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasRecent, setHasRecent] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Vérifier si l'utilisateur a déjà fait une demande récente ET si c'est le donateur
  useEffect(() => {
    const checkRecentDemande = async () => {
      if (!isAuthenticated || !user?.id || !annonce?.id) {
        setChecking(false);
        return;
      }

      try {
        const userId = parseInt(user.id) || 0;
        if (userId === 0) {
          setChecking(false);
          return;
        }

        // IMPORTANT: Les admins ne peuvent pas faire de demandes d'intérêt
        // Selon le cahier des charges, l'admin a un rôle spécifique (validation des annonces)
        // et ne doit pas participer comme utilisateur normal
        if (isAdmin || user?.role === 'ADMIN') {
          setHasRecent(true); // Bloquer pour admin
          setChecking(false);
          return;
        }

        // Vérifier si l'utilisateur est le donateur de cette annonce
        const donnateurId = annonce.donnateur?.id || (annonce.donnateur as any)?.id || null;
        const isOwnerCheck = donnateurId !== null && (donnateurId === userId || donnateurId.toString() === user.id);
        setIsOwner(isOwnerCheck);

        // Si c'est le donateur, on bloque directement
        if (isOwnerCheck) {
          setHasRecent(true);
          setChecking(false);
          return;
        }

        // Sinon, vérifier si une demande récente existe
        const recent = await hasRecentDemande(annonce.id, userId);
        setHasRecent(recent);
      } catch (error: any) {
        console.error('[RequestButton] Erreur vérification:', error);
        // En cas d'erreur, bloquer par sécurité
        setHasRecent(true);
      } finally {
        setChecking(false);
      }
    };

    checkRecentDemande();
  }, [isAuthenticated, user?.id, annonce?.id, annonce?.donnateur]);

  const handleRequest = async () => {
    if (!isAuthenticated) {
      message.warning('Vous devez être connecté pour faire une demande');
      return;
    }

    const userId = user.id ? parseInt(user.id) : 0;
    if (userId === 0) {
      message.error('Erreur: utilisateur non identifié');
      return;
    }

    if (isOwner) {
      message.warning('Vous ne pouvez pas faire de demande sur votre propre annonce');
      return;
    }

    if (hasRecent) {
      message.warning('Vous avez déjà fait une demande pour cette annonce dans les 30 derniers jours');
      return;
    }

    try {
      setLoading(true);
      await createDemande(annonce.id, userId);
      message.success('Votre demande a été envoyée avec succès !');
      setHasRecent(true); // Bloquer après succès
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('[RequestButton] Erreur création demande:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Erreur lors de l\'envoi de la demande';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Tooltip title="Connectez-vous pour faire une demande">
        <Button 
          icon={<HeartOutlined />} 
          disabled
          size="small"
        >
          Faire une demande
        </Button>
      </Tooltip>
    );
  }

  if (checking) {
    return (
      <Button 
        icon={<HeartOutlined />} 
        loading
        size="small"
      >
        Vérification...
      </Button>
    );
  }

  // Blocage pour admin
  if (isAdmin || user?.role === 'ADMIN') {
    return (
      <Tooltip title="Les administrateurs ne peuvent pas faire de demandes. Ils gèrent les annonces via le panel admin.">
        <Button 
          icon={<ClockCircleOutlined />} 
          disabled
          size="small"
          style={{ cursor: 'not-allowed' }}
        >
          Admin
        </Button>
      </Tooltip>
    );
  }

  if (isOwner) {
    return (
      <Tooltip title="Vous ne pouvez pas faire de demande sur votre propre annonce">
        <Button 
          icon={<ClockCircleOutlined />} 
          disabled
          size="small"
          style={{ cursor: 'not-allowed' }}
        >
          Votre annonce
        </Button>
      </Tooltip>
    );
  }

  if (hasRecent) {
    return (
      <Tooltip title="Vous avez déjà fait une demande pour cette annonce dans les 30 derniers jours">
        <Button 
          icon={<ClockCircleOutlined />} 
          disabled
          size="small"
          style={{ cursor: 'not-allowed' }}
        >
          Déjà demandé
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button 
      type="primary"
      icon={<HeartOutlined />} 
      onClick={handleRequest}
      loading={loading}
      size="small"
    >
      Faire une demande
    </Button>
  );
}

