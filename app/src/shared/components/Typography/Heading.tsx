import React from 'react';
import styles from '../../../../styles/shared/typography/Heading.module.css';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 2,
  size,
  weight = 'bold',
  color = 'primary',
  align = 'left',
  className = '',
}) => {
  // Default size based on heading level if not specified
  const defaultSize =
    size || (['3xl', '2xl', 'xl', 'lg', 'md', 'sm'][level - 1] as HeadingProps['size']);

  const headingClass = `
    ${styles.heading}
    ${styles[`size-${defaultSize}`]}
    ${styles[`weight-${weight}`]}
    ${styles[`color-${color}`]}
    ${styles[`align-${align}`]}
    ${className}
  `.trim();

  const props = { className: headingClass };

  switch (level) {
    case 1:
      return <h1 {...props}>{children}</h1>;
    case 2:
      return <h2 {...props}>{children}</h2>;
    case 3:
      return <h3 {...props}>{children}</h3>;
    case 4:
      return <h4 {...props}>{children}</h4>;
    case 5:
      return <h5 {...props}>{children}</h5>;
    case 6:
      return <h6 {...props}>{children}</h6>;
    default:
      return <h2 {...props}>{children}</h2>;
  }
};

export default Heading;
