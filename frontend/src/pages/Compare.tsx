import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { removeDevice, clearDevices, toggleHighlightDiffs } from '../store/comparisonSlice';
import { ComparisonMatrix } from '../components/ComparisonMatrix/ComparisonMatrix';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { getDevice } from '../api/client';
import type { Device } from '../types/device';
import { addDevice } from '../store/comparisonSlice';
import './Compare.css';

export const Compare: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { devices, highlightDiffs } = useAppSelector(s => s.comparison);
  const [params] = useSearchParams();

  // Bootstrap from URL query ?devices=id1,id2
  useEffect(() => {
    const ids = params.get('devices')?.split(',').filter(Boolean) || [];
    if (ids.length === 0 || devices.length > 0) return;
    Promise.all(ids.map(id => getDevice(id).catch(() => null))).then(results => {
      results.filter(Boolean).forEach(d => dispatch(addDevice(d as Device)));
    });
  }, []);

  if (devices.length === 0) return (
    <div className="compare-empty container">
      <div className="compare-empty-inner">
        <div className="compare-empty-icon">⇄</div>
        <h1>No Devices to Compare</h1>
        <p>Search for devices and click "Add to Compare" to start a side-by-side comparison.</p>
        <SearchBar />
        <button className="btn-secondary" onClick={() => navigate('/')}>← Browse Devices</button>
      </div>
    </div>
  );

  return (
    <div className="compare container">
      <div className="compare-header">
        <div>
          <h1 className="compare-title">Side-by-Side Comparison</h1>
          <p className="compare-sub">Comparing {devices.length} device{devices.length > 1 ? 's' : ''}</p>
        </div>
        <div className="compare-controls">
          <button
            className={`btn-secondary compare-diff-btn ${highlightDiffs ? 'active' : ''}`}
            onClick={() => dispatch(toggleHighlightDiffs())}
          >
            {highlightDiffs ? '✓ Differences Highlighted' : '⊕ Highlight Differences'}
          </button>
          <button className="btn-ghost" onClick={() => dispatch(clearDevices())}>Clear All</button>
        </div>
      </div>

      {/* Device chips */}
      <div className="compare-chips">
        {devices.map(d => (
          <div key={d.id} className="compare-chip glass-card">
            <img src={d.thumbnailUrl} alt={d.name}
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/1e293b/94a3b8?text=?'; }} />
            <span className="compare-chip-name">{d.name}</span>
            <button className="compare-chip-remove" onClick={() => dispatch(removeDevice(d.id))} aria-label={`Remove ${d.name}`}>✕</button>
          </div>
        ))}
        {devices.length < 4 && (
          <div className="compare-add-wrap">
            <SearchBar />
            <p className="compare-add-hint">Add up to {4 - devices.length} more device{4 - devices.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {devices.length >= 2 ? (
        <ComparisonMatrix devices={devices} highlightDiffs={highlightDiffs} />
      ) : (
        <div className="compare-need-more glass-card">
          <p>Add at least one more device to start comparing.</p>
        </div>
      )}
    </div>
  );
};
