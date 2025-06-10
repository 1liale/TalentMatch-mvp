"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronDown,
  Download,
  Search,
  Calendar,
  Mail,
  Phone,
  FileText,
  MoreVertical,
} from "lucide-react";
import { StatusBadge } from "@/components/base/status-badge";

export default function ApplicantsTable({ data, onRowClick, onStatusChange }) {
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplicants(data.map(applicant => applicant.id));
    } else {
      setSelectedApplicants([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedApplicants([...selectedApplicants, id]);
    } else {
      setSelectedApplicants(selectedApplicants.filter(itemId => itemId !== id));
    }
  };

  const filteredData = searchQuery 
    ? data.filter(applicant => 
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search applicants..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {selectedApplicants.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Message {selectedApplicants.length} selected
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedApplicants.length === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[300px]">Applicant</TableHead>
              <TableHead>Applied for</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No applicants found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(applicant => (
                <TableRow 
                  key={applicant.id} 
                  className={`${selectedApplicants.includes(applicant.id) ? "bg-muted/40" : ""} hover:bg-muted/30 cursor-pointer`}
                  onClick={() => onRowClick && onRowClick(applicant)}
                >
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedApplicants.includes(applicant.id)}
                      onCheckedChange={(checked) => handleSelectOne(checked, applicant.id)}
                      aria-label={`Select ${applicant.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={applicant.avatar} alt={applicant.name} />
                        <AvatarFallback className="text-sm">
                          {applicant.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-muted-foreground">{applicant.title}</div>
                        <StatusBadge status={applicant.status} />
                        
                        {applicant.tags && applicant.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {applicant.tags.map((tag, i) => (
                              <Badge 
                                variant="secondary" 
                                key={i} 
                                className="text-xs px-1 py-0 h-5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{applicant.jobPosition}</div>
                    <div className="text-sm text-muted-foreground">
                      Applied {applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStatusChange(applicant.id, "pending")}>
                          New Application
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(applicant.id, "reviewing")}>
                          In Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(applicant.id, "approved")}>
                          Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(applicant.id, "rejected")}>
                          Rejected
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{applicant.email}</span>
                      </div>
                      {applicant.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{applicant.phone}</span>
                        </div>
                      )}
                      {applicant.resume && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <a 
                            href={applicant.resume} 
                            className="text-sm text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Reject Application
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 