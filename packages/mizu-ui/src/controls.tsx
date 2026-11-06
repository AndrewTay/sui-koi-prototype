import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, IconDown, IconSpinner, type IconName } from './icons.js';

export type ButtonAppearance = 'Primary' | 'Secondary' | 'Text';
export type ButtonState = 'Default' | 'Hover' | 'Pressed' | 'Focus' | 'Disabled' | 'Loading';
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  appearance?: ButtonAppearance;
  state?: ButtonState;
  label: string;
  showIcon?: boolean;
  icon?: IconName | ReactNode;
  loadingLabel?: string;
}

export function Button({ appearance = 'Primary', state = 'Default', label, showIcon = false, icon = 'plus', loadingLabel = 'Sending…', className = '', disabled, type = 'button', ...rest }: ButtonProps) {
  const busy = state === 'Loading';
  const blocked = disabled || state === 'Disabled' || busy;
  return <button type={type} className={`mizu-button mizu-button--${appearance.toLowerCase()} ${className}`} data-state={state} disabled={blocked} aria-busy={busy || undefined} {...rest}>
    {busy ? <IconSpinner /> : showIcon && (typeof icon === 'string' ? <Icon name={icon as IconName} /> : icon)}
    <span>{busy ? loadingLabel : label}</span>
  </button>;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: IconName | ReactNode;
  state?: Exclude<ButtonState, 'Pressed' | 'Loading'>;
}

export function IconButton({ label, icon = 'close', state = 'Default', className = '', disabled, type = 'button', ...rest }: IconButtonProps) {
  return <button type={type} className={`mizu-icon-button ${className}`} data-state={state} aria-label={label} disabled={disabled || state === 'Disabled'} {...rest}>
    {typeof icon === 'string' ? <Icon name={icon as IconName} /> : icon}
  </button>;
}

export interface NavigationItemProps {
  label: string;
  href: string;
  count?: string;
  showCount?: boolean;
  state?: 'Default' | 'Selected' | 'Focus';
  className?: string;
}

export function NavigationItem({ label, href, count, showCount = false, state = 'Default', className = '' }: NavigationItemProps) {
  return <a href={href} className={`mizu-navigation-item ${className}`} data-state={state} aria-current={state === 'Selected' ? 'page' : undefined}>
    <span>{label}</span>{showCount && count && <span className="mizu-navigation-item__count">{count}</span>}
  </a>;
}

export interface FilterTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  label: string;
  count?: string;
  showCount?: boolean;
  selected?: boolean;
  state?: 'Default' | 'Hover' | 'Focus';
}

export function FilterTab({ label, count, showCount = false, selected = false, state = 'Default', className = '', ...rest }: FilterTabProps) {
  return <button type="button" className={`mizu-filter-tab ${className}`} data-state={state} aria-pressed={selected} {...rest}>
    <span>{label}</span>{showCount && count && <span className="mizu-filter-tab__count">{count}</span>}
  </button>;
}

export interface StatusBadgeProps {
  status: 'Counter' | 'Reserved' | 'Pending' | 'Closed';
  amount?: string;
  showAmount?: boolean;
  className?: string;
}

export function StatusBadge({ status, amount, showAmount = true, className = '' }: StatusBadgeProps) {
  return <span className={`mizu-status-badge mizu-status-badge--${status.toLowerCase()} ${className}`}>
    {status}{showAmount && amount && <span>{amount}</span>}
  </span>;
}

export type FieldKind = 'Text' | 'Select' | 'Textarea';
export type FieldState = 'Default' | 'Filled' | 'Focus' | 'Error' | 'Disabled';
export interface FieldOption { value: string; label: string }
export interface FieldProps {
  id?: string;
  name?: string;
  label: string;
  kind?: FieldKind;
  state?: FieldState;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  showHelp?: boolean;
  errorText?: string;
  options?: FieldOption[];
  inputType?: InputHTMLAttributes<HTMLInputElement>['type'];
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Field({ id, name, label, kind = 'Text', state = 'Default', value, defaultValue, placeholder, helpText, showHelp = false, errorText, options = [], inputType = 'text', inputMode, required, disabled, onValueChange, className = '' }: FieldProps) {
  const generated = useId();
  const controlId = id || `mizu-field-${generated}`;
  const hintId = `${controlId}-hint`;
  const invalid = state === 'Error' || Boolean(errorText);
  const blocked = disabled || state === 'Disabled';
  const description = (invalid || showHelp) ? hintId : undefined;
  const shared = { id: controlId, name, disabled: blocked, required, 'aria-invalid': invalid || undefined, 'aria-describedby': description, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onValueChange?.(event.target.value) };
  return <div className={`mizu-field ${className}`} data-state={invalid ? 'Error' : state}>
    <label htmlFor={controlId}>{label}</label>
    {kind === 'Select'
      ? <div className="mizu-field__select"><select {...shared} value={value} defaultValue={value === undefined ? defaultValue : undefined}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select><IconDown /></div>
      : kind === 'Textarea'
        ? <textarea {...shared} value={value} defaultValue={value === undefined ? defaultValue : undefined} placeholder={placeholder} rows={4} />
        : <input {...shared} type={inputType} inputMode={inputMode} value={value} defaultValue={value === undefined ? defaultValue : undefined} placeholder={placeholder} />}
    {(invalid || showHelp) && <p id={hintId} className="mizu-field__hint">{invalid ? errorText || helpText || 'Check this value and try again.' : helpText}</p>}
  </div>;
}
