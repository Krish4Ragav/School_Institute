import { useState } from "react";
import { Bus, MapPin, Timer, Phone, BadgeIndianRupee, UserRound, Navigation } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { transportRoutes } from "../data/transport";
import { inr } from "../data/helpers";
import type { TransportRoute } from "../data/types";
import { Card, Badge, Button } from "../components/ui/primitives";

function pickRoute(seed: string): TransportRoute {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return transportRoutes[h % transportRoutes.length];
}

export default function Transport() {
  const { user } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);
  const defaultRoute = child ? pickRoute(child.id) : transportRoutes[0];
  const [assignedId, setAssignedId] = useState(defaultRoute.id);
  const assigned = transportRoutes.find((r) => r.id === assignedId) ?? defaultRoute;
  const [allView, setAllView] = useState(false);

  const worldviewRoutes = allView ? transportRoutes.filter((r) => r.id !== assignedId) : transportRoutes;

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Transport</h1>
          <div className="sub">School bus service · routes across Electronic City</div>
        </div>
        <Button variant="outline" onClick={() => setAllView((v) => !v)}><Bus size={16} /> {allView ? "View all routes" : "My route details"}</Button>
      </div>

      {/* My route hero */}
      <Card style={{ marginBottom: 18 }}>
        <div className="bus-hero" style={{ background: `linear-gradient(120deg, ${assigned.color}, ${assigned.color}bb)` }}>
          <div>
            <div className="bus-route-name">{assigned.route}</div>
            <div className="bus-stats">
              <span><span className="bc-dot" /> {assigned.status}</span>
              <span>🚌 {assigned.busNo}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge tone="gray">{assigned.students} students</Badge>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 16 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 10 }}>Route stops</div>
              <div className="stops-timeline">
                {assigned.stops.map((s, i) => (
                  <div key={s} className="stop-row">
                    <span className={`stop-dot ${i === assigned.stops.length - 1 ? "last" : ""}`}>
                      {i === assigned.stops.length - 1 ? "🏫" : null}
                    </span>
                    <span className="stop-name" style={{ fontWeight: i === assigned.stops.length - 1 ? 700 : 500, color: i === assigned.stops.length - 1 ? "var(--brand-700)" : "var(--text-2)" }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title" style={{ marginBottom: 10 }}>Trip schedule</div>
              <div className="kv"><span className="k"><Timer size={13} /> Morning pickup</span><span className="v">{assigned.startTime}</span></div>
              <div className="kv"><span className="k"><Timer size={13} /> Reach school</span><span className="v">{assigned.endTime}</span></div>
              <div className="kv" style={{ marginBottom: 8 }}><span className="k"><BadgeIndianRupee size={13} /> Monthly fare</span><span className="v">{inr(1200)}/mo</span></div>
              <div className="bus-staff">
                <span className="av-sm" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}><UserRound size={16} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{assigned.driver}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>Driver</div>
                </div>
                <a className="btn btn-outline btn-sm" href={`tel:`} onClick={(e) => e.preventDefault()}><Phone size={13} /> Call</a>
              </div>
              <div className="bus-staff" style={{ marginTop: 8 }}>
                <span className="av-sm" style={{ background: "var(--teal-soft)  ", color: "var(--teal)" }}><UserRound size={16} /></span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{assigned.conductor}</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>Bus attendant</div>
                </div>
              </div>
            </div>
          </div>
          {child && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--brand-50)", border: "1px solid var(--brand-100)", borderRadius: "var(--r-md)", padding: "11px 14px" }}>
              <Navigation size={17} style={{ color: "var(--brand-700)" }} />
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--brand-900)" }}>
                {child.name} is assigned to {assigned.route}. Boarding point: {assigned.stops[1]}.
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* All routes */}
      {allView && (
        <>
          <div className="page-head" style={{ margin: "4px 0 14px" }}>
            <div><h2 style={{ fontSize: "var(--fs-xl)" }}>All routes</h2><div className="sub">{transportRoutes.length} buses serve the Electronic City area</div></div>
          </div>
          <div className="grid grid-3">
            {worldviewRoutes.map((r) => (
              <Card key={r.id} hover className="route-card">
                <div className="route-cover" style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}bb)` }}>
                  <h3 style={{ fontSize: "var(--fs-lg)", color: "#fff" }}>{r.route}</h3>
                  <span className="route-badge">{r.busNo}</span>
                </div>
                <div className="card-body">
                  <div className="kv"><span className="k"><MapPin size={13} /> Boarding</span><span className="v">{r.stops[1]}</span></div>
                  <div className="kv"><span className="k"><Timer size={13} /> Pickup</span><span className="v">{r.startTime} → {r.endTime}</span></div>
                  <div className="kv" style={{ marginBottom: 10 }}><span className="k"><UserRound size={13} /> Driver</span><span className="v">{r.driver}</span></div>
                  <Button variant="outline" size="sm" style={{ width: "100%" }} onClick={() => { setAssignedId(r.id); setAllView(false); }}>
                    View this route
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}