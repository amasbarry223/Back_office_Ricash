'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { NOTIFICATION_TYPE_UI } from '@/lib/notification-ui';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationType,
} from '@/types';

const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABELS,
) as NotificationType[];

function filterTypes(query: string): NotificationType[] {
  const q = query.trim().toLowerCase();
  if (!q) return NOTIFICATION_TYPES;
  return NOTIFICATION_TYPES.filter((key) => {
    const label = NOTIFICATION_TYPE_LABELS[key].toLowerCase();
    const code = key.toLowerCase().replace(/_/g, ' ');
    return label.includes(q) || code.includes(q);
  });
}

interface NotificationTypePickerProps {
  value: NotificationType;
  onChange: (type: NotificationType) => void;
  className?: string;
}

export default function NotificationTypePicker({
  value,
  onChange,
  className,
}: NotificationTypePickerProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selectedLabel = NOTIFICATION_TYPE_LABELS[value];
  const selectedUi = NOTIFICATION_TYPE_UI[value];
  const SelectedIcon = selectedUi.icon;

  const filtered = useMemo(() => filterTypes(query), [query]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectType = (type: NotificationType) => {
    onChange(type);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }

    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlightIndex]) {
      e.preventDefault();
      selectType(filtered[highlightIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full sm:max-w-md', className)}>
      <Label htmlFor={listId} className="text-sm font-medium mb-2 block">
        Type de notification
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10"
          aria-hidden
        />
        {!open && (
          <span
            className={cn(
              'pointer-events-none absolute left-9 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md',
              selectedUi.bgClass,
            )}
            aria-hidden
          >
            <SelectedIcon className={cn('size-4', selectedUi.colorClass)} />
          </span>
        )}
        <Input
          ref={inputRef}
          id={listId}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${listId}-listbox`}
          autoComplete="off"
          placeholder="Rechercher ou choisir un type…"
          value={open ? query : selectedLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onKeyDown={handleKeyDown}
          className={cn('w-full pl-9 pr-10', !open && 'pl-[3.25rem]')}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Ouvrir la liste des types"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) {
              setQuery('');
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-popover py-1 shadow-md ricash-scroll"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Aucun type trouvé</li>
          ) : (
            filtered.map((typeKey, index) => {
              const cfg = NOTIFICATION_TYPE_UI[typeKey];
              const Icon = cfg.icon;
              const isSelected = value === typeKey;
              const isHighlighted = highlightIndex === index;
              return (
                <li key={typeKey} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => selectType(typeKey)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                      isHighlighted && 'bg-muted',
                      isSelected && 'font-medium text-ricash-brand',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        cfg.bgClass,
                      )}
                    >
                      <Icon className={cn('size-4', cfg.colorClass)} aria-hidden />
                    </span>
                    <span className="flex-1">{NOTIFICATION_TYPE_LABELS[typeKey]}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
