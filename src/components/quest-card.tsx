import Link from "next/link";

type QuestCardProps = {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  category: string | null;
  href: string;
  statusLabel?: string;
};

export function QuestCard({
  id,
  title,
  description,
  pointValue,
  category,
  href,
  statusLabel,
}: QuestCardProps) {
  return (
    <Link
      key={id}
      href={href}
      className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:border-foreground"
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          {category ? (
            <span className="text-xs uppercase tracking-wide text-muted">{category}</span>
          ) : (
            <span />
          )}
          {statusLabel && <StatusBadge label={statusLabel} />}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{description}</p>
      </div>
      <div className="mt-4 text-sm font-medium">{pointValue} pts</div>
    </Link>
  );
}

export function StatusBadge({ label }: { label: string }) {
  const styles: Record<string, string> = {
    PENDING: "text-warning border-warning/40",
    APPROVED: "text-success border-success/40",
    REJECTED: "text-danger border-danger/40",
  };

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${
        styles[label] ?? "text-muted border-border"
      }`}
    >
      {label.toLowerCase()}
    </span>
  );
}
