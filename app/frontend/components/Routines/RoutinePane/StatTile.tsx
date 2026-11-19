type StatTileProps = { label: string; value: string };

const StatTile = ({ label, value }: StatTileProps) => (
  <div className="grid gap-1 rounded-2xl bg-muted/50 p-4">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
  </div>
);

export default StatTile;
