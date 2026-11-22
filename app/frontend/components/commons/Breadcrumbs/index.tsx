import type { Breadcrumb } from "@/apis/types";

import { formatBreadcrumbTime } from "./utils";

type BreadcrumbsProps = { breadcrumbs: Breadcrumb[] };

// The notes left on each bail out, newest first, as a timeline: a yellow rail with a dot per breadcrumb.
const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  if (breadcrumbs.length === 0) return null;

  return (
    <section aria-labelledby="breadcrumbs-heading" className="flex flex-col gap-4">
      <h3
        id="breadcrumbs-heading"
        className="text-xs font-medium tracking-wider text-muted-foreground uppercase"
      >
        Breadcrumbs
      </h3>
      <ol className="flex flex-col">
        {breadcrumbs.map(({ id, completedDescription, restartDescription, createdAt }, index) => (
          <li key={id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* The rail runs from this dot down to the next one, so it stops at the oldest breadcrumb. */}
            {index < breadcrumbs.length - 1 && (
              <span aria-hidden className="absolute top-4 bottom-0 left-[7px] w-0.5 bg-brand-yellow/50" />
            )}
            <span
              aria-hidden
              className="relative mt-0.5 size-4 shrink-0 border-4 border-background bg-brand-yellow ring-2 ring-brand-yellow"
            />
            <div className="flex min-w-0 flex-col items-start gap-2">
              <time
                className="rounded-lg bg-brand-yellow px-2 py-0.5 text-xs font-semibold text-brand-purple-dark"
                dateTime={createdAt}
              >
                {formatBreadcrumbTime(createdAt)}
              </time>
              <dl className="flex flex-col gap-1.5 text-sm">
                <div>
                  <dt className="font-medium">Pick up from</dt>
                  <dd className="wrap-anywhere whitespace-pre-line text-muted-foreground">
                    {restartDescription}
                  </dd>
                </div>
                {completedDescription && (
                  <div>
                    <dt className="font-medium">Got done</dt>
                    <dd className="wrap-anywhere whitespace-pre-line text-muted-foreground">
                      {completedDescription}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default Breadcrumbs;
