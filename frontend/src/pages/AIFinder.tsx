import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIFinder.css';

interface Recommendation {
  name: string;
  reason: string;
  score: number;
  matchingId: string | null;
}

export const AIFinder: React.FC = () => {
  const [budget, setBudget] = useState(50000);
  const [priority, setPriority] = useState<'gaming' | 'camera' | 'battery' | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Recommendation[]>([]);
  const navigate = useNavigate();

  const handleFind = async () => {
    setLoading(true);
    setResults([]);
    setError(null);
    try {
      const res = await fetch('/api/ai/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, priority }),
      });
      if (!res.ok) throw new Error('AI Consultant is currently busy. Please try again.');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No specific recommendations found for this budget. Try adjusting the range.');
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-finder container">
      <div className="ai-finder-hero">
        <div className="badge badge-accent">💡 Smart AI Strategy</div>
        <h1>Find Your Perfect Device</h1>
        <p>Our AI analyzes the Indian market and your needs to recommend the best options.</p>
      </div>

      <div className="ai-finder-form glass-card">
        <div className="form-group">
          <label>Your Budget (INR)</label>
          <input 
            type="range" min="10000" max="250000" step="5000" 
            value={budget} 
            onChange={e => setBudget(Number(e.target.value))} 
          />
          <div className="budget-value">₹{budget.toLocaleString('en-IN')}</div>
        </div>

        <div className="form-group">
          <label>Primary Need</label>
          <div className="priority-grid">
            {(['all', 'gaming', 'camera', 'battery'] as const).map(p => (
              <button 
                key={p} 
                className={`priority-btn ${priority === p ? 'active' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary find-btn" onClick={handleFind} disabled={loading}>
          {loading ? 'Consulting AI Expert...' : '🔍 Find Best Devices'}
        </button>

        {error && <div className="ai-finder-error">{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="ai-results">
          <h2 className="section-title">AI Recommendations</h2>
          <div className="results-grid">
            {results.map((r, i) => (
              <div key={i} className="recommendation-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="rec-score">Score: {r.score}/10</div>
                <h3>{r.name}</h3>
                <p>{r.reason}</p>
                {r.matchingId ? (
                  <button className="btn-secondary" onClick={() => navigate(`/device/${r.matchingId}`)}>View Specs →</button>
                ) : (
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(r.name + ' price')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">Search Price →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
