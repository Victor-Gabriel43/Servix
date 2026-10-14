interface SectionHeadingProps {
  index: string;
  label: string;
  title: string;
  lead?: string;
  id?: string;
  className?: string;
}

export function SectionHeading({ index, label, title, lead, id, className = "" }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="eyebrow" data-reveal="fade">
        <span className="text-accent">{index}</span>
        {label}
      </p>
      <h2 id={id} className="text-gradient mt-5 pb-1 text-title font-semibold" data-reveal>
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 max-w-xl text-lead text-muted" data-reveal>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
