import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({ date, setDate, className, disabled, placeholder = "Pick a date" }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelectDate = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    } else {
      setDate(undefined); 
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 z-50" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setIsOpen(false);
        }}
        onInteractOutside={(e) => {
          // Only prevent if clicking inside the calendar
          if (e.target.closest('[role="grid"]')) {
            e.preventDefault();
          }
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <div 
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
        <Calendar
          mode="single"
          selected={date}
            onSelect={(selectedDate) => {
              handleSelectDate(selectedDate);
              // Close the popover after selection
              setTimeout(() => setIsOpen(false), 100);
            }}
          disabled={disabled}
          initialFocus
            className="rounded-md border"
        />
        </div>
      </PopoverContent>
    </Popover>
  );
}