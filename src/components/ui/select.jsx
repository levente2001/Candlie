// src/components/ui/select.jsx
import React from 'react';
import { cn } from '@/lib/utils';

export function Select({ value, onValueChange, children }) {
  let triggerClassName = '';
  let placeholder = '';
  const items = [];

  const walk = (node) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement(child)) return;

      if (child.type === SelectTrigger) {
        triggerClassName = child.props.className || '';
        placeholder = child.props.placeholder || placeholder;
        return; // <<< fontos: ne járja be még egyszer
      }

      if (child.type === SelectContent) {
        walk(child.props.children);
        return; // <<< fontos: ne essen tovább a default ágba
      }

      if (child.type === SelectItem) {
        items.push({ value: child.props.value, label: child.props.children });
        return;
      }

      if (child.props?.children) walk(child.props.children);
    });
  };

  walk(children);

  // opcionális: deduplikálás value alapján (extra biztonság)
  const deduped = [];
  const seen = new Set();
  for (const it of items) {
    const k = String(it.value);
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(it);
  }

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[var(--candlie-pink-primary)]/40',
        triggerClassName
      )}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {deduped.map((it, idx) => (
        <option key={`${it.value}-${idx}`} value={it.value}>
          {it.label}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ children }) { return <>{children}</>; }
export function SelectValue({ children }) { return <>{children}</>; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem() { return null; }
