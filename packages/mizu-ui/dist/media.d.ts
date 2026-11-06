import type { HTMLAttributes } from 'react';
export type MediaKind = 'Koi' | 'Ceramic' | 'Bonsai';
export interface MediaProps extends HTMLAttributes<HTMLDivElement> {
    kind: MediaKind;
    /** Required when the image conveys content. Use an empty string only for a decorative duplicate. */
    alt: string;
}
export declare function Media({ kind, alt, className, ...rest }: MediaProps): import("react").JSX.Element;
export declare const MediaKoi: (props: Omit<MediaProps, "kind">) => import("react").JSX.Element;
export declare const MediaCeramic: (props: Omit<MediaProps, "kind">) => import("react").JSX.Element;
export declare const MediaBonsai: (props: Omit<MediaProps, "kind">) => import("react").JSX.Element;
