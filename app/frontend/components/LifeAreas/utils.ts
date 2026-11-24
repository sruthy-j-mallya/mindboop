export const getAddAreasLabel = (count: number) => {
  if (count === 0) return "Add areas";

  return count === 1 ? "Add 1 area" : `Add ${count} areas`;
};
