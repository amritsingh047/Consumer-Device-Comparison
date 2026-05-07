import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import './Navbar.css';

const CATEGORIES = ['Mobiles', 'Laptops', 'Audio', 'Tablets', 'Watches'];
const CAT_MAP: Record<string, string> = {
  Mobiles: 'MOBILE', Laptops: 'LAPTOP', Audio: 'AUDIO', Tablets: 'TABLET', Watches: 'WATCH',
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const compareCount = useAppSelector(s => s.comparison.devices.length);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container navbar-inner">
        <button className="navbar-logo" onClick={() => navigate('/')} aria-label="TechCompare home">
          <span className="navbar-logo-icon">⚡</span>
          <span className="navbar-logo-text">TechCompare</span>
        </button>
        <ul className="navbar-links" role="list">
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <button
                className={`navbar-link ${location.search.includes(CAT_MAP[cat]) ? 'active' : ''}`}
                onClick={() => navigate(`/?category=${CAT_MAP[cat]}`)}
              >{cat}</button>
            </li>
          ))}
        </ul>
        <div className="navbar-actions">
          <button className="navbar-link" onClick={() => navigate('/ai-finder')}>💡 AI Finder</button>
          <button
            className={`navbar-compare-btn ${compareCount > 0 ? 'has-items' : ''}`}
            onClick={() => compareCount > 0 && navigate('/compare')}
            aria-label={`Compare ${compareCount} devices`}
          >
            <span>⇄ Compare</span>
            {compareCount > 0 && <span className="navbar-compare-badge">{compareCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};
