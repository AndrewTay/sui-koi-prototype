import { jsx as _jsx } from "react/jsx-runtime";
const paths = {
    Koi: new URL('./assets/koi.png', import.meta.url).href,
    Ceramic: new URL('./assets/ceramic.jpg', import.meta.url).href,
    Bonsai: new URL('./assets/bonsai.jpg', import.meta.url).href,
};
export function Media({ kind, alt, className = '', ...rest }) {
    return _jsx("div", { className: `mizu-media mizu-media--${kind.toLowerCase()} ${className}`, ...rest, children: _jsx("img", { src: paths[kind], alt: alt }) });
}
export const MediaKoi = (props) => _jsx(Media, { ...props, kind: "Koi" });
export const MediaCeramic = (props) => _jsx(Media, { ...props, kind: "Ceramic" });
export const MediaBonsai = (props) => _jsx(Media, { ...props, kind: "Bonsai" });
