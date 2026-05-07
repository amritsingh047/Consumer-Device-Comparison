import React, { useState } from 'react';
import type { DeviceSpecs } from '../../types/device';
import './SpecAccordion.css';

const SECTION_ICONS: Record<string, string> = {
  display: '🖥️', performance: '⚡', battery: '🔋', camera: '📷',
  connectivity: '📡', design: '✏️', audio: '🎵', software: '💿',
};

const formatKey = (key: string) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

interface Props { specs: DeviceSpecs; }

export const SpecAccordion: React.FC<Props> = ({ specs }) => {
  const sections = Object.keys(specs) as (keyof DeviceSpecs)[];
  const [open, setOpen] = useState<string[]>([sections[0] || '']);

  const toggle = (key: string) =>
    setOpen(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  return (
    <div className="spec-accordion">
      {sections.map(section => {
        const data = specs[section] as Record<string, string | undefined>;
        const isOpen = open.includes(section as string);
        return (
          <div key={section as string} className={`spec-section ${isOpen ? 'open' : ''}`}>
            <button className="spec-section-header" onClick={() => toggle(section as string)} aria-expanded={isOpen}>
              <span className="spec-section-icon">{SECTION_ICONS[section as string] || '📋'}</span>
              <span className="spec-section-title">{formatKey(section as string)}</span>
              <span className="spec-section-chevron">{isOpen ? '▾' : '▸'}</span>
            </button>
            {isOpen && (
              <div className="spec-section-body animate-fade-in">
                {Object.entries(data).filter(([, v]) => v).map(([key, value]) => (
                  <div key={key} className="spec-row">
                    <span className="spec-row-key">{formatKey(key)}</span>
                    <span className="spec-row-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
