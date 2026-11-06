import type { HTMLAttributes } from 'react';

export type IconName = 'close' | 'plus' | 'chevron' | 'down' | 'menu' | 'upload' | 'check' | 'spinner';
export type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & { name: IconName };

const paths: Record<IconName, string> = {
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
export function Icon({ name, className = '', ...rest }: IconProps) {
  return <span className={`mizu-icon ${name === 'spinner' ? 'mizu-icon--spinner ' : ''}${className}`} aria-hidden="true" {...rest}>
    <span className="mizu-icon__shape" style={{ maskImage: `url("${paths[name]}")`, WebkitMaskImage: `url("${paths[name]}")` }} />
  </span>;
}

export const IconClose = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="close" />;
export const IconPlus = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="plus" />;
export const IconChevron = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="chevron" />;
export const IconDown = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="down" />;
export const IconMenu = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="menu" />;
export const IconUpload = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="upload" />;
export const IconCheck = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="check" />;
export const IconSpinner = (props: Omit<IconProps, 'name'>) => <Icon {...props} name="spinner" />;
