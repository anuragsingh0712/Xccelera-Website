import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormFieldBaseProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
}

interface InputFieldProps extends FormFieldBaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input';
}

interface SelectFieldProps extends FormFieldBaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select';
  children: React.ReactNode;
}

interface TextareaFieldProps extends FormFieldBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea';
}

type FormFieldProps = InputFieldProps | SelectFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, error, helper, required, as = 'input', ...rest } = props;

  const baseClass = [
    'w-full px-3 py-2.5 rounded-btn border text-sm text-ink bg-surface',
    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
    'placeholder-ink-muted transition-colors',
    error ? 'border-danger' : 'border-border',
  ].join(' ');

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {as === 'select' ? (
        <select className={baseClass} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(props as SelectFieldProps).children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          className={`${baseClass} resize-none`}
          rows={3}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={baseClass} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : helper ? (
        <p className="text-xs text-ink-muted">{helper}</p>
      ) : null}
    </div>
  );
}
