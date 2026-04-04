import membersData from "@/data/members.json";
import groupsData from "@/data/groups.json";
import membershipsData from "@/data/memberships.json";
import type { Member, Group, Membership } from "@/lib/types";
import { TimelineChart } from "./timeline-chart";

export default function TimelinePage() {
  return (
    <div className="h-[calc(100vh-49px)] flex flex-col">
      <TimelineChart
        members={membersData as Member[]}
        groups={groupsData as Group[]}
        memberships={membershipsData as Membership[]}
      />
    </div>
  );
}
