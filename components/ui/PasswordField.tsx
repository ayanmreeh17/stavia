'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { passwordRules } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

interface PasswordFieldProps {
  name: string;
  label?: string;
  showRequirements?: boolean;
  required?: boolean;
}

export function PasswordField({ name, label = 'סיסמה', showRequirements = true, required }: PasswordFieldProps) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [touched, setTouched] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setTouched(true)}
          autoComplete="new-password"
          className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 pl-11 text-charcoal focus:border-forest outline-none transition-colors"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
          aria-label={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showRequirements && (touched || value.length > 0) && (
        <ul className="grid grid-cols-2 gap-1.5 pt-1" aria-live="polite">
          {passwordRules.map((rule) => {
            const passed = rule.test(value);
            return (
              <li
                key={rule.key}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  passed ? 'text-forest-500' : 'text-charcoal/40'
                )}
              >
                {passed ? <Check size={13} /> : <X size={13} />}
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
