import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState } from 'react';
import { Button, IconButton, NavigationItem, StatusBadge } from './controls.js';
import { IconChevron, IconDown, IconUpload } from './icons.js';
import { Media } from './media.js';
export function Brand({ size = 'Desktop', href = '/', className = '' }) {
    return _jsx("a", { className: `mizu-brand mizu-brand--${size.toLowerCase()} ${className}`, href: href, "aria-label": "Mizu home", children: "mizu" });
}
const defaultRoutes = [
    { label: 'Collection', href: '/collection' },
    { label: 'Offers', href: '/offers' },
    { label: 'Sell', href: '/sell' },
    { label: 'Saved', href: '/saved' },
];
export function Header({ viewport = 'Desktop', brandHref = '/', routes = defaultRoutes, currentHref = '/collection', onMenuClick, className = '' }) {
    return _jsxs("header", { className: `mizu-header mizu-header--${viewport.toLowerCase()} ${className}`, children: [_jsxs("div", { className: "mizu-header__identity", children: [_jsx(Brand, { size: viewport, href: brandHref }), _jsx(IconButton, { label: "Open menu", icon: "menu", onClick: onMenuClick })] }), _jsx("nav", { className: "mizu-header__routes", "aria-label": "Main navigation", children: routes.map(route => _jsx(NavigationItem, { ...route, state: route.href === currentHref ? 'Selected' : 'Default', showCount: Boolean(route.count) }, route.href)) })] });
}
export function SpecimenCard({ title, metadata, reference, showReference = false, layout = 'Gallery', state = 'Default', media, mediaKind = 'Koi', mediaAlt, className = '', ...rest }) {
    const image = media ?? _jsx(Media, { kind: mediaKind, alt: mediaAlt || `${title}, viewed from above` });
    return _jsxs("button", { type: "button", className: `mizu-specimen-card mizu-specimen-card--${layout.toLowerCase()} ${className}`, "data-state": state, ...rest, children: [_jsxs("span", { className: "mizu-specimen-card__media", children: [image, showReference && reference && _jsx("span", { className: "mizu-specimen-card__reference", children: reference })] }), _jsxs("span", { className: "mizu-specimen-card__info", children: [_jsx("span", { className: "mizu-specimen-card__title", children: title }), _jsx("span", { className: "mizu-specimen-card__metadata", children: metadata })] })] });
}
export function FactRow({ label, value, className = '' }) {
    return _jsxs("div", { className: `mizu-fact-row ${className}`, children: [_jsx("dt", { children: label }), _jsx("dd", { children: value })] });
}
export function SpecimenDetails({ title, price, seller, description, facts = [], saved = false, onSave, onMakeOffer, className = '' }) {
    return _jsxs("section", { className: `mizu-specimen-details ${className}`, "aria-label": `${title} details`, children: [_jsx("h2", { children: title }), _jsx("p", { className: "mizu-specimen-details__price", children: price }), _jsx("p", { className: "mizu-specimen-details__seller", children: seller }), _jsx("p", { children: description }), facts.length > 0 && _jsx("dl", { children: facts.map(fact => _jsx(FactRow, { ...fact }, fact.label)) }), _jsxs("div", { className: "mizu-specimen-details__actions", children: [_jsx(Button, { appearance: "Secondary", label: saved ? 'Saved ✓' : 'Save +', onClick: onSave, "aria-pressed": saved }), _jsx(Button, { label: "Make an offer", onClick: onMakeOffer })] })] });
}
export function Message({ message, timestamp, direction = 'Received', className = '' }) {
    return _jsxs("article", { className: `mizu-message mizu-message--${direction.toLowerCase()} ${className}`, children: [_jsx("p", { children: message }), timestamp && _jsx("small", { children: timestamp })] });
}
export function OfferSummary({ title, seller, status, amount, media, mediaKind = 'Koi', mediaAlt, className = '', ...rest }) {
    return _jsxs("button", { type: "button", className: `mizu-offer-summary ${className}`, ...rest, children: [_jsx("span", { className: "mizu-offer-summary__media", children: media ?? _jsx(Media, { kind: mediaKind, alt: mediaAlt || `${title}, viewed from above` }) }), _jsxs("span", { className: "mizu-offer-summary__info", children: [_jsx("strong", { children: title }), _jsx("small", { children: seller })] }), _jsx(StatusBadge, { status: status, amount: amount, showAmount: Boolean(amount) }), _jsx(IconChevron, {})] });
}
export function DepartmentAccordion({ label, expanded, defaultExpanded = false, onExpandedChange, items, className = '' }) {
    const [internal, setInternal] = useState(defaultExpanded);
    const open = expanded ?? internal;
    const panelId = useId();
    function toggle() { if (expanded === undefined)
        setInternal(!open); onExpandedChange?.(!open); }
    return _jsxs("section", { className: `mizu-department-accordion ${className}`, children: [_jsxs("button", { type: "button", className: "mizu-department-accordion__trigger", "aria-expanded": open, "aria-controls": panelId, onClick: toggle, children: [_jsx("span", { children: label }), open ? _jsx(IconDown, {}) : _jsx(IconChevron, {})] }), _jsx("nav", { id: panelId, "aria-label": label, hidden: !open, children: items.map(item => _jsx(NavigationItem, { ...item }, `${item.href}:${item.label}`)) })] });
}
export function EmptyState({ reason = 'Saved', onAction, className = '' }) {
    const results = reason === 'Results';
    return _jsxs("section", { className: `mizu-empty-state ${className}`, children: [_jsx("h2", { children: results ? 'No matching specimens' : 'No saved specimens' }), _jsx("p", { children: results ? 'Try another variety or clear the current filter.' : 'Save specimens from their detail view to find them here.' }), _jsx(Button, { appearance: "Secondary", label: results ? 'Clear filter' : 'Browse the collection', onClick: onAction })] });
}
export function ImageUpload({ state, fileName, label = 'Specimen image', errorText, onFileSelect, onValidationError, disabled = false, className = '' }) {
    const inputId = useId();
    const [internalState, setInternalState] = useState('Empty');
    const [selectedName, setSelectedName] = useState();
    const [internalError, setInternalError] = useState();
    const current = state ?? internalState;
    const name = fileName ?? selectedName;
    const description = current === 'Error' ? errorText || internalError || 'Use a PNG or JPG image. Try another file.'
        : current === 'Selected' ? 'Image selected. Review before publishing.'
            : 'Upload an overhead photograph. PNG or JPG.';
    async function handleFile(file) {
        if (!file)
            return;
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            const message = 'Use a PNG or JPG image. Try another file.';
            setInternalError(message);
            setInternalState('Error');
            onValidationError?.(message);
            return;
        }
        setSelectedName(file.name);
        setInternalError(undefined);
        if (onFileSelect) {
            setInternalState('Uploading');
            try {
                await onFileSelect(file);
                setInternalState('Selected');
            }
            catch (error) {
                setInternalError(error instanceof Error ? error.message : 'Upload failed. Try again.');
                setInternalState('Error');
            }
        }
        else
            setInternalState('Selected');
    }
    return _jsxs("div", { className: `mizu-image-upload ${className}`, "data-state": current, "aria-busy": current === 'Uploading' || undefined, children: [_jsx(IconUpload, {}), _jsx("label", { className: "mizu-image-upload__title", htmlFor: inputId, children: current === 'Uploading' ? 'Uploading image…' : (current === 'Selected' || current === 'Error') && name ? name : label }), _jsx("p", { id: `${inputId}-hint`, className: "mizu-image-upload__description", role: current === 'Error' ? 'alert' : undefined, children: description }), _jsxs("span", { className: "mizu-image-upload__chooser", children: [_jsx("span", { children: current === 'Selected' ? 'Replace image' : 'Choose image' }), _jsx("input", { id: inputId, type: "file", accept: "image/png,image/jpeg", disabled: disabled || current === 'Uploading', "aria-describedby": `${inputId}-hint`, "aria-invalid": current === 'Error' || undefined, onChange: event => { void handleFile(event.target.files?.[0]); } })] }), current === 'Uploading' && _jsx("span", { className: "mizu-sr-only", role: "status", children: "Uploading image" })] });
}
