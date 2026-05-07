import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevice } from '../api/client';
import type { Device } from '../types/device';
import { SpecAccordion } from '../components/SpecAccordion/SpecAccordion';
import { PriceTable } from '../components/PriceTable/PriceTable';
import { VideoEmbed } from '../components/VideoEmbed/VideoEmbed';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addDevice, removeDevice } from '../store/comparisonSlice';
import './ProductDetail.css';

const CATEGORY_ICONS: Record<string, string> = {
  MOBILE: '📱', LAPTOP: '💻', TABLET: '📟', AUDIO: '🎧', WATCH: '⌚',
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const compared = useAppSelector(s => s.comparison.devices);
  const isInCompare = compared.some(d => d.id === id);
  const isFull = compared.length >= 4;

  const [device, setDevice] = useState<Device | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    getDevice(id)
      .then(setDevice)
      .catch(() => setError('Device not found. It may not be in our database yet.'))
      .finally(() => setLoading(false));

    // Fetch live reviews
    fetch(`/api/devices/${id}/reviews`)
      .then(r => r.json())
      .then(setReviews)
      .catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="pdp-loading container">
      <div className="skeleton pdp-skeleton-hero" />
      <div style={{ display: 'flex', gap: 24 }}>
        <div className="skeleton" style={{ flex: 1, height: 400, borderRadius: 12 }} />
        <div className="skeleton" style={{ flex: 1, height: 400, borderRadius: 12 }} />
      </div>
    </div>
  );

  if (error || !device) return (
    <div className="pdp-error container">
      <h2>😞 {error || 'Something went wrong'}</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );

  const handleCompare = () => {
    if (isInCompare) { dispatch(removeDevice(device.id)); }
    else if (!isFull) { dispatch(addDevice(device)); }
  };

  const lowestInr = device.prices.length ? Math.min(...device.prices.map(p => p.priceInr)) : null;

  return (
    <div className="pdp">
      {/* Sticky header */}
      <div className="pdp-sticky-header">
        <div className="container pdp-sticky-inner">
          <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
          <span className="pdp-sticky-name">{device.name}</span>
          {lowestInr && <span className="pdp-sticky-price">from ₹{lowestInr.toLocaleString('en-IN')}</span>}
          <button
            className={`btn-primary ${isInCompare ? 'pdp-compare-active' : ''} ${isFull && !isInCompare ? 'pdp-compare-disabled' : ''}`}
            onClick={handleCompare}
            disabled={isFull && !isInCompare}
          >
            {isInCompare ? '✓ In Compare' : '⇄ Add to Compare'}
          </button>
          {isInCompare && compared.length >= 2 && (
            <button className="btn-secondary" onClick={() => navigate('/compare')}>View Compare →</button>
          )}
        </div>
      </div>

      <div className="container pdp-body">
        {/* Hero section */}
        <div className="pdp-hero">
          <div className="pdp-image-col">
            <div className="pdp-image-wrap">
              <img src={device.imageUrl} alt={device.name}
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/94a3b8?text=' + encodeURIComponent(device.name); }} />
            </div>
          </div>
          <div className="pdp-info-col">
            <div className="pdp-badges">
              <span className="badge badge-accent">{CATEGORY_ICONS[device.category]} {device.category}</span>
              <span className="badge badge-muted">{new Date(device.releaseDate).getFullYear()}</span>
            </div>
            <p className="pdp-brand">{device.brand}</p>
            <h1 className="pdp-name">{device.name}</h1>
            <p className="pdp-tagline">{device.tagline}</p>

            {lowestInr && (
              <div className="pdp-price-hero">
                <span className="pdp-price-label">Starting from</span>
                <span className="pdp-price-amount">₹{lowestInr.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="pdp-cta-row">
              <button
                className={`btn-primary pdp-compare-btn ${isInCompare ? 'pdp-compare-active' : ''}`}
                onClick={handleCompare}
                disabled={isFull && !isInCompare}
              >
                {isInCompare ? '✓ Added to Compare' : '⇄ Add to Compare'}
              </button>
              {isInCompare && compared.length >= 2 && (
                <button className="btn-secondary" onClick={() => navigate('/compare')}>View Matrix →</button>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="pdp-content-grid">
          <div className="pdp-left">
            <section className="pdp-section">
              <h2 className="pdp-section-title">Specifications</h2>
              <SpecAccordion specs={device.specs} />
            </section>
          </div>
          <div className="pdp-right">
            {device.prices.length > 0 && (
              <section className="pdp-section">
                <h2 className="pdp-section-title">Where to Buy</h2>
                <PriceTable prices={device.prices} />
              </section>
            )}
            {reviews.length > 0 && (
              <section className="pdp-section">
                <h2 className="pdp-section-title">Video Reviews (Live)</h2>
                {reviews.map(v => (
                  <VideoEmbed key={v.id} youtubeVideoId={v.id} reviewTitle={v.title} channelName={v.channelName} />
                ))}
              </section>
            )}
            {device.videos.length > 0 && reviews.length === 0 && (
              <section className="pdp-section">
                <h2 className="pdp-section-title">Video Reviews</h2>
                {device.videos.map(v => (
                  <VideoEmbed key={v.id} youtubeVideoId={v.id} reviewTitle={v.title} channelName={v.channelName} />
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
