import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { type IconName } from './icons.js';
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
export declare function Button({ appearance, state, label, showIcon, icon, loadingLabel, className, disabled, type, ...rest }: ButtonProps): import("react").JSX.Element;
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: IconName | ReactNode;
    state?: Exclude<ButtonState, 'Pressed' | 'Loading'>;
}
export declare function IconButton({ label, icon, state, className, disabled, type, ...rest }: IconButtonProps): import("react").JSX.Element;
export interface NavigationItemProps {
    label: string;
    href: string;
    count?: string;
    showCount?: boolean;
    state?: 'Default' | 'Selected' | 'Focus';
    className?: string;
}
export declare function NavigationItem({ label, href, count, showCount, state, className }: NavigationItemProps): import("react").JSX.Element;
export interface FilterTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
    label: string;
    count?: string;
    showCount?: boolean;
    selected?: boolean;
    state?: 'Default' | 'Hover' | 'Focus';
}
export declare function FilterTab({ label, count, showCount, selected, state, className, ...rest }: FilterTabProps): import("react").JSX.Element;
export interface StatusBadgeProps {
    status: 'Counter' | 'Reserved' | 'Pending' | 'Closed';
    amount?: string;
    showAmount?: boolean;
    className?: string;
}
export declare function StatusBadge({ status, amount, showAmount, className }: StatusBadgeProps): import("react").JSX.Element;
export type FieldKind = 'Text' | 'Select' | 'Textarea';
export type FieldState = 'Default' | 'Filled' | 'Focus' | 'Error' | 'Disabled';
export interface FieldOption {
    value: string;
    label: string;
}
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
export declare function Field({ id, name, label, kind, state, value, defaultValue, placeholder, helpText, showHelp, errorText, options, inputType, inputMode, required, disabled, onValueChange, className }: FieldProps): import("react").JSX.Element;
