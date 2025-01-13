"use client"

import * as React from "react"
import { CalendarIcon } from 'lucide-react'
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns"
import { fr } from 'date-fns/locale'
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

export function CalendarDateRangePicker({
  className,
  date,
  setDate,
}: CalendarDateRangePickerProps) {

  const selectThisWeek = () => {
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 1 })
    const end = endOfWeek(today, { weekStartsOn: 1 }) > today ? today : endOfWeek(today, { weekStartsOn: 1 })
    setDate({ from: start, to: end })
  }

  const selectThisMonth = () => {
    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(today) > today ? today : endOfMonth(today)
    setDate({ from: start, to: end })
  }

  const selectLastWeek = () => {
    const today = new Date()
    const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7)
    setDate({
      from: lastWeekStart,
      to: endOfWeek(lastWeekStart, { weekStartsOn: 1 }),
    })
  }

  const selectLastMonth = () => {
    const today = new Date()
    const lastMonthStart = subDays(startOfMonth(today), 1)
    setDate({
      from: startOfMonth(lastMonthStart),
      to: endOfMonth(lastMonthStart),
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMMM yyyy", { locale: fr })} -{" "}
                  {format(date.to, "d MMMM yyyy", { locale: fr })}
                </>
              ) : (
                format(date.from, "d MMMM yyyy", { locale: fr })
              )
            ) : (
              <span>Sélectionner une date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={fr}
            disabled={{ after: new Date() }}
          />
          <div className="grid grid-cols-2 gap-2 p-2">
            <Button onClick={selectThisWeek} variant="outline" size="sm">Cette semaine</Button>
            <Button onClick={selectLastWeek} variant="outline" size="sm">Semaine dernière</Button>
            <Button onClick={selectThisMonth} variant="outline" size="sm">Ce mois</Button>
            <Button onClick={selectLastMonth} variant="outline" size="sm">Mois dernier</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

