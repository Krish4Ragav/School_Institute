import { useMemo, useState } from "react";
import { BookOpen, ArrowLeftRight, Library as LibraryIcon, Search, ArrowRight } from "lucide-react";
import { useApp } from "../store/AppContext";
import { studentsList } from "../data/students";
import { libraryBooks, booksIssuedTo } from "../data/library";
import { inr, prettyDate } from "../data/helpers";
import { Card, CardHead, Badge, Button, EmptyState } from "../components/ui/primitives";

export default function Library() {
  const { user } = useApp();
  const child = studentsList.find((s) => s.id === user?.studentId);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"browse" | "issued">("browse");

  const categories = useMemo(() => Array.from(new Set(libraryBooks.map((b) => b.category))), []);
  const issued = child ? booksIssuedTo(child.id) : [];

  const list = libraryBooks.filter((b) => {
    const mq = !q.trim() || (b.title + " " + b.author + " " + b.category).toLowerCase().includes(q.trim().toLowerCase());
    const mc = cat === "all" || b.category === cat;
    return mq && mc;
  });

  const borrowedMine = (b: (typeof libraryBooks)[number]) => child !== undefined && b.issuedTo === child.id;

  return (
    <>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1>Library</h1>
          <div className="sub">Browse the collection · my borrowed books</div>
        </div>
        <Button variant="outline" onClick={() => setView(view === "browse" ? "issued" : "browse")}>
          <ArrowRight size={16} /> {view === "browse" ? "My borrowed books" : "Browse catalogue"}
        </Button>
      </div>

      {view === "browse" ? (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ padding: "12px 16px" }}>
              <div className="filters-bar">
                <div className="input-search">
                  <Search size={16} />
                  <input className="input" placeholder="Search by title, author or category…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search books" />
                </div>
                <div className="select-field">
                  <label className="sr-only" htmlFor="lib-cat">Category</label>
                  <select id="lib-cat" className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
                    <option value="all">All genres</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Badge tone="gray">{list.length} books</Badge>
              </div>
            </div>
          </Card>

          <div className="grid book-grid">
            {list.map((b) => {
              const mine = borrowedMine(b);
              return (
                <Card key={b.id} hover className="book-tile">
                  <div className="book-cover" style={{ background: `linear-gradient(150deg, ${b.coverColor}, ${b.coverColor}99)` }}>
                    <span className="bc-letter">{b.title.charAt(0)}</span>
                    <BookOpen size={20} style={{ position: "absolute", right: 8, top: 8, opacity: 0.5 }} />
                    <span className="bc-cat">{b.category}</span>
                  </div>
                  <div className="card-body" style={{ padding: "13px 15px" }}>
                    <div className="t-strong" style={{ fontSize: "var(--fs-md)", lineHeight: 1.3 }}>{b.title}</div>
                    <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)", fontWeight: 600, margin: "2px 0 10px" }}>{b.author}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge tone={mine ? "blue" : b.available ? "green" : "gray"} dot>{mine ? "Borrowed by you" : b.available ? "Available" : "On loan"}</Badge>
                      {b.dueDate && <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-3)" }}>Due {prettyDate(b.dueDate)}</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          {list.length === 0 && <Card><EmptyState title="No books found" message="Try a different search term or category." /></Card>}
        </>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <Card className="card-pad">
              <div className="stat-mini">
                <span className="stat-icon" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}><LibraryIcon size={16} /></span>
                <div>
                  <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{issued.length}</div>
                  <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Books currently borrowed</div>
                </div>
              </div>
            </Card>
            <Card className="card-pad">
              <div className="stat-mini">
                <span className="stat-icon" style={{ background: "var(--green-soft)", color: "var(--green)" }}><ArrowLeftRight size={16} /></span>
                <div>
                  <div className="t-strong" style={{ fontSize: "var(--fs-xl)" }}>{issued.filter((b) => b.dueDate && b.dueDate > new Date().toISOString().slice(0, 10)).length}</div>
                  <div className="text-3" style={{ fontSize: "var(--fs-sm)" }}>Due this week</div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHead title={`${child?.name ?? "Student"}'s borrowed books`} sub="Return before the due date to avoid a ₹5/day fine" />
            <div className="table-wrap">
              <table className="table table-responsive">
                <thead>
                  <tr><th>Book</th><th>Author</th><th>Issue date</th><th>Due date</th><th>Fine</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {issued.map((b) => {
                    const due = new Date((b.dueDate ?? "") + "T00:00:00");
                    const overdue = b.dueDate != null && due.getTime() < Date.now();
                    const fineDays = overdue ? Math.max(1, Math.round((Date.now() - due.getTime()) / 86400000)) : 0;
                    const daysLeft = b.dueDate ? Math.max(0, Math.round((due.getTime() - Date.now()) / 86400000)) : null;
                    return (
                      <tr key={b.id}>
                        <td data-label="Book">
                          <div className="t-main t-main-row" style={{ gap: 10 }}>
                            <span className="av-sm" style={{ background: b.coverColor }}>{b.title.charAt(0)}</span>
                            <span className="t-strong" style={{ fontSize: "var(--fs-sm)" }}>{b.title}</span>
                          </div>
                        </td>
                        <td data-label="Author">{b.author}</td>
                        <td data-label="Issue date">{b.issuedDate ? prettyDate(b.issuedDate) : "—"}</td>
                        <td data-label="Due date">{b.dueDate ? prettyDate(b.dueDate) : "—"}</td>
                        <td data-label="Fine" className="mono">{fineDays > 0 ? inr(fineDays * 5) : "—"}</td>
                        <td data-label="Status">
                          <Badge tone={overdue ? "rose" : "green"} dot>{overdue ? `Overdue by ${fineDays}d` : daysLeft === null ? "On loan" : `${daysLeft}d left`}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {issued.length === 0 && <EmptyState title="Nothing borrowed" message="Your issued books will appear here." />}
            </div>
          </Card>
        </>
      )}
    </>
  );
}