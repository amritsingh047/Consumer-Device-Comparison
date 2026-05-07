import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Device } from '../../types/device';
import './ComparisonMatrix.css';

interface SpecRow { section: string; key: string; label: string; values: string[]; isDiff: boolean; }

const formatKey = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

function buildRows(devices: Device[]): SpecRow[] {
  const rows: SpecRow[] = [];
  const allSections = new Set(devices.flatMap(d => Object.keys(d.specs)));
  allSections.forEach(section => {
    const allKeys = new Set(
      devices.flatMap(d => Object.keys((d.specs as Record<string, Record<string, string>>)[section] || {}))
    );
    allKeys.forEach(key => {
      const values = devices.map(d => {
        const sec = (d.specs as Record<string, Record<string, string>>)[section];
        return sec?.[key] ?? 'N/A';
      });
      const isDiff = new Set(values.filter(v => v !== 'N/A')).size > 1;
      rows.push({ section, key, label: formatKey(key), values, isDiff });
    });
  });
  return rows;
}

const colHelper = createColumnHelper<SpecRow>();

interface Props { devices: Device[]; highlightDiffs: boolean; }

export const ComparisonMatrix: React.FC<Props> = ({ devices, highlightDiffs }) => {
  const data = useMemo(() => buildRows(devices), [devices]);

  const columns = useMemo(() => [
    colHelper.accessor('label', {
      header: 'Specification',
      cell: info => (
        <span className="matrix-spec-label">
          <span className="matrix-spec-section">{formatKey(info.row.original.section)}</span>
          {info.getValue()}
        </span>
      ),
    }),
    ...devices.map((d, i) =>
      colHelper.display({
        id: d.id,
        header: () => (
          <div className="matrix-device-header">
            <img src={d.thumbnailUrl} alt={d.name}
              onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/1e293b/94a3b8?text=?'; }} />
            <div className="matrix-device-info">
              <span className="matrix-device-brand">{d.brand}</span>
              <span className="matrix-device-name">{d.name}</span>
              <div className="matrix-price">
                <span className="matrix-price-val">₹{d.prices[0]?.priceInr.toLocaleString('en-IN') || 'N/A'}</span>
                <span className="matrix-price-vendor">via {d.prices[0]?.vendor.replace('_', ' ') || 'Market'}</span>
              </div>
            </div>
          </div>
        ),
        cell: info => <span className="matrix-cell-value">{info.row.original.values[i]}</span>,
      })
    ),
  ], [devices]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => parentRef.current, estimateSize: () => 48, overscan: 10 });
  const vItems = virtualizer.getVirtualItems();

  return (
    <div className="matrix-scroll-container" ref={parentRef} tabIndex={0} role="region" aria-label="Device Specifications Comparison">
      <table role="table" className="matrix-table">
        <thead role="rowgroup">
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} role="row">
              {hg.headers.map(h => (
                <th key={h.id} role="columnheader" scope="col" className={h.id === 'label' ? 'matrix-th-label' : 'matrix-th-device'}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody role="rowgroup" style={{ height: virtualizer.getTotalSize(), position: 'relative', display: 'block' }}>
          {vItems.map(vRow => {
            const row = rows[vRow.index];
            const highlight = highlightDiffs && row.original.isDiff;
            return (
              <tr key={row.id} role="row"
                className={`matrix-row ${highlight ? 'diff-highlight' : ''}`}
                style={{ position: 'absolute', top: vRow.start, width: '100%', display: 'table', tableLayout: 'fixed' }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} role={cell.column.id === 'label' ? 'rowheader' : 'cell'}
                    className={cell.column.id === 'label' ? 'matrix-td-label' : 'matrix-td'}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
