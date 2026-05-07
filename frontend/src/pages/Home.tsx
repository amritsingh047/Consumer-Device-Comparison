import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar/SearchBar';

import './Home.css';

const TRENDING_PAIRS = [
  { a: 'iphone-15-pro', b: 'samsung-galaxy-s24-ultra', label: 'iPhone 15 Pro vs Galaxy S24 Ultra' },
  { a: 'macbook-pro-m3', b: 'dell-xps-15', label: 'MacBook Pro M3 vs Dell XPS 15' },
  { a: 'sony-wh1000xm5', b: 'bose-qc45', label: 'Sony XM5 vs Bose QC45' },
  { a: 'google-pixel-8-pro', b: 'oneplus-12', label: 'Pixel 8 Pro vs OnePlus 12' },
];

const CATEGORIES = [
  { label: 'All', value: '' }, { label: '📱 Mobiles', value: 'MOBILE' },
  { label: '💻 Laptops', value: 'LAPTOP' }, { label: '🎧 Audio', value: 'AUDIO' },
  { label: '📟 Tablets', value: 'TABLET' }, { label: '⌚ Watches', value: 'WATCH' },
];

import { FallingPattern } from '../components/FallingPattern/FallingPattern';

export const Home: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCat = params.get('category') || '';

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden="true">
          <FallingPattern 
            color="rgba(59, 130, 246, 0.4)" 
            blurIntensity="2px" 
            duration={100} 
            className="opacity-40"
          />
        </div>
        <div className="container home-hero-content">
          <div className="home-hero-badge badge badge-accent">🚀 2026 Device Database</div>
          <h1 className="home-hero-title">
            Compare Every<br />
            <span className="home-hero-gradient">Consumer Device</span>
          </h1>
          <p className="home-hero-sub">
            Side-by-side specs, real-time prices & expert reviews.<br />Make smarter buying decisions in seconds.
          </p>
          <SearchBar autoFocus />
          <p className="home-hero-hint">Try "iPhone 15 Pro" or paste an Amazon URL</p>
        </div>
      </section>

      {/* AI Finder CTA */}
      <section className="home-ai-cta container">
        <div className="glass-card ai-cta-card animate-fade-in">
          <div className="ai-cta-content">
            <div className="badge badge-accent">NEW FEATURE</div>
            <h2>Confused? Let our AI decide for you.</h2>
            <p>Tell us your budget and what you care about most. Our Smart AI Phone Finder will scan the market to find your 100% perfect match.</p>
            <button className="btn-primary" onClick={() => navigate('/ai-finder')}>💡 Try AI Phone Finder</button>
          </div>
          <div className="ai-cta-icon" aria-hidden="true">🤖</div>
        </div>
      </section>

      {/* Trending */}
      <section className="home-trending container">
        <h2 className="home-section-title">🔥 Trending Comparisons</h2>
        <div className="home-trending-grid">
          {TRENDING_PAIRS.map(pair => (
            <a key={pair.label} href={`/compare?devices=${pair.a},${pair.b}`} className="trending-card glass-card">
              <span className="trending-vs">VS</span>
              <span className="trending-label">{pair.label}</span>
              <span className="trending-arrow">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* Niche Collections */}
      <section className="home-niche container">
        <h2 className="home-section-title">💡 Smart Strategy Collections</h2>
        <div className="home-niche-grid">
          <div className="niche-card glass-card" onClick={() => setParams({ category: 'MOBILE', maxPrice: '15000' })}>
            <h3>📱 Best under ₹15,000</h3>
            <p>India focus: Value king smartphones.</p>
          </div>
          <div className="niche-card glass-card" onClick={() => setParams({ category: 'MOBILE', maxPrice: '30000', priority: 'camera' })}>
            <h3>📸 Camera Phones under ₹30k</h3>
            <p>Best sensors and image processing.</p>
          </div>
          <div className="niche-card glass-card" onClick={() => setParams({ category: 'MOBILE', priority: 'gaming' })}>
            <h3>🎮 Gaming Beasts</h3>
            <p>High refresh rate & cooling systems.</p>
          </div>
          <div className="niche-card glass-card" onClick={() => setParams({ category: 'MOBILE', priority: 'battery' })}>
            <h3>🔋 Battery Kings</h3>
            <p>Devices that last 2+ days.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
