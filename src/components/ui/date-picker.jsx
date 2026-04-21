import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import "react-day-picker/dist/style.css";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function DatePicker({ value, onChange, ...props }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-[54px] w-full justify-start rounded-2xl border border-[#ddd4c3] bg-[#f8f5ef] px-4 py-3 text-left text-xl font-normal text-[#425642] shadow-[0_5px_18px_rgba(75,84,63,0.08)] focus:border-[#89a171]",
            !value && "text-muted-foreground"
          )}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-2xl border-[#ddd4c3] bg-[#fbf9f4] p-0">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          disabled={{ before: today }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-medium text-[#354737]",
            nav: "space-x-1 flex items-center",
            nav_button:
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[#354737]",
            day_selected:
              "bg-[#89a171] text-white hover:bg-[#89a171] focus:bg-[#89a171] rounded-full",
            day_today: "bg-[#f2eee6] text-[#354737] rounded-full",
            day_disabled: "text-gray-400 opacity-50",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}