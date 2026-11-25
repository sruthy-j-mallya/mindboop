import type { LifeArea } from "@/apis/types";
import LifeAreaBadge from "@/components/commons/LifeArea/Badge";

import { INBOX_NAME } from "../constants";

type BoardHeadingProps = { id: string; lifeArea?: LifeArea };

// The list's name: the Inbox, or the area with its badge.
const BoardHeading = ({ id, lifeArea }: BoardHeadingProps) => {
  if (!lifeArea) {
    return (
      <h1 className="text-2xl font-semibold" id={id}>
        {INBOX_NAME}
      </h1>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <LifeAreaBadge className="size-8 rounded-lg text-lg" color={lifeArea.color} emoji={lifeArea.emoji} />
      <h1 className="min-w-0 truncate text-2xl font-semibold" id={id}>
        {lifeArea.name}
      </h1>
    </div>
  );
};

export default BoardHeading;
