import { ReactNode } from 'react';

/** Consistent page title block: heading + subtitle on the left, actions on the right. */
export default function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
