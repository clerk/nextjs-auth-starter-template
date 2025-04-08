import React from 'react';

interface ResourceGridProps {
  type: 'venue' | 'vehicle' | 'team';
  items: any[];
  onDragStart: (item: any) => void;
  filterOptions: any[];
}

export function ResourceGrid({ type, items, onDragStart, filterOptions }: ResourceGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => (
        <div 
          key={item.id}
          draggable
          onDragStart={(e) => onDragStart(item)}
          className="p-4 border rounded-lg cursor-move hover:border-primary"
        >
          {/* Render item content based on type */}
          {item.name}
        </div>
      ))}
    </div>
  );
}