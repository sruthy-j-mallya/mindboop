// The items in the order of `ids`; any not listed keep their place after them.
export const orderByIds = <Item extends { id: string }>(items: Item[], ids: string[]) => {
  const rank = ({ id }: Item) => {
    const index = ids.indexOf(id);

    return index === -1 ? ids.length : index;
  };

  return items.toSorted((a, b) => rank(a) - rank(b));
};

export const joinIds = (items: { id: string }[]) => items.map(({ id }) => id).join(",");
