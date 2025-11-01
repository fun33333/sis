"use client"

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { getStudentBehaviourRecords } from "@/lib/api"

type MetricKey =
  | "punctuality"
  | "obedience"
  | "classBehaviour"
  | "participation"
  | "homework"
  | "respect"

export interface StudentBehaviourModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string | number
  studentName?: string
  studentCode?: string
  onSubmit?: (payload: {
    weekStart: string
    weekEnd: string
    metrics: Record<MetricKey, number>
    notes?: string
    events?: Array<{
      name: string
      date?: string
      role?: string
      result?: string
      award?: string
      notes?: string
    }>
  }) => void
}

const METRIC_LABELS: Record<MetricKey, string> = {
  punctuality: "Punctuality",
  obedience: "Obedience",
  classBehaviour: "Class Behaviour",
  participation: "Event Participation",
  homework: "Homework",
  respect: "Respect",
}

// Short labels for tabs so text wraps nicely and avoids duplicates like "Class"
const TAB_LABELS: Record<MetricKey, string> = {
  punctuality: "Punctuality",
  obedience: "Obedience",
  classBehaviour: "Class Bhv.",
  participation: "Event Participation",
  homework: "Homework",
  respect: "Respect",
}

const SCORE_OPTIONS = [
  { label: "Needs Improvement", value: 1 },
  { label: "Fair", value: 2 },
  { label: "Good", value: 3 },
  { label: "Excellent", value: 4 },
]

export default function StudentBehaviourModal({ open, onOpenChange, studentId, studentName, studentCode, onSubmit }: StudentBehaviourModalProps) {
  // Compute current month weeks (Mon-Sat), skip Sundays
  const { monthLabel, weeks, currentWeekIndex } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const first = new Date(y, m, 1)
    const last = new Date(y, m + 1, 0)
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    const w: { start: string; end: string; label: string }[] = []
    let cursor = new Date(first)
    // Move cursor to Monday for first week (if Sun -> next day)
    const day = cursor.getDay() // 0 Sun .. 6 Sat
    if (day === 0) {
      cursor.setDate(cursor.getDate() + 1)
    } else if (day !== 1) {
      // move back to Monday of that week within month bounds
      cursor.setDate(cursor.getDate() - (day - 1))
      if (cursor < first) cursor = new Date(first)
    }
    while (cursor <= last) {
      const start = new Date(cursor)
      const end = new Date(start)
      // end Saturday
      const toSat = 6 - end.getDay()
      end.setDate(end.getDate() + toSat)
      if (end > last) end.setDate(last.getDate())
      w.push({
        start: toISO(start),
        end: toISO(end),
        label: `${start.toLocaleString('en-US',{month:'short',day:'2-digit'})} – ${end.toLocaleString('en-US',{month:'short',day:'2-digit'})}`
      })
      // next week: +1 day to Sunday then +1 to Monday
      cursor = new Date(end)
      cursor.setDate(cursor.getDate() + 2)
    }
    const idx = w.findIndex(({ start, end }) => {
      const t = new Date().toISOString().slice(0,10)
      return t >= start && t <= end
    })
    return { monthLabel: new Date(y, m).toLocaleString('en-US',{month:'long',year:'numeric'}), weeks: w, currentWeekIndex: Math.max(0, idx) }
  }, [])
  const [selectedWeek, setSelectedWeek] = useState<number>(0)
  React.useEffect(() => setSelectedWeek(currentWeekIndex), [currentWeekIndex])
  const [notes, setNotes] = useState<string>("")
  // Event participation records (simplified: Date, Name, Progress, Award)
  type EventRecord = { date: string; name: string; progress: string; award?: string }
  const [eventForm, setEventForm] = useState<EventRecord>({ date: "", name: "", progress: "Participated", award: "" })
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([])
  const [showEventForm, setShowEventForm] = useState<boolean>(false)
  const [eventSaving, setEventSaving] = useState<boolean>(false)
  const [existingRecords, setExistingRecords] = useState<Record<string, any>>({})
  const [readOnly, setReadOnly] = useState<boolean>(false)
  const [metrics, setMetrics] = useState<Record<MetricKey, number>>({
    punctuality: 1,
    obedience: 1,
    classBehaviour: 1,
    participation: 1,
    homework: 1,
    respect: 1,
  })

  function setMetric(key: MetricKey, val: number) {
    setMetrics(prev => ({ ...prev, [key]: val }))
  }

  // Scores mapped to percentages for charts/summaries
  const PERCENT_SCALE: Record<number, number> = { 1: 25, 2: 50, 3: 75, 4: 100 }
  const overallPercent = useMemo(() => {
    const keys = Object.keys(METRIC_LABELS) as MetricKey[]
    const total = keys.reduce((sum, k) => sum + PERCENT_SCALE[metrics[k]], 0)
    return Math.round(total / keys.length)
  }, [metrics])

  const radarData = useMemo(() =>
    (Object.keys(METRIC_LABELS) as MetricKey[]).map(k => ({
      metric: METRIC_LABELS[k],
      value: metrics[k],
      full: 4,
    })),
  [metrics])

  function handleSubmit() {
    const wk = weeks[selectedWeek]
    const payload = { weekStart: wk?.start, weekEnd: wk?.end, metrics, notes, events: eventRecords }
    if (onSubmit) onSubmit(payload)
    // for now just close; API wiring next step
    onOpenChange(false)
  }

  // Load existing behaviour records when modal opens
  React.useEffect(() => {
    if (!open) return
    (async () => {
      try {
        const list = (await getStudentBehaviourRecords(String(studentId))) as any[]
        const map: Record<string, any> = {}
        ;(list || []).forEach((r: any) => {
          const key = `${(r.week_start || r.weekStart || '').slice(0,10)}-${(r.week_end || r.weekEnd || '').slice(0,10)}`
          map[key] = r
        })
        setExistingRecords(map)
      } catch {}
    })()
  }, [open, studentId])

  // When week selection changes, toggle read-only if a record already exists
  React.useEffect(() => {
    const wk = weeks[selectedWeek]
    if (!wk) return
    const key = `${wk.start}-${wk.end}`
    const found = existingRecords[key]
    if (found) {
      setReadOnly(true)
      const m = found.metrics || {}
      setMetrics({
        punctuality: m.punctuality ?? 3,
        obedience: m.obedience ?? 3,
        classBehaviour: m.classBehaviour ?? 3,
        participation: m.participation ?? 3,
        homework: m.homework ?? 3,
        respect: m.respect ?? 3,
      })
      const evs = Array.isArray(found.events) ? found.events : []
      setEventRecords(evs.map((e: any) => ({ date: e.date, name: e.name, progress: e.progress, award: e.award })))
      setShowEventForm(false)
    } else {
      setReadOnly(false)
      // keep current user selections; do not reset
    }
  }, [selectedWeek, weeks, existingRecords])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[900px] md:max-w-[900px]">
        <DialogHeader className="flex flex-row items-start justify-between">
          <DialogTitle>Add Student Behaviour</DialogTitle>
          <div className="text-right space-y-1">
            <div>
              <span className="text-xs text-slate-500 mr-2">Student ID</span>
              <span className="text-base font-semibold tracking-wide">{String(studentCode ?? studentId)}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 mr-2">Student Name</span>
              <span className="text-base font-semibold tracking-wide">{studentName}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-1">
              <Label>Month</Label>
              <div className="text-sm font-medium">{monthLabel}</div>
            </div>
            <div className="space-y-2">
              <Label>Week</Label>
              <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(parseInt(v))}>
                <SelectTrigger className="h-9 w-full md:w-[240px]">
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w, i) => {
                    const isFuture = new Date(w.start) > new Date();
                    return (
                      <SelectItem key={i} value={String(i)} disabled={isFuture}>{`Week ${i+1} (${w.label})`}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="punctuality" className="w-full">
              {readOnly && (
                <div className="mb-2 text-xs px-3 py-2 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  You already added behaviour for this week. Entries are read-only.
                </div>
              )}
              <TabsList className="flex flex-wrap gap-2 w-full bg-slate-50 rounded-md p-1">
                {(Object.keys(METRIC_LABELS) as MetricKey[]).map(k => (
                  <TabsTrigger key={k} value={k} className="text-xs md:text-sm px-3 py-1 rounded-md data-[state=active]:bg-[#013a63] data-[state=active]:text-white">
                    {TAB_LABELS[k]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {(Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => (
                <TabsContent key={k} value={k} className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <Label>
                      {METRIC_LABELS[k]} <span className="text-xs text-slate-500">(Current: {(k === 'participation' && metrics[k] === 4) ? (eventRecords.length > 0 ? 100 : 90) : (PERCENT_SCALE[metrics[k]] || 0)}%) {readOnly ? '(read-only)' : ''}</span>
                    </Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {SCORE_OPTIONS.map(opt => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={metrics[k] === opt.value ? "default" : "outline"}
                          className={`h-8 px-3 ${metrics[k] === opt.value ? "bg-[#013a63] text-white" : ""}`}
                          disabled={readOnly}
                          onClick={() => !readOnly && setMetric(k, opt.value)}
                        >
                          {opt.label} ({(k === 'participation' && opt.value === 4) ? (eventRecords.length > 0 ? 100 : 90) : (PERCENT_SCALE[opt.value] || 0)}%)
                        </Button>
                      ))}
                    </div>
                  </div>

                  {k === 'participation' ? (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Event Records</Label>
                        {!showEventForm && !readOnly && (
                          <Button type="button" variant="outline" className="h-8 px-3"
                            onClick={() => setShowEventForm(true)}
                          >
                            {eventRecords.length > 0 ? 'Add Another Event Record' : 'Add Event Record'}
                          </Button>
                        )}
                      </div>

                      {showEventForm && !readOnly ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-1">
                            <Input type="date" value={eventForm.date}
                              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} placeholder="Event Date" />
                          </div>
                          <div className="md:col-span-1">
                            <Input placeholder="Event Name" value={eventForm.name}
                              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
                          </div>
                          <div className="md:col-span-1">
                            <Input placeholder="Progress (e.g., Participated/Winner)" value={eventForm.progress}
                              onChange={(e) => setEventForm({ ...eventForm, progress: e.target.value })} />
                          </div>
                          <div className="md:col-span-1">
                            <Input placeholder="Award / Remarks (optional)" value={eventForm.award || ''}
                              onChange={(e) => setEventForm({ ...eventForm, award: e.target.value })} />
                          </div>
                        </div>
                      ) : null}

                      {showEventForm && !readOnly ? (
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-end">
                            <Button type="button" className="bg-[#013a63] text-white"
                              onClick={async () => {
                                if (!eventForm.name.trim() || !eventForm.date) return
                                setEventSaving(true)
                                await new Promise(r => setTimeout(r, 600))
                                setEventRecords(prev => [...prev, eventForm])
                                setEventForm({ date: "", name: "", progress: "Participated", award: "" })
                                setShowEventForm(false)
                                setEventSaving(false)
                              }}
                            >
                              {eventSaving ? 'Saving…' : (eventRecords.length > 0 ? 'Add Another' : 'Add Event')}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {eventRecords.length > 0 && (
                        <div className="overflow-x-auto border rounded-md">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                <th className="text-left px-3 py-2">Event</th>
                                <th className="text-left px-3 py-2">Date</th>
                                <th className="text-left px-3 py-2">Progress</th>
                                <th className="text-left px-3 py-2">Award / Remarks</th>
                                <th className="px-2 py-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {eventRecords.map((er, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="px-3 py-2">{er.name}</td>
                                  <td className="px-3 py-2">{er.date}</td>
                                  <td className="px-3 py-2">{er.progress}</td>
                                  <td className="px-3 py-2">{er.award || '—'}</td>
                                  <td className="px-2 py-2 text-right">
                                    <Button variant="outline" className="h-7 px-2" disabled={readOnly}
                                      onClick={() => !readOnly && setEventRecords(prev => prev.filter((_, i) => i !== idx))}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : null}
                </TabsContent>
              ))}
            </Tabs>

            {/* Notes removed as requested */}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleSubmit} disabled={readOnly} className={`text-white hover:opacity-95 ${readOnly ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#013a63]'}`}>{readOnly ? 'Already Saved' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


