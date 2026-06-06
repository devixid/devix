"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEstimatorLeadStatus } from "@/actions/estimator-leads";
import { DropdownSelect } from "@/components/molecules/DropdownSelect";
import type { EstimatorLeadStatus } from "@prisma/client";

const OPTIONS: { value: EstimatorLeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CONVERTED", label: "Converted" },
  { value: "CLOSED", label: "Closed" },
];

export default function LeadStatusActions({
  id,
  status,
}: {
  id: string;
  status: EstimatorLeadStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor="lead-status"
        className="text-[10px] tracking-wider text-zinc-500 uppercase"
      >
        Update Status
      </label>
      <DropdownSelect
        id="lead-status"
        value={status}
        options={OPTIONS}
        disabled={isPending}
        variant="dark"
        onChange={(nextStatus) => {
          startTransition(async () => {
            await updateEstimatorLeadStatus(id, nextStatus);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
