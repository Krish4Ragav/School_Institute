import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Clock, CalendarHeart } from "lucide-react";
import { schoolEvents, eventsOnDate } from "../data/events";
import { prettyDateLong, dayNum, monthShort, todayISO, formatDate, daysBetween } from "../data/helpers";
import type { SchoolEvent } from "../data/types";
import { Card, CardHead, Badge, Button, Modal } from "../components/ui/primitives";

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: startDow }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(formatDate(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Events() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<SchoolEvent | null>(null);

  const monthDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const grid = useMemo(() => buildMonthGrid(monthDate.getFullYear(), monthDate.getMonth()), [monthDate]);
  const monthLabel = monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const upcoming = useMemo(
    () => schoolEvents.filter((e) => daysBetween(todayISO(), e.date) >= -2).sort((a, b) => a.date.localeCompare(b.date)),
    []
  );

  const eventMap = useMemo(() => {
    const m: Record<string, SchoolEvent[]> = {};
    for (const e of schoolEvents) (m[e.date] ??= []).push(e);
    return m;
  }, []);

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Events</h1>
          <div className="sub">School calendar and celebrations</div>
        </div>
      </div>

      <div className="grid grid-events" style={{ marginBottom: 18 }}>
        <Card>
          <CardHead
            title={monthLabel}
            actions={
              <>
                <Button variant="outline" size="sm" onClick={() => setMonthOffset((v) => v - 1)}>‹ Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setMonthOffset(0)}>Today</Button>
                <Button variant="outline" size="sm" onClick={() => setMonthOffset((v) => v + 1)}>Next ›</Button>
              </>
            }
          />
          <div className="card-body">
            <div className="cal-strip" style={{ marginBottom: 8 }}>
              {weekdays.map((w) => (
                <div key={w} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase" }}>{w}</div>
              ))}
            </div>
            <div className="cal-strip">
              {grid.map((date, i) => {
                if (!date) return <div key={i} />;
                const isToday = date === todayISO();
                const evs = eventMap[date] ?? [];
                const isWeekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());
                return (
                  <div
                    key={i}
                    className={`cal-cell ${isToday ? "today" : ""}`}
                    style={{ opacity: isWeekend ? 0.45 : 1 }}
                    title={evs.length ? `${evs[0].title} — ${evs[0].time}` : undefined}
                    onClick={() => evs[0] && setSelected(evs[0])}
                  >
                    <span className="cell-day">{dayNum(date)}</span>
                    {evs.map((e) => (
                      <span key={e.id} className="cal-dot" style={{ background: e.color }} />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="legend" style={{ marginTop: 14 }}>
              {upcoming.slice(0, 4).map((e) => (
                <span key={e.id} className="li">
                  <span className="swatch" style={{ background: e.color }} /> {e.title}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHead title="Coming up" sub="Next events" />
          <div className="card-body" style={{ paddingTop: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcoming.map((e) => (
                <div
                  key={e.id}
                  className="exam-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(e)}
                >
                  <div className="exam-date-box" style={{ background: `${e.color}14`, borderColor: `${e.color}44`, color: e.color }}>
                    <div className="ed-day">{dayNum(e.date)}</div>
                    <div className="ed-month">{monthShort(e.date)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>
                      <Clock size={11} style={{ verticalAlign: -1 }} /> {e.time} · <MapPin size={11} style={{ verticalAlign: -1 }} /> {e.location}
                    </div>
                  </div>
                  <Badge tone="gray">{e.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-3">
        {upcoming.map((e) => (
          <Card key={e.id} className="event-tile">
            <div className="event-cover" style={{ background: `linear-gradient(135deg, ${e.color}, ${e.color}bb)` }}>
              <CalendarHeart size={44} />
            </div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: "var(--fs-xs)", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.05 }}>
                <CalendarDays size={13} /> {prettyDateLong(e.date)}
              </div>
              <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: 6 }}>{e.title}</h3>
              <p className="text-3" style={{ fontSize: "var(--fs-sm)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 12 }}>
                {e.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-xs)", color: "var(--text-3)", fontWeight: 600 }}>
                <MapPin size={12} /> {e.location} · {e.time}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function EventModal({ event, onClose }: { event: SchoolEvent; onClose: () => void }) {
  const related = eventsOnDate(event.date).filter((e) => e.id !== event.id);
  return (
    <Modal
    open
    onClose={onClose}
    title="Event details"
    footer={<Button variant="outline" onClick={onClose}>Close</Button>}
  >
      <div
        className="event-cover"
        style={{ background: `linear-gradient(135deg, ${event.color}, ${event.color}bb)`, borderRadius: "var(--r-md)", marginBottom: 16, height: 110 }}
      >
        <CalendarHeart size={42} />
      </div>
      <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: 8 }}>{event.title}</h3>
      <div className="kv"><span className="k"><CalendarDays size={13} /> Date</span><span className="v">{prettyDateLong(event.date)}</span></div>
      <div className="kv"><span className="k"><Clock size={13} /> Time</span><span className="v">{event.time}</span></div>
      <div className="kv" style={{ marginBottom: 12 }}><span className="k"><MapPin size={13} /> Location</span><span className="v">{event.location}</span></div>
      <hr className="divider" />
      <p className="text-2" style={{ lineHeight: 1.75, fontSize: "var(--fs-md)" }}>{event.description}</p>
      {related.length > 0 && (
        <p className="text-3" style={{ fontSize: "var(--fs-xs)", marginTop: 12 }}>
          Also on this date: {related.map((r) => r.title).join(", ")}.
        </p>
      )}
    </Modal>
  );
}