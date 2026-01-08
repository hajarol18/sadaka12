import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Page introuvable</h2>
      <p>La page demandée n'existe pas.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
}
