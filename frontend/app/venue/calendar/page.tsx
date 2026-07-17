"use client";

import * as React from "react";
import { useVenueCalendar } from "@/hooks/use-venue-calendar";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Settings2, 
  Filter, 
  Calendar,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function VenueCalendarPage() {
  const {
    data,
    loading,
    error,
    currentDate,
    setCurrentDate,
    filters,
    timezone,
    setFilters,
    setTimezone,
    nextMonth,
    prevMonth,
    getDayEvents,
    updateAvailabilityRules,
    checkSlotConflict,
    refetch
  } = useVenueCalendar();

  // Dialog and input configurations
  const [editingSchedule, setEditingSchedule] = React.useState(false);
  const [tempSchedule, setTempSchedule] = React.useState<Record<string, { available: boolean; start: string; end: string }>>({});
  const [tempBuffer, setTempBuffer] = React.useState(0);

  // New Date rules inputs
  const [blockedInput, setBlockedInput] = React.useState("");
  const [maintInput, setMaintInput] = React.useState("");
  const [holidayInput, setHolidayInput] = React.useState("");

  // Conflict helper inputs
  const [conflictDate, setConflictDate] = React.useState("");
  const [conflictStart, setConflictStart] = React.useState("10:00");
  const [conflictEnd, setConflictEnd] = React.useState("14:00");
  const [conflictResult, setConflictResult] = React.useState<{ conflict: boolean; reason: string | null } | null>(null);
  const [checking, setChecking] = React.useState(false);

  // Initialize schedule editor values
  React.useEffect(() => {
    if (data) {
      setTempSchedule(data.weekly_schedule);
      setTempBuffer(data.booking_buffer_time);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-text-secondary animate-pulse">Loading availability calendar...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState 
          title="Calendar Load Failure"
          message={error || "Could not retrieve space availability settings."} 
          onRetry={refetch}
        />
      </div>
    );
  }

  // Monthly grid mapping math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); 
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const paddedDaysStart = Array.from({ length: startDayOfWeek }, (_, i) => {
    const d = prevMonthTotalDays - startDayOfWeek + 1 + i;
    return { day: d, isCurrentMonth: false, date: new Date(year, month - 1, d) };
  });

  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
    const d = i + 1;
    return { day: d, isCurrentMonth: true, date: new Date(year, month, d) };
  });

  const totalGridCells = paddedDaysStart.length + currentMonthDays.length;
  const remainingCells = totalGridCells <= 35 ? 35 - totalGridCells : 42 - totalGridCells;
  
  const paddedDaysEnd = Array.from({ length: remainingCells }, (_, i) => {
    const d = i + 1;
    return { day: d, isCurrentMonth: false, date: new Date(year, month + 1, d) };
  });

  const calendarCells = [...paddedDaysStart, ...currentMonthDays, ...paddedDaysEnd];

  const formatIsoDate = (d: Date) => {
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, "0");
    const dayStr = String(d.getDate()).padStart(2, "0");
    return `${yearStr}-${monthStr}-${dayStr}`;
  };

  const handleConflictCheck = async () => {
    if (!conflictDate) {
      toast.error("Please pick a date for conflict checking.");
      return;
    }
    setChecking(true);
    const result = await checkSlotConflict(conflictDate, conflictStart, conflictEnd);
    setConflictResult(result);
    setChecking(false);
  };

  const handleSaveSchedule = async () => {
    try {
      await updateAvailabilityRules({
        weekly_schedule: tempSchedule,
        blocked_dates: data.blocked_dates,
        maintenance_days: data.maintenance_days,
        public_holidays: data.public_holidays,
        booking_buffer_time: Number(tempBuffer)
      });
      setEditingSchedule(false);
    } catch {}
  };

  const handleAddBlockedDate = async () => {
    if (!blockedInput) return;
    try {
      const updatedBlocked = [...data.blocked_dates, blockedInput].sort();
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: updatedBlocked,
        maintenance_days: data.maintenance_days,
        public_holidays: data.public_holidays,
        booking_buffer_time: data.booking_buffer_time
      });
      setBlockedInput("");
    } catch {}
  };

  const handleRemoveBlockedDate = async (blockedDate: string) => {
    try {
      const updatedBlocked = data.blocked_dates.filter(d => d !== blockedDate);
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: updatedBlocked,
        maintenance_days: data.maintenance_days,
        public_holidays: data.public_holidays,
        booking_buffer_time: data.booking_buffer_time
      });
    } catch {}
  };

  const handleAddMaintenanceDay = async () => {
    if (!maintInput) return;
    try {
      const updatedMaint = [...data.maintenance_days, maintInput].sort();
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: data.blocked_dates,
        maintenance_days: updatedMaint,
        public_holidays: data.public_holidays,
        booking_buffer_time: data.booking_buffer_time
      });
      setMaintInput("");
    } catch {}
  };

  const handleRemoveMaintenanceDay = async (maintDate: string) => {
    try {
      const updatedMaint = data.maintenance_days.filter(d => d !== maintDate);
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: data.blocked_dates,
        maintenance_days: updatedMaint,
        public_holidays: data.public_holidays,
        booking_buffer_time: data.booking_buffer_time
      });
    } catch {}
  };

  const handleAddHoliday = async () => {
    if (!holidayInput) return;
    try {
      const updatedHols = [...data.public_holidays, holidayInput].sort();
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: data.blocked_dates,
        maintenance_days: data.maintenance_days,
        public_holidays: updatedHols,
        booking_buffer_time: data.booking_buffer_time
      });
      setHolidayInput("");
    } catch {}
  };

  const handleRemoveHoliday = async (holDate: string) => {
    try {
      const updatedHols = data.public_holidays.filter(d => d !== holDate);
      await updateAvailabilityRules({
        weekly_schedule: data.weekly_schedule,
        blocked_dates: data.blocked_dates,
        maintenance_days: data.maintenance_days,
        public_holidays: updatedHols,
        booking_buffer_time: data.booking_buffer_time
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Availability Calendar</h1>
          <p className="text-xs text-text-secondary">Configure daily operating hours, buffer thresholds, maintenance sessions, and check booking slots conflicts.</p>
        </div>

        {/* Timezone and Setup */}
        <div className="flex items-center gap-3 bg-bg-elevated/45 border border-border/80 p-2 rounded-xl text-xs text-text-primary shrink-0 shadow">
          <Globe className="h-4 w-4 text-primary" />
          <span className="font-semibold">Timezone:</span>
          <select 
            value={timezone} 
            onChange={e => setTimezone(e.target.value)}
            className="bg-transparent border-0 font-bold focus:ring-0 text-primary cursor-pointer text-xs"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Monthly Calendar View */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-3xl shadow-xl overflow-hidden">
            
            {/* Calendar Controls */}
            <div className="p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-elevated/10">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{MONTHS[month]} {year}</span>
              </h2>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-9 w-9">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs font-semibold h-9 px-3">
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-9 w-9">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="p-4 md:p-6">
              
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-text-secondary">
                {WEEKDAYS.map(day => <span key={day} className="py-1">{day}</span>)}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-2 min-h-[380px] md:min-h-[460px]">
                {calendarCells.map((cell, idx) => {
                  const dateStr = formatIsoDate(cell.date);
                  const dayEvents = getDayEvents(dateStr);
                  const isToday = formatIsoDate(new Date()) === dateStr;

                  return (
                    <div 
                      key={idx}
                      className={`border rounded-xl p-1.5 md:p-2.5 flex flex-col justify-between transition-all duration-200 min-h-[64px] sm:min-h-[84px] md:min-h-[96px] ${
                        cell.isCurrentMonth ? "bg-bg-elevated/15 border-border/80 hover:border-primary/40" : "bg-transparent border-border/30 opacity-40"
                      } ${isToday ? "ring-2 ring-primary/80 ring-offset-2 ring-offset-bg-card" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${cell.isCurrentMonth ? "text-white" : "text-text-muted"}`}>
                          {cell.day}
                        </span>
                        {isToday && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>

                      {/* Display daily events badges */}
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-16 md:max-h-20 scrollbar-none">
                        {dayEvents.map((evt, i) => (
                          <div 
                            key={i} 
                            title={`${evt.title}\n${evt.subtitle || ""}`}
                            className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border truncate cursor-default leading-tight ${evt.color}`}
                          >
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </Card>
        </div>

        {/* Right Side: Filters, Operating hours, Conflicts and Lists */}
        <div className="space-y-6">

          {/* Calendar filters */}
          <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-primary" />
                Calendar Filters
              </h3>
              
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>Confirmed Bookings</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={filters.bookings} 
                    onChange={e => setFilters(prev => ({ ...prev, bookings: e.target.checked }))}
                    className="rounded border-border bg-bg-card text-primary h-4.5 w-4.5"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span>Blocked Dates</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={filters.blocked} 
                    onChange={e => setFilters(prev => ({ ...prev, blocked: e.target.checked }))}
                    className="rounded border-border bg-bg-card text-primary h-4.5 w-4.5"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span>Maintenance Days</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={filters.maintenance} 
                    onChange={e => setFilters(prev => ({ ...prev, maintenance: e.target.checked }))}
                    className="rounded border-border bg-bg-card text-primary h-4.5 w-4.5"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Public Holidays</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={filters.holidays} 
                    onChange={e => setFilters(prev => ({ ...prev, holidays: e.target.checked }))}
                    className="rounded border-border bg-bg-card text-primary h-4.5 w-4.5"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Operational Hours Rules Widget */}
          <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Settings2 className="h-4.5 w-4.5 text-primary" />
                  Space Rules
                </h3>
                {!editingSchedule ? (
                  <button onClick={() => setEditingSchedule(true)} className="text-[10px] font-bold text-primary hover:underline">
                    Edit Rules
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveSchedule} className="text-[10px] font-bold text-emerald-400 hover:underline">
                      Save
                    </button>
                    <button onClick={() => {
                      setTempSchedule(data.weekly_schedule);
                      setTempBuffer(data.booking_buffer_time);
                      setEditingSchedule(false);
                    }} className="text-[10px] font-bold text-error hover:underline">
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!editingSchedule ? (
                <div className="space-y-2 text-xs text-text-secondary pt-1">
                  <div className="flex justify-between items-center">
                    <span>Booking Setup Buffer:</span>
                    <span className="font-bold text-text-primary">{data.booking_buffer_time} Hours</span>
                  </div>
                  <div className="border-t border-border/30 pt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(data.weekly_schedule).map(day => {
                      const item = data.weekly_schedule[day];
                      return (
                        <div key={day} className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-text-primary">{day}</span>
                          <span>{item.available ? `${item.start} - ${item.end}` : "Closed"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="buffer_time" className="text-[11px]">Buffer Hours</Label>
                    <Input 
                      id="buffer_time"
                      type="number"
                      value={tempBuffer}
                      onChange={e => setTempBuffer(Number(e.target.value))}
                      className="h-8 text-xs text-center"
                    />
                  </div>
                  <div className="space-y-2 border-t border-border/30 pt-3 max-h-48 overflow-y-auto pr-1">
                    {Object.keys(tempSchedule).map(day => {
                      const item = tempSchedule[day];
                      return (
                        <div key={day} className="flex flex-col gap-1 text-[11px] pb-2 border-b border-border/20 last:border-b-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-text-primary">{day}</span>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={!!item.available}
                                onChange={e => setTempSchedule(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day], available: e.target.checked }
                                }))}
                                className="rounded border-border text-primary h-3.5 w-3.5"
                              />
                              <span>Open</span>
                            </label>
                          </div>
                          {item.available && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Input 
                                type="text"
                                className="h-7 text-center text-[10px]"
                                value={item.start}
                                onChange={e => setTempSchedule(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day], start: e.target.value }
                                }))}
                              />
                              <span className="text-text-muted">to</span>
                              <Input 
                                type="text"
                                className="h-7 text-center text-[10px]"
                                value={item.end}
                                onChange={e => setTempSchedule(prev => ({
                                  ...prev,
                                  [day]: { ...prev[day], end: e.target.value }
                                }))}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive booking slot conflict checks */}
          <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-primary" />
                Slot Conflict Evaluator
              </h3>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="check_date">Event Date</Label>
                  <Input 
                    id="check_date" 
                    type="date"
                    value={conflictDate}
                    onChange={e => {
                      setConflictDate(e.target.value);
                      setConflictResult(null);
                    }}
                    className="h-9 text-xs" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="check_start">Start Time</Label>
                    <Input 
                      id="check_start" 
                      type="time" 
                      value={conflictStart}
                      onChange={e => {
                        setConflictStart(e.target.value);
                        setConflictResult(null);
                      }}
                      className="h-9 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="check_end">End Time</Label>
                    <Input 
                      id="check_end" 
                      type="time" 
                      value={conflictEnd}
                      onChange={e => {
                        setConflictEnd(e.target.value);
                        setConflictResult(null);
                      }}
                      className="h-9 text-xs" 
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleConflictCheck} 
                  disabled={checking}
                  className="w-full bg-primary hover:bg-primary/95 text-white text-xs h-9 font-semibold"
                >
                  {checking ? "Checking..." : "Evaluate Conflicts"}
                </Button>

                {conflictResult && (
                  <div className={`p-3 rounded-xl border text-xs flex gap-2 items-start ${
                    conflictResult.conflict 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    {conflictResult.conflict ? (
                      <>
                        <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Slot Blocked!</p>
                          <p className="text-[10px] mt-0.5 leading-relaxed text-text-secondary">{conflictResult.reason}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Slot Available!</p>
                          <p className="text-[10px] mt-0.5 text-text-secondary">No overlaps detected. Suitable for bookings.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manage Blocked Dates / Maintenance / Holidays lists */}
          <Card className="bg-bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Blocked & Maintenance Days</h3>

              {/* Block dates input */}
              <div className="space-y-2 border-b border-border/25 pb-3">
                <Label className="text-[11px]">Block Custom Date</Label>
                <div className="flex gap-2">
                  <Input type="date" value={blockedInput} onChange={e => setBlockedInput(e.target.value)} className="h-8 text-xs" />
                  <Button onClick={handleAddBlockedDate} className="bg-primary text-white h-8 px-3 text-xs"><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {data.blocked_dates.map(d => (
                    <Badge key={d} variant="outline" className="text-[9px] py-0.5 border-red-500/20 text-red-400 pr-1 flex items-center gap-1">
                      <span>{d}</span>
                      <button onClick={() => handleRemoveBlockedDate(d)} className="hover:text-red-300 font-bold ml-0.5">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Maintenance input */}
              <div className="space-y-2 border-b border-border/25 pb-3">
                <Label className="text-[11px]">Schedule Maintenance Date</Label>
                <div className="flex gap-2">
                  <Input type="date" value={maintInput} onChange={e => setMaintInput(e.target.value)} className="h-8 text-xs" />
                  <Button onClick={handleAddMaintenanceDay} className="bg-primary text-white h-8 px-3 text-xs"><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {data.maintenance_days.map(d => (
                    <Badge key={d} variant="outline" className="text-[9px] py-0.5 border-amber-500/20 text-amber-400 pr-1 flex items-center gap-1">
                      <span>{d}</span>
                      <button onClick={() => handleRemoveMaintenanceDay(d)} className="hover:text-amber-300 font-bold ml-0.5">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Holiday input */}
              <div className="space-y-2 pb-1">
                <Label className="text-[11px]">Set Public Holiday Date</Label>
                <div className="flex gap-2">
                  <Input type="date" value={holidayInput} onChange={e => setHolidayInput(e.target.value)} className="h-8 text-xs" />
                  <Button onClick={handleAddHoliday} className="bg-primary text-white h-8 px-3 text-xs"><Plus className="h-3.5 w-3.5" /></Button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {data.public_holidays.map(d => (
                    <Badge key={d} variant="outline" className="text-[9px] py-0.5 border-emerald-500/20 text-emerald-400 pr-1 flex items-center gap-1">
                      <span>{d}</span>
                      <button onClick={() => handleRemoveHoliday(d)} className="hover:text-emerald-300 font-bold ml-0.5">×</button>
                    </Badge>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
