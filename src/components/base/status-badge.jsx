import { Badge } from "@/components/ui/badge";

export const StatusBadge = ({ status }) => {
  const statusMap = {
    // Job Statuses
    active: { label: "Active", variant: "success" },
    paused: { label: "Paused", variant: "secondary" },
    closed: { label: "Closed", variant: "outline" },
    filled: { label: "Filled", variant: "default" },

    // Application Statuses
    pending:    { label: "Applied",       variant: "secondary" },
    reviewing:  { label: "In Review",     variant: "default" },
    interview:  { label: "Interview",     variant: "primary" },
    offer:      { label: "Offer Recieved", variant: "success" },
    approved:   { label: "Approved",      variant: "success" },
    rejected:   { label: "Rejected",      variant: "destructive" },
    completed:  { label: "Completed",     variant: "outline" },
  };

  const { label, variant } = statusMap[status?.toLowerCase()] || { label: status, variant: "secondary" };

  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}; 