import React from 'react';
import type { PriceEntry } from '../../types/device';
import './PriceTable.css';

const VENDOR_LOGOS: Record<string, string> = {
  AMAZON: '📦', BEST_BUY: '🛒', WALMART: '🏪', FLIPKART: '🛍️', RELIANCE_DIGITAL: '🏢',
};

interface Props { prices: PriceEntry[]; }

export const PriceTable: React.FC<Props> = ({ prices }) => {
  const sorted = [...prices].sort((a, b) => a.priceInr - b.priceInr);
  if (!sorted.length) return <p className="price-table-empty">No pricing data available.</p>;

  return (
    <div className="price-table">
      {sorted.map((p, i) => {
        const freshness = new Date(p.scrapedAt);
        const hoursAgo = Math.floor((Date.now() - freshness.getTime()) / 3600000);
        return (
          <div key={p.id} className={`price-row ${i === 0 ? 'best' : ''}`}>
            <div className="price-row-vendor">
              <span className="price-vendor-logo">{VENDOR_LOGOS[p.vendor] || '🛒'}</span>
              <div>
                <span className={`vendor-badge ${p.vendor.toLowerCase().replace('_', '-')}`}>
                  {p.vendor.replace('_', ' ')}
                </span>
                {i === 0 && <span className="badge badge-success" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Best Price</span>}
              </div>
            </div>
            <div className="price-row-right">
              <span className={`price-row-status ${p.inStock ? 'in-stock' : 'out-stock'}`}>
                {p.inStock ? '● In Stock' : '○ Out of Stock'}
              </span>
              <span className="price-freshness">Updated {hoursAgo < 1 ? 'just now' : `${hoursAgo}h ago`}</span>
              <span className="price-amount">₹{p.priceInr.toLocaleString('en-IN')}</span>
              <a href={p.affiliateUrl} target="_blank" rel="noopener noreferrer" className="btn-primary price-buy-btn" onClick={e => e.stopPropagation()}>
                Buy →
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
