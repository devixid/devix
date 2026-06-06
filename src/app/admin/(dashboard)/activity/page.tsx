import { getActivityLogs } from "@/actions/admin/activity";

export const metadata = { title: "Activity Log — Devix Operations" };

interface Props {
  searchParams: Promise<{
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
}

export default async function ActivityPage({ searchParams }: Props) {
  const params = await searchParams;
  const { items, total, page } = await getActivityLogs({
    entityType: params.entityType,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Audit
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Activity Log
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{total} events recorded</p>
      </div>

      <div className="divide-y divide-zinc-900 border border-zinc-800 bg-[#0F0F0F]">
        {items.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No activity yet.</div>
        ) : (
          items.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-200">
                  <span className="text-[#C8A96E]">{log.action}</span>
                  {" · "}
                  <span className="text-zinc-500">{log.entityType}</span>
                  {log.entityId && (
                    <span className="font-mono text-xs text-zinc-600"> #{log.entityId.slice(0, 8)}</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">by {log.actorEmail}</p>
              </div>
              <time className="text-[11px] text-zinc-600">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
          ))
        )}
      </div>

      {total > 30 && (
        <p className="text-center text-xs text-zinc-500">Page {page}</p>
      )}
    </div>
  );
}
