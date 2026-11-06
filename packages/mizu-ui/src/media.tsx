import type { HTMLAttributes } from 'react';

export type MediaKind = 'Koi' | 'Ceramic' | 'Bonsai';
export interface MediaProps extends HTMLAttributes<HTMLDivElement> {
  kind: MediaKind;
  /** Required when the image conveys content. Use an empty string only for a decorative duplicate. */
  alt: string;
}

const paths: Record<MediaKind, string> = {
  Koi: new URL('./assets/koi.png', import.meta.url).href,
  Ceramic: new URL('./assets/ceramic.jpg', import.meta.url).href,
  Bonsai: new URL('./assets/bonsai.jpg', import.meta.url).href,
};

export function Media({ kind, alt, className = '', ...rest }: MediaProps) {
  return <div className={`mizu-media mizu-media--${kind.toLowerCase()} ${className}`} {...rest}>
    <img src={paths[kind]} alt={alt} />
  </div>;
}

export const MediaKoi = (props: Omit<MediaProps, 'kind'>) => <Media {...props} kind="Koi" />;
export const MediaCeramic = (props: Omit<MediaProps, 'kind'>) => <Media {...props} kind="Ceramic" />;
export const MediaBonsai = (props: Omit<MediaProps, 'kind'>) => <Media {...props} kind="Bonsai" />;
