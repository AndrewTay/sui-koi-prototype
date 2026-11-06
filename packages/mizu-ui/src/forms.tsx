import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Field, type FieldOption } from './controls.js';
import { IconButton } from './controls.js';

export interface MessageComposerProps {
  initialDraft?: string;
  state?: 'Default' | 'Sending' | 'Error';
  onSend: (message: string) => void | Promise<void>;
  className?: string;
}

export function MessageComposer({ initialDraft = '', state, onSend, className = '' }: MessageComposerProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [internalState, setInternalState] = useState<'Default' | 'Sending' | 'Error'>('Default');
  const [error, setError] = useState('');
  const current = state ?? internalState;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || current === 'Sending') return;
    setInternalState('Sending'); setError('');
    try { await onSend(draft.trim()); setDraft(''); setInternalState('Default'); }
    catch (cause) { setError(cause instanceof Error && cause.message ? cause.message : 'Message was not sent. Try again; your draft is saved.'); setInternalState('Error'); }
  }
  return <form className={`mizu-message-composer ${className}`} data-state={current} onSubmit={event => { void submit(event); }}>
    <div className="mizu-message-composer__row"><Field label="Message to seller" value={draft} onValueChange={setDraft} placeholder="Arrange a convenient handover time…" disabled={current === 'Sending'} /><Button type="submit" label="Send" state={current === 'Sending' ? 'Loading' : 'Default'} loadingLabel="Sending…" disabled={!draft.trim()} /></div>
    {current === 'Error' && <p role="alert" className="mizu-message-composer__error">{error || 'Message was not sent. Try again; your draft is saved.'}</p>}
    <span className="mizu-sr-only" role="status">{current === 'Sending' ? 'Sending message' : ''}</span>
  </form>;
}

export interface OfferFormValue { amount: string; handover: string; message: string }
export interface OfferFormProps {
  askingPrice: string;
  specimen: string;
  reference?: string;
  currency?: string;
  handoverOptions: FieldOption[];
  initialValue?: Partial<OfferFormValue>;
  onSubmit: (value: OfferFormValue) => void | Promise<void>;
  className?: string;
}

export function OfferForm({ askingPrice, specimen, reference, currency = 'USD', handoverOptions, initialValue, onSubmit, className = '' }: OfferFormProps) {
  const [value, setValue] = useState<OfferFormValue>({ amount: initialValue?.amount || '', handover: initialValue?.handover || '', message: initialValue?.message || '' });
  const [errors, setErrors] = useState<Partial<Record<keyof OfferFormValue | 'submit', string>>>({});
  const [sending, setSending] = useState(false);
  function change(key: keyof OfferFormValue, next: string) { setValue(previous => ({ ...previous, [key]: next })); setErrors(previous => ({ ...previous, [key]: undefined, submit: undefined })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const nextErrors: typeof errors = {};
    if (!Number.isFinite(Number(value.amount.replaceAll(',', ''))) || Number(value.amount.replaceAll(',', '')) <= 0) nextErrors.amount = 'Enter an amount greater than zero.';
    if (!value.handover) nextErrors.handover = 'Choose a handover preference.';
    if (!value.message.trim()) nextErrors.message = 'Add a message before sending.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSending(true);
    try { await onSubmit({ ...value, message: value.message.trim() }); }
    catch (cause) { setErrors(previous => ({ ...previous, submit: cause instanceof Error && cause.message ? cause.message : 'Offer was not sent. Try again; your draft is saved.' })); }
    finally { setSending(false); }
  }
  return <form className={`mizu-offer-form ${className}`} onSubmit={event => { void submit(event); }} noValidate>
    <h2>Propose an offer</h2><p className="mizu-offer-form__summary">Asking {askingPrice} · {specimen}{reference && ` ${reference}`}</p>
    <Field label={`Your offer (${currency})`} inputMode="decimal" value={value.amount} onValueChange={next => change('amount', next)} errorText={errors.amount} state={errors.amount ? 'Error' : 'Default'} placeholder="Enter amount" required />
    <Field kind="Select" label="Handover preference" value={value.handover} onValueChange={next => change('handover', next)} errorText={errors.handover} state={errors.handover ? 'Error' : 'Default'} placeholder="Choose a preference" options={handoverOptions} required />
    <Field kind="Textarea" label="Message to seller" value={value.message} onValueChange={next => change('message', next)} errorText={errors.message} state={errors.message ? 'Error' : 'Default'} placeholder="Write a message to the seller" required />
    {errors.submit && <p role="alert" className="mizu-offer-form__error">{errors.submit}</p>}
    <Button type="submit" label="Send offer & open thread" state={sending ? 'Loading' : 'Default'} loadingLabel="Sending…" />
  </form>;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: ReactNode;
  viewport?: 'Desktop' | 'Mobile';
  className?: string;
}

export function Dialog({ open, onClose, title, body, viewport = 'Desktop', className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) { previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; dialog.showModal(); }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = oldOverflow; previousFocus.current?.focus(); };
  }, [open]);
  return <dialog ref={ref} className={`mizu-dialog mizu-dialog--${viewport.toLowerCase()} ${className}`} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClose={() => { if (open) onClose(); }}>
    <span className="mizu-sr-only" id={titleId}>{title}</span>
    <IconButton className="mizu-dialog__close" label="Close dialog" onClick={onClose} />
    <div className="mizu-dialog__body">{body}</div>
  </dialog>;
}
