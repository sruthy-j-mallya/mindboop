type StatTileProps = { label: string; value: string };

const StatTile = ({ label, value }: StatTileProps) => (
  <div className="grid min-w-0 content-start gap-0.5 rounded-xl bg-muted/50 px-3 py-2.5 sm:px-4 sm:py-3">
    <dt className="text-xs text-muted-foreground sm:text-sm">{label}</dt>
    <dd className="text-base font-semibold tabular-nums sm:text-xl">{value}</dd>
  </div>
);

export default StatTile;
