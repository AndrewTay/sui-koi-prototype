import { jsx as _jsx } from "react/jsx-runtime";
const paths = {
    close: new URL('./assets/close.svg', import.meta.url).href,
    plus: new URL('./assets/plus.svg', import.meta.url).href,
    chevron: new URL('./assets/chevron.svg', import.meta.url).href,
    down: new URL('./assets/down.svg', import.meta.url).href,
    menu: new URL('./assets/menu.svg', import.meta.url).href,
    upload: new URL('./assets/upload.svg', import.meta.url).href,
    check: new URL('./assets/check.svg', import.meta.url).href,
    spinner: new URL('./assets/spinner.svg', import.meta.url).href,
};
/** Figma's original 20 × 20 vector artwork, masked with the active semantic icon color. */
export function Icon({ name, className = '', ...rest }) {
    return _jsx("span", { className: `mizu-icon ${name === 'spinner' ? 'mizu-icon--spinner ' : ''}${className}`, "aria-hidden": "true", ...rest, children: _jsx("span", { className: "mizu-icon__shape", style: { maskImage: `url("${paths[name]}")`, WebkitMaskImage: `url("${paths[name]}")` } }) });
}
export const IconClose = (props) => _jsx(Icon, { ...props, name: "close" });
export const IconPlus = (props) => _jsx(Icon, { ...props, name: "plus" });
export const IconChevron = (props) => _jsx(Icon, { ...props, name: "chevron" });
export const IconDown = (props) => _jsx(Icon, { ...props, name: "down" });
export const IconMenu = (props) => _jsx(Icon, { ...props, name: "menu" });
export const IconUpload = (props) => _jsx(Icon, { ...props, name: "upload" });
export const IconCheck = (props) => _jsx(Icon, { ...props, name: "check" });
export const IconSpinner = (props) => _jsx(Icon, { ...props, name: "spinner" });
