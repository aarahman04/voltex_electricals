export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[4px] bg-plate">
      <div className="aspect-square animate-pulse bg-plate-dim" />
      <div className="flex flex-col gap-2 border-t border-ink/10 px-4 py-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded-sm bg-plate-dim" />
        <div className="h-2.5 w-1/3 animate-pulse rounded-sm bg-plate-dim" />
      </div>
    </div>
  );
}
