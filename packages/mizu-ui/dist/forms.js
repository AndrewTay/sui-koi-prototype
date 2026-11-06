import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from 'react';
import { Button, Field } from './controls.js';
import { IconButton } from './controls.js';
export function MessageComposer({ initialDraft = '', state, onSend, className = '' }) {
    const [draft, setDraft] = useState(initialDraft);
    const [internalState, setInternalState] = useState('Default');
    const [error, setError] = useState('');
    const current = state ?? internalState;
    async function submit(event) {
        event.preventDefault();
        if (!draft.trim() || current === 'Sending')
            return;
        setInternalState('Sending');
        setError('');
        try {
            await onSend(draft.trim());
            setDraft('');
            setInternalState('Default');
        }
        catch (cause) {
            setError(cause instanceof Error && cause.message ? cause.message : 'Message was not sent. Try again; your draft is saved.');
            setInternalState('Error');
        }
    }
    return _jsxs("form", { className: `mizu-message-composer ${className}`, "data-state": current, onSubmit: event => { void submit(event); }, children: [_jsxs("div", { className: "mizu-message-composer__row", children: [_jsx(Field, { label: "Message to seller", value: draft, onValueChange: setDraft, placeholder: "Arrange a convenient handover time\u2026", disabled: current === 'Sending' }), _jsx(Button, { type: "submit", label: "Send", state: current === 'Sending' ? 'Loading' : 'Default', loadingLabel: "Sending\u2026", disabled: !draft.trim() })] }), current === 'Error' && _jsx("p", { role: "alert", className: "mizu-message-composer__error", children: error || 'Message was not sent. Try again; your draft is saved.' }), _jsx("span", { className: "mizu-sr-only", role: "status", children: current === 'Sending' ? 'Sending message' : '' })] });
}
export function OfferForm({ askingPrice, specimen, reference, currency = 'USD', handoverOptions, initialValue, onSubmit, className = '' }) {
    const [value, setValue] = useState({ amount: initialValue?.amount || '', handover: initialValue?.handover || '', message: initialValue?.message || '' });
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);
    function change(key, next) { setValue(previous => ({ ...previous, [key]: next })); setErrors(previous => ({ ...previous, [key]: undefined, submit: undefined })); }
    async function submit(event) {
        event.preventDefault();
        if (sending)
            return;
        const nextErrors = {};
        if (!Number.isFinite(Number(value.amount.replaceAll(',', ''))) || Number(value.amount.replaceAll(',', '')) <= 0)
            nextErrors.amount = 'Enter an amount greater than zero.';
        if (!value.handover)
            nextErrors.handover = 'Choose a handover preference.';
        if (!value.message.trim())
            nextErrors.message = 'Add a message before sending.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length)
            return;
        setSending(true);
        try {
            await onSubmit({ ...value, message: value.message.trim() });
        }
        catch (cause) {
            setErrors(previous => ({ ...previous, submit: cause instanceof Error && cause.message ? cause.message : 'Offer was not sent. Try again; your draft is saved.' }));
        }
        finally {
            setSending(false);
        }
    }
    return _jsxs("form", { className: `mizu-offer-form ${className}`, onSubmit: event => { void submit(event); }, noValidate: true, children: [_jsx("h2", { children: "Propose an offer" }), _jsxs("p", { className: "mizu-offer-form__summary", children: ["Asking ", askingPrice, " \u00B7 ", specimen, reference && ` ${reference}`] }), _jsx(Field, { label: `Your offer (${currency})`, inputMode: "decimal", value: value.amount, onValueChange: next => change('amount', next), errorText: errors.amount, state: errors.amount ? 'Error' : 'Default', placeholder: "Enter amount", required: true }), _jsx(Field, { kind: "Select", label: "Handover preference", value: value.handover, onValueChange: next => change('handover', next), errorText: errors.handover, state: errors.handover ? 'Error' : 'Default', placeholder: "Choose a preference", options: handoverOptions, required: true }), _jsx(Field, { kind: "Textarea", label: "Message to seller", value: value.message, onValueChange: next => change('message', next), errorText: errors.message, state: errors.message ? 'Error' : 'Default', placeholder: "Write a message to the seller", required: true }), errors.submit && _jsx("p", { role: "alert", className: "mizu-offer-form__error", children: errors.submit }), _jsx(Button, { type: "submit", label: "Send offer & open thread", state: sending ? 'Loading' : 'Default', loadingLabel: "Sending\u2026" })] });
}
export function Dialog({ open, onClose, title, body, viewport = 'Desktop', className = '' }) {
    const ref = useRef(null);
    const previousFocus = useRef(null);
    const titleId = useId();
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog)
            return;
        if (open && !dialog.open) {
            previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            dialog.showModal();
        }
        if (!open && dialog.open)
            dialog.close();
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const oldOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = oldOverflow; previousFocus.current?.focus(); };
    }, [open]);
    return _jsxs("dialog", { ref: ref, className: `mizu-dialog mizu-dialog--${viewport.toLowerCase()} ${className}`, "aria-labelledby": titleId, onCancel: event => { event.preventDefault(); onClose(); }, onClose: () => { if (open)
            onClose(); }, children: [_jsx("span", { className: "mizu-sr-only", id: titleId, children: title }), _jsx(IconButton, { className: "mizu-dialog__close", label: "Close dialog", onClick: onClose }), _jsx("div", { className: "mizu-dialog__body", children: body })] });
}
