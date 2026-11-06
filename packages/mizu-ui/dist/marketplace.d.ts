import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { type StatusBadgeProps } from './controls.js';
import { type MediaKind } from './media.js';
export interface BrandProps {
    size?: 'Desktop' | 'Mobile';
    href?: string;
    className?: string;
}
export declare function Brand({ size, href, className }: BrandProps): import("react").JSX.Element;
export interface HeaderRoute {
    label: string;
    href: string;
    count?: string;
}
export interface HeaderProps {
    viewport?: 'Desktop' | 'Mobile';
    brandHref?: string;
    routes?: HeaderRoute[];
    currentHref?: string;
    onMenuClick?: () => void;
    className?: string;
}
export declare function Header({ viewport, brandHref, routes, currentHref, onMenuClick, className }: HeaderProps): import("react").JSX.Element;
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
export declare function SpecimenCard({ title, metadata, reference, showReference, layout, state, media, mediaKind, mediaAlt, className, ...rest }: SpecimenCardProps): import("react").JSX.Element;
export interface FactRowProps {
    label: string;
    value: string;
    className?: string;
}
export declare function FactRow({ label, value, className }: FactRowProps): import("react").JSX.Element;
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
export declare function SpecimenDetails({ title, price, seller, description, facts, saved, onSave, onMakeOffer, className }: SpecimenDetailsProps): import("react").JSX.Element;
export interface MessageProps {
    message: string;
    timestamp?: string;
    direction?: 'Received' | 'Sent';
    className?: string;
}
export declare function Message({ message, timestamp, direction, className }: MessageProps): import("react").JSX.Element;
export interface OfferSummaryProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
    title: string;
    seller: string;
    status: Extract<StatusBadgeProps['status'], 'Counter' | 'Reserved' | 'Pending'>;
    amount?: string;
    media?: ReactNode;
    mediaKind?: MediaKind;
    mediaAlt?: string;
}
export declare function OfferSummary({ title, seller, status, amount, media, mediaKind, mediaAlt, className, ...rest }: OfferSummaryProps): import("react").JSX.Element;
export interface DepartmentLink {
    label: string;
    href: string;
}
export interface DepartmentAccordionProps {
    label: string;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
    items: DepartmentLink[];
    className?: string;
}
export declare function DepartmentAccordion({ label, expanded, defaultExpanded, onExpandedChange, items, className }: DepartmentAccordionProps): import("react").JSX.Element;
export interface EmptyStateProps {
    reason?: 'Saved' | 'Results';
    onAction?: () => void;
    className?: string;
}
export declare function EmptyState({ reason, onAction, className }: EmptyStateProps): import("react").JSX.Element;
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
export declare function ImageUpload({ state, fileName, label, errorText, onFileSelect, onValidationError, disabled, className }: ImageUploadProps): import("react").JSX.Element;
