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
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasRecent, setHasRecent] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier si l'utilisateur a déjà fait une demande récente
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
  }, [isAuthenticated, user?.id, annonce?.id]);

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
      message.error(error?.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
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

