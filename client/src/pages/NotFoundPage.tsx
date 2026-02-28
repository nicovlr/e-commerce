import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
      <h1>404</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '1.125rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
