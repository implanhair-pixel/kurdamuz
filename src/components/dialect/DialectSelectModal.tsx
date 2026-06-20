'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Dialect } from '@/types/content';

const DIALECTS: { id: Dialect; label: string; native: string; desc: string; flag: string }[] = [
  {
    id: 'sorani',
    label: 'سورانی',
    native: 'سۆرانی',
    desc: 'کردی مرکزی — رایج‌ترین گویش در ایران و عراق',
    flag: '🟢',
  },
  {
    id: 'kurmanji',
    label: 'کرمانجی',
    native: 'Kurmancî',
    desc: 'کردی شمالی — با خط لاتین، رایج در ترکیه و سوریه',
    flag: '🔵',
  },
  {
    id: 'bahdini',
    label: 'بادینی',
    native: 'بادینی',
    desc: 'گویش شمالی عراق — شبیه کرمانجی با تفاوت‌های محلی',
    flag: '🟡',
  },
  {
    id: 'kalhory',
    label: 'کلهری',
    native: 'کەڵهوری',
    desc: 'کردی جنوبی — رایج در کرمانشاه و ایلام',
    flag: '🟠',
  },
  {
    id: 'leki',
    label: 'لکی',
    native: 'لەکی',
    desc: 'گویش جنوبی — رایج در لرستان',
    flag: '🟣',
  },
  {
    id: 'hawrami',
    label: 'هورامی',
    native: 'هەورامی',
    desc: 'شاخه‌ی گورانی — رایج در مناطق هورامان',
    flag: '🔴',
  },
  {
    id: 'jafi',
    label: 'جافی',
    native: 'جافی',
    desc: 'زیرگویش سورانی — رایج در ناحیه‌ی جاف',
    flag: '⚪',
  },
];

const DIALECT_LABELS: Record<Dialect, string> = DIALECTS.reduce(
  (acc, d) => ({ ...acc, [d.id]: d.label }),
  {} as Record<Dialect, string>
);

/**
 * Reads/writes the user's selected dialect via /api/profile, which is
 * backed by the `profiles` table in Supabase/Neon — NOT localStorage.
 * This matches the spec requirement that dialect selection persist
 * server-side per-user rather than per-browser.
 */
async function fetchSelectedDialect(): Promise<Dialect | null> {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) return null;
    const data = await res.json();
    const dialect = data?.profile?.selectedDialect as Dialect | null | undefined;
    return dialect ?? null;
  } catch {
    return null;
  }
}

async function saveSelectedDialect(dialect: Dialect): Promise<boolean> {
  try {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedDialect: dialect }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface Props {
  onSelect?: (dialect: Dialect) => void;
  initialDialect?: Dialect | null;
  /** Controls visibility from a parent (e.g. a "آموزش" button). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialectSelectModal({ onSelect, initialDialect, open: openProp, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<Dialect | null>(initialDialect ?? null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange]
  );

  // اگر کنترل‌شده نیست، خودش بررسی کند که آیا کاربر قبلاً گویش انتخاب کرده یا نه
  useEffect(() => {
    if (isControlled) return;
    if (initialDialect) return;

    let cancelled = false;
    fetchSelectedDialect().then((dialect) => {
      if (cancelled) return;
      if (dialect) {
        setSelected(dialect);
      } else {
        setInternalOpen(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialDialect, isControlled]);

  async function handleSelect(dialect: Dialect) {
    setSelected(dialect);
    setSaving(true);
    await saveSelectedDialect(dialect);
    setSaving(false);
    setOpen(false);
    onSelect?.(dialect);
    router.refresh();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🗣️</div>
          <h2 className="text-2xl font-bold text-gray-900">کدام گویش کردی؟</h2>
          <p className="text-gray-500 text-sm mt-1">گویشی که می‌خواهید یاد بگیرید را انتخاب کنید</p>
        </div>

        <div className="space-y-3 mb-6">
          {DIALECTS.map((d) => (
            <button
              key={d.id}
              onClick={() => handleSelect(d.id)}
              disabled={saving}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-right disabled:opacity-50"
            >
              <span className="text-2xl">{d.flag}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{d.label}</div>
                <div className="text-sm text-gray-500">{d.native}</div>
                <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center">
          می‌توانید بعداً از دکمه‌ی گوشه‌ی صفحه گویش را عوض کنید
        </p>
      </div>
    </div>
  );
}

// دکمه کوچک تغییر گویش (گوشه صفحه)
export function DialectSwitcher() {
  const [dialect, setDialect] = useState<Dialect | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetchSelectedDialect().then((d) => {
      if (!cancelled) setDialect(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSwitch(d: Dialect) {
    setSaving(true);
    const ok = await saveSelectedDialect(d);
    setSaving(false);
    if (ok) {
      setDialect(d);
      setOpen(false);
      router.refresh();
    }
  }

  if (!dialect) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-white shadow-lg border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:shadow-xl transition-shadow flex items-center gap-2"
        dir="rtl"
      >
        <span>🗣️</span>
        <span>{DIALECT_LABELS[dialect]}</span>
        <span className="text-gray-400 text-xs">تغییر</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-4 max-h-[80vh] overflow-y-auto"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 mb-3 text-center">تغییر گویش</h3>
            <div className="space-y-2">
              {DIALECTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSwitch(d.id)}
                  disabled={saving}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                    dialect === d.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-indigo-300'
                  }`}
                >
                  <span>{d.flag}</span>
                  <span className="font-medium">{d.label}</span>
                  {dialect === d.id && <span className="text-indigo-600 text-xs mr-auto">فعلی</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
