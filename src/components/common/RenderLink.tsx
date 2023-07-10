import { HTMLAttributes, ReactNode } from 'react';
import Link from './Link';

export const RenderLink = ({
  attributes,
  content,
}: {
  attributes: HTMLAttributes<HTMLAnchorElement> & { href: string };
  content: ReactNode;
}) => {
  const { href, ...props } = attributes;
  return (
    <Link href={href} {...props}>
      {content}
    </Link>
  );
};
