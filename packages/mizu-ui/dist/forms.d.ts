import { type ReactNode } from 'react';
import { type FieldOption } from './controls.js';
export interface MessageComposerProps {
    initialDraft?: string;
    state?: 'Default' | 'Sending' | 'Error';
    onSend: (message: string) => void | Promise<void>;
    className?: string;
}
export declare function MessageComposer({ initialDraft, state, onSend, className }: MessageComposerProps): import("react").JSX.Element;
export interface OfferFormValue {
    amount: string;
    handover: string;
    message: string;
}
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
export declare function OfferForm({ askingPrice, specimen, reference, currency, handoverOptions, initialValue, onSubmit, className }: OfferFormProps): import("react").JSX.Element;
export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    body: ReactNode;
    viewport?: 'Desktop' | 'Mobile';
    className?: string;
}
export declare function Dialog({ open, onClose, title, body, viewport, className }: DialogProps): import("react").JSX.Element;
