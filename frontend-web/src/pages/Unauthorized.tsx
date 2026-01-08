import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Non autorisé"
      subTitle="Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      }
    />
  );
};

export default Unauthorized;