import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchResult } from '../../types/device';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addDevice } from '../../store/comparisonSlice';
import { getDevice } from '../../api/client';
import './ProductCard.css';

const CATEGORY_ICONS: Record<string, string> = {
  MOBILE: '📱', LAPTOP: '💻', TABLET: '📟', AUDIO: '🎧', WATCH: '⌚',
};

export const ProductCard: React.FC<{ device: SearchResult; featured?: boolean }> = ({ device, featured }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const compared = useAppSelector(s => s.comparison.devices);
  const isInCompare = compared.some(d => d.id === device.id);
  const isFull = compared.length >= 4;

  const handleAddCompare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCompare || isFull) return;
    try {
      const full = await getDevice(device.id);
      dispatch(addDevice(full));
    } catch {}
  };

  return (
    <div className={`product-card glass-card ${featured ? 'featured' : ''}`} onClick={() => navigate(`/device/${device.id}`)}>
      <div className="product-card-img-wrap">
        <img src={device.thumbnailUrl} alt={device.name}
          onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/1e293b/94a3b8?text=?'; }} />
        <span className="product-card-category badge badge-muted">
          {CATEGORY_ICONS[device.category]} {device.category}
        </span>
      </div>
      <div className="product-card-body">
        <p className="product-card-brand">{device.brand}</p>
        <h3 className="product-card-name">{device.name}</h3>
        <p className="product-card-year">{new Date(device.releaseDate).getFullYear()}</p>
        <div className="product-card-footer">
          {device.lowestInr ? (
            <span className="product-card-price">from ₹{device.lowestInr.toLocaleString('en-IN')}</span>
          ) : (
            <span className="product-card-price-none">Price N/A</span>
          )}
          <button
            className={`btn-secondary product-card-compare ${isInCompare ? 'active' : ''} ${isFull && !isInCompare ? 'disabled' : ''}`}
            onClick={handleAddCompare}
            disabled={isFull && !isInCompare}
            title={isFull && !isInCompare ? 'Max 4 devices' : isInCompare ? 'Added to compare' : 'Add to compare'}
          >
            {isInCompare ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};
