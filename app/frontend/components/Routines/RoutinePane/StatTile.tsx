type StatTileProps = { label: string; value: string };

const StatTile = ({ label, value }: StatTileProps) => (
  <div className="grid gap-0.5 rounded-xl bg-muted/50 px-4 py-3">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-xl font-semibold tabular-nums">{value}</dd>
  </div>
);

export default StatTile;
