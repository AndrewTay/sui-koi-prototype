import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { Icon, IconDown, IconSpinner } from './icons.js';
export function Button({ appearance = 'Primary', state = 'Default', label, showIcon = false, icon = 'plus', loadingLabel = 'Sending…', className = '', disabled, type = 'button', ...rest }) {
    const busy = state === 'Loading';
    const blocked = disabled || state === 'Disabled' || busy;
    return _jsxs("button", { type: type, className: `mizu-button mizu-button--${appearance.toLowerCase()} ${className}`, "data-state": state, disabled: blocked, "aria-busy": busy || undefined, ...rest, children: [busy ? _jsx(IconSpinner, {}) : showIcon && (typeof icon === 'string' ? _jsx(Icon, { name: icon }) : icon), _jsx("span", { children: busy ? loadingLabel : label })] });
}
export function IconButton({ label, icon = 'close', state = 'Default', className = '', disabled, type = 'button', ...rest }) {
    return _jsx("button", { type: type, className: `mizu-icon-button ${className}`, "data-state": state, "aria-label": label, disabled: disabled || state === 'Disabled', ...rest, children: typeof icon === 'string' ? _jsx(Icon, { name: icon }) : icon });
}
export function NavigationItem({ label, href, count, showCount = false, state = 'Default', className = '' }) {
    return _jsxs("a", { href: href, className: `mizu-navigation-item ${className}`, "data-state": state, "aria-current": state === 'Selected' ? 'page' : undefined, children: [_jsx("span", { children: label }), showCount && count && _jsx("span", { className: "mizu-navigation-item__count", children: count })] });
}
export function FilterTab({ label, count, showCount = false, selected = false, state = 'Default', className = '', ...rest }) {
    return _jsxs("button", { type: "button", className: `mizu-filter-tab ${className}`, "data-state": state, "aria-pressed": selected, ...rest, children: [_jsx("span", { children: label }), showCount && count && _jsx("span", { className: "mizu-filter-tab__count", children: count })] });
}
export function StatusBadge({ status, amount, showAmount = true, className = '' }) {
    return _jsxs("span", { className: `mizu-status-badge mizu-status-badge--${status.toLowerCase()} ${className}`, children: [status, showAmount && amount && _jsx("span", { children: amount })] });
}
export function Field({ id, name, label, kind = 'Text', state = 'Default', value, defaultValue, placeholder, helpText, showHelp = false, errorText, options = [], inputType = 'text', inputMode, required, disabled, onValueChange, className = '' }) {
    const generated = useId();
    const controlId = id || `mizu-field-${generated}`;
    const hintId = `${controlId}-hint`;
    const invalid = state === 'Error' || Boolean(errorText);
    const blocked = disabled || state === 'Disabled';
    const description = (invalid || showHelp) ? hintId : undefined;
    const shared = { id: controlId, name, disabled: blocked, required, 'aria-invalid': invalid || undefined, 'aria-describedby': description, onChange: (event) => onValueChange?.(event.target.value) };
    return _jsxs("div", { className: `mizu-field ${className}`, "data-state": invalid ? 'Error' : state, children: [_jsx("label", { htmlFor: controlId, children: label }), kind === 'Select'
                ? _jsxs("div", { className: "mizu-field__select", children: [_jsxs("select", { ...shared, value: value, defaultValue: value === undefined ? defaultValue : undefined, children: [placeholder && _jsx("option", { value: "", disabled: true, children: placeholder }), options.map(option => _jsx("option", { value: option.value, children: option.label }, option.value))] }), _jsx(IconDown, {})] })
                : kind === 'Textarea'
                    ? _jsx("textarea", { ...shared, value: value, defaultValue: value === undefined ? defaultValue : undefined, placeholder: placeholder, rows: 4 })
                    : _jsx("input", { ...shared, type: inputType, inputMode: inputMode, value: value, defaultValue: value === undefined ? defaultValue : undefined, placeholder: placeholder }), (invalid || showHelp) && _jsx("p", { id: hintId, className: "mizu-field__hint", children: invalid ? errorText || helpText || 'Check this value and try again.' : helpText })] });
}
