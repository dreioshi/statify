export default function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
