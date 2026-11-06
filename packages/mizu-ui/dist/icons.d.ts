import type { HTMLAttributes } from 'react';
export type IconName = 'close' | 'plus' | 'chevron' | 'down' | 'menu' | 'upload' | 'check' | 'spinner';
export type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    name: IconName;
};
/** Figma's original 20 × 20 vector artwork, masked with the active semantic icon color. */
export declare function Icon({ name, className, ...rest }: IconProps): import("react").JSX.Element;
export declare const IconClose: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconPlus: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconChevron: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconDown: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconMenu: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconUpload: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconCheck: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
export declare const IconSpinner: (props: Omit<IconProps, "name">) => import("react").JSX.Element;
