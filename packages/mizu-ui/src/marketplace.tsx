import { useId, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button, IconButton, NavigationItem, StatusBadge, type StatusBadgeProps } from './controls.js';
import { IconChevron, IconDown, IconUpload } from './icons.js';
import { Media, type MediaKind } from './media.js';

export interface BrandProps { size?: 'Desktop' | 'Mobile'; href?: string; className?: string }
export function Brand({ size = 'Desktop', href = '/', className = '' }: BrandProps) {
  return <a className={`mizu-brand mizu-brand--${size.toLowerCase()} ${className}`} href={href} aria-label="Mizu home">mizu</a>;
}

export interface HeaderRoute { label: string; href: string; count?: string }
export interface HeaderProps {
  viewport?: 'Desktop' | 'Mobile';
  brandHref?: string;
  routes?: HeaderRoute[];
  currentHref?: string;
  onMenuClick?: () => void;
  className?: string;
}
const defaultRoutes: HeaderRoute[] = [
  { label: 'Collection', href: '/collection' },
  { label: 'Offers', href: '/offers' },
  { label: 'Sell', href: '/sell' },
  { label: 'Saved', href: '/saved' },
];

export function Header({ viewport = 'Desktop', brandHref = '/', routes = defaultRoutes, currentHref = '/collection', onMenuClick, className = '' }: HeaderProps) {
  return <header className={`mizu-header mizu-header--${viewport.toLowerCase()} ${className}`}>
    <div className="mizu-header__identity"><Brand size={viewport} href={brandHref} /><IconButton label="Open menu" icon="menu" onClick={onMenuClick} /></div>
    <nav className="mizu-header__routes" aria-label="Main navigation">
      {routes.map(route => <NavigationItem key={route.href} {...route} state={route.href === currentHref ? 'Selected' : 'Default'} showCount={Boolean(route.count)} />)}
    </nav>
  </header>;
}

export interface SpecimenCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  title: string;
  metadata: string;
  reference?: string;
  showReference?: boolean;
  layout?: 'Gallery' | 'Compact';
  state?: 'Default' | 'Hover' | 'Focus';
  media?: ReactNode;
  mediaKind?: MediaKind;
  mediaAlt?: string;
}

export function SpecimenCard({ title, metadata, reference, showReference = false, layout = 'Gallery', state = 'Default', media, mediaKind = 'Koi', mediaAlt, className = '', ...rest }: SpecimenCardProps) {
  const image = media ?? <Media kind={mediaKind} alt={mediaAlt || `${title}, viewed from above`} />;
  return <button type="button" className={`mizu-specimen-card mizu-specimen-card--${layout.toLowerCase()} ${className}`} data-state={state} {...rest}>
    <span className="mizu-specimen-card__media">{image}{showReference && reference && <span className="mizu-specimen-card__reference">{reference}</span>}</span>
    <span className="mizu-specimen-card__info"><span className="mizu-specimen-card__title">{title}</span><span className="mizu-specimen-card__metadata">{metadata}</span></span>
  </button>;
}

export interface FactRowProps { label: string; value: string; className?: string }
export function FactRow({ label, value, className = '' }: FactRowProps) {
  return <div className={`mizu-fact-row ${className}`}><dt>{label}</dt><dd>{value}</dd></div>;
}

export interface SpecimenDetailsProps {
  title: string;
  price: string;
  seller: string;
  description: string;
  facts?: FactRowProps[];
  saved?: boolean;
  onSave?: () => void;
  onMakeOffer?: () => void;
  className?: string;
}

export function SpecimenDetails({ title, price, seller, description, facts = [], saved = false, onSave, onMakeOffer, className = '' }: SpecimenDetailsProps) {
  return <section className={`mizu-specimen-details ${className}`} aria-label={`${title} details`}>
    <h2>{title}</h2><p className="mizu-specimen-details__price">{price}</p><p className="mizu-specimen-details__seller">{seller}</p><p>{description}</p>
    {facts.length > 0 && <dl>{facts.map(fact => <FactRow key={fact.label} {...fact} />)}</dl>}
    <div className="mizu-specimen-details__actions"><Button appearance="Secondary" label={saved ? 'Saved ✓' : 'Save +'} onClick={onSave} aria-pressed={saved} /><Button label="Make an offer" onClick={onMakeOffer} /></div>
  </section>;
}

export interface MessageProps { message: string; timestamp?: string; direction?: 'Received' | 'Sent'; className?: string }
export function Message({ message, timestamp, direction = 'Received', className = '' }: MessageProps) {
  return <article className={`mizu-message mizu-message--${direction.toLowerCase()} ${className}`}>
    <p>{message}</p>{timestamp && <small>{timestamp}</small>}
  </article>;
}

export interface OfferSummaryProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  title: string;
  seller: string;
  status: Extract<StatusBadgeProps['status'], 'Counter' | 'Reserved' | 'Pending'>;
  amount?: string;
  media?: ReactNode;
  mediaKind?: MediaKind;
  mediaAlt?: string;
}

export function OfferSummary({ title, seller, status, amount, media, mediaKind = 'Koi', mediaAlt, className = '', ...rest }: OfferSummaryProps) {
  return <button type="button" className={`mizu-offer-summary ${className}`} {...rest}>
    <span className="mizu-offer-summary__media">{media ?? <Media kind={mediaKind} alt={mediaAlt || `${title}, viewed from above`} />}</span>
    <span className="mizu-offer-summary__info"><strong>{title}</strong><small>{seller}</small></span>
    <StatusBadge status={status} amount={amount} showAmount={Boolean(amount)} />
    <IconChevron />
  </button>;
}

export interface DepartmentLink { label: string; href: string }
export interface DepartmentAccordionProps {
  label: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  items: DepartmentLink[];
  className?: string;
}

export function DepartmentAccordion({ label, expanded, defaultExpanded = false, onExpandedChange, items, className = '' }: DepartmentAccordionProps) {
  const [internal, setInternal] = useState(defaultExpanded);
  const open = expanded ?? internal;
  const panelId = useId();
  function toggle() { if (expanded === undefined) setInternal(!open); onExpandedChange?.(!open); }
  return <section className={`mizu-department-accordion ${className}`}>
    <button type="button" className="mizu-department-accordion__trigger" aria-expanded={open} aria-controls={panelId} onClick={toggle}><span>{label}</span>{open ? <IconDown /> : <IconChevron />}</button>
    <nav id={panelId} aria-label={label} hidden={!open}>{items.map(item => <NavigationItem key={`${item.href}:${item.label}`} {...item} />)}</nav>
  </section>;
}

export interface EmptyStateProps { reason?: 'Saved' | 'Results'; onAction?: () => void; className?: string }
export function EmptyState({ reason = 'Saved', onAction, className = '' }: EmptyStateProps) {
  const results = reason === 'Results';
  return <section className={`mizu-empty-state ${className}`}>
    <h2>{results ? 'No matching specimens' : 'No saved specimens'}</h2>
    <p>{results ? 'Try another variety or clear the current filter.' : 'Save specimens from their detail view to find them here.'}</p>
    <Button appearance="Secondary" label={results ? 'Clear filter' : 'Browse the collection'} onClick={onAction} />
  </section>;
}

export type ImageUploadState = 'Empty' | 'Selected' | 'Error' | 'Uploading';
export interface ImageUploadProps {
  state?: ImageUploadState;
  fileName?: string;
  label?: string;
  errorText?: string;
  onFileSelect?: (file: File) => void | Promise<void>;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ state, fileName, label = 'Specimen image', errorText, onFileSelect, onValidationError, disabled = false, className = '' }: ImageUploadProps) {
  const inputId = useId();
  const [internalState, setInternalState] = useState<ImageUploadState>('Empty');
  const [selectedName, setSelectedName] = useState<string>();
  const [internalError, setInternalError] = useState<string>();
  const current = state ?? internalState;
  const name = fileName ?? selectedName;
  const description = current === 'Error' ? errorText || internalError || 'Use a PNG or JPG image. Try another file.'
    : current === 'Selected' ? 'Image selected. Review before publishing.'
      : 'Upload an overhead photograph. PNG or JPG.';
  async function handleFile(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      const message = 'Use a PNG or JPG image. Try another file.';
      setInternalError(message); setInternalState('Error'); onValidationError?.(message); return;
    }
    setSelectedName(file.name); setInternalError(undefined);
    if (onFileSelect) {
      setInternalState('Uploading');
      try { await onFileSelect(file); setInternalState('Selected'); }
      catch (error) { setInternalError(error instanceof Error ? error.message : 'Upload failed. Try again.'); setInternalState('Error'); }
    } else setInternalState('Selected');
  }
  return <div className={`mizu-image-upload ${className}`} data-state={current} aria-busy={current === 'Uploading' || undefined}>
    <IconUpload />
    <label className="mizu-image-upload__title" htmlFor={inputId}>{current === 'Uploading' ? 'Uploading image…' : (current === 'Selected' || current === 'Error') && name ? name : label}</label>
    <p id={`${inputId}-hint`} className="mizu-image-upload__description" role={current === 'Error' ? 'alert' : undefined}>{description}</p>
    <span className="mizu-image-upload__chooser"><span>{current === 'Selected' ? 'Replace image' : 'Choose image'}</span>
      <input id={inputId} type="file" accept="image/png,image/jpeg" disabled={disabled || current === 'Uploading'} aria-describedby={`${inputId}-hint`} aria-invalid={current === 'Error' || undefined} onChange={event => { void handleFile(event.target.files?.[0]); }} />
    </span>
    {current === 'Uploading' && <span className="mizu-sr-only" role="status">Uploading image</span>}
  </div>;
}
