"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TypographyP,
  TypographyH3,
  TypographyMuted,
} from "@/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Plus, 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  ExternalLink,
  Clock
} from "lucide-react";
import { StatusBadge } from "@/components/base/status-badge";

// KanbanColumn component that renders a single column
const KanbanColumn = ({ column, items, index, totalItems, renderItem, onCardClick }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypographyH3 className="text-base font-medium">
            {column.title}
          </TypographyH3>
          <Badge variant="secondary" className="rounded-full font-normal text-xs">
            {items.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[calc(100vh-280px)] p-3 rounded-lg transition-colors h-full overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-muted/60' : 'bg-muted/30'
            }`}
            style={{ maxHeight: 'calc(100vh - 280px)' }}
          >
            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={String(item.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${
                      snapshot.isDragging ? 'rotate-1 opacity-90' : ''
                    }`}
                  >
                    {renderItem ? renderItem(item) : <ApplicationCard item={item} onCardClick={onCardClick} />}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

// Unified ApplicationCard component that works for both applicants and applications views
const ApplicationCard = ({ item, onCardClick }) => {
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'reviewing': return 'default';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  }

  // Determine if this is an applicant view (has name) or application view (has job_title)
  const isApplicantView = item.name && !item.job_title;
  const isApplicationView = item.job_title && item.company_name;

  return (
    <Card 
      className="p-2 bg-card shadow-sm hover:shadow-md transition-shadow mb-3 cursor-pointer group"
      onClick={() => onCardClick(item)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {isApplicantView ? (
                <>
                  <AvatarImage src={item.avatar} alt={item.name} />
                  <AvatarFallback className="text-xs">{item.name ? item.name.charAt(0) : 'U'}</AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src={item.company_logo} alt={item.company_name} />
                  <AvatarFallback className="text-xs">{item.company_name?.charAt(0) || 'C'}</AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <TypographyP className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {isApplicantView ? item.name : item.job_title}
              </TypographyP>
              <span className="text-xs text-muted-foreground truncate block">
                {isApplicantView ? item.title : item.company_name}
              </span>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>
        
        {/* Compact info row for applicants */}
        {isApplicantView && (
          <div className="flex flex-wrap gap-1 text-xs">
            {/* Location */}
            {item.location && (
              <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                📍 {item.location}
              </span>
            )}
            {/* Experience */}
            {item.experience_level && (
              <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                🎓 {item.experience_level}
              </span>
            )}
          </div>
        )}

        {/* Location for applications only */}
        {!isApplicantView && item.job_location && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground w-fit">
            📍 {item.job_location}
          </span>
        )}

        {/* Show skills/tags for applicants, match score for applications */}
        {isApplicantView && item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag, i) => (
              <Badge variant="secondary" key={i} className="text-xs py-0 h-5">
                {tag}
              </Badge>
            ))}
             {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs py-0 h-5">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Show applied position for applicants */}
        {isApplicantView && item.jobPosition && (
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded w-fit">
            Applied for: {item.jobPosition}
          </span>
        )}

        {isApplicationView && item.match_score && (
          <div className="text-xs font-medium text-primary">
            Match Score: {item.match_score}%
          </div>
        )}
        
        <div className="text-xs text-muted-foreground flex items-center justify-between gap-1.5 pt-1 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.appliedDate ? new Date(item.appliedDate).toLocaleDateString() : 'N/A'}
            </div>
            {item.resumeUrl && (
              <a 
                href={item.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-3 w-3" />
                CV
              </a>
            )}
        </div>
      </div>
    </Card>
  );
};

// Main KanbanBoard component
export default function KanbanBoard({ columns, items, onDragEnd, renderItem, onCardClick }) {
  // Group items by column
  const groupedItems = columns.reduce((result, column) => {
    if (column.id === 'completed') {
      result[column.id] = items.filter(item => 
        item.status === 'offer' || 
        item.status === 'approved' || 
        item.status === 'rejected' || 
        item.status === 'completed'
      );
    } else {
      result[column.id] = items.filter(item => item.status === column.id);
    }
    return result;
  }, {});

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={groupedItems[column.id] || []}
            index={index}
            totalItems={items.length}
            renderItem={renderItem}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
} 