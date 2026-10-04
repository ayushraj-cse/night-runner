"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import RequestForm from "@/components/RequestForm";
import RequestCard from "@/components/RequestCard";
import RunnerStatusBanner from "@/components/RunnerStatusBanner";
import HandoverPanel from "@/components/HandoverPanel";
import StatsStrip from "@/components/StatsStrip";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import { useToasts } from "@/lib/useToasts";

function SectionHeading({ title, hint }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-[15px] font-semibold text-ink tracking-tight">{title}</h2>
      {hint && <p className="text-xs text-sub mt-0.5">{hint}</p>}
    </div>
  );
}

export default function DashboardClient({ me }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [accepting, setAccepting] = useState(null);
  const [marking, setMarking] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isRunner = me.role === "runner";
  const { toasts, push, dismiss } = useToasts();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "Could not load delivery requests.");
        return;
      }
      setLoadError("");
      setRequests(data.requests || []);
    } catch {
      setLoadError("Network error while loading delivery requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const requestsById = useMemo(() => {
    const m = {};
    for (const r of requests) m[r.id] = r;
    return m;
  }, [requests]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleAccept(id) {
    setAccepting(id);
    try {
      const res = await fetch(`/api/requests/${id}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        push(data.error || "Could not accept this request.", "error", 6000);
      } else {
        push("Delivery accepted. Runner is now on this delivery.", "success");
      }
      await load();
    } catch {
      push("Network error. Please try again.", "error");
    } finally {
      setAccepting(null);
    }
  }

  async function handleMark(id, name, status) {
    setMarking(name);
    try {
      const res = await fetch(`/api/requests/${id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        push(data.error || "Could not update that participant's outcome.", "error");
      }
      await load();
    } catch {
      push("Network error. Please try again.", "error");
    } finally {
      setMarking(null);
    }
  }

  async function confirmComplete(id) {
    setConfirmOpen(false);
    setCompleting(true);
    try {
      const res = await fetch(`/api/requests/${id}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        push(data.error || "Could not complete this delivery.", "error", 6000);
      } else {
        push("Delivery completed. Runner is available again.", "success");
      }
      await load();
    } catch {
      push("Network error. Please try again.", "error");
    } finally {
      setCompleting(false);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const activeRequest = requests.find((r) => r.status === "accepted") || null;
  const completedTrips = requests.filter((r) => r.status === "completed");
  const clashedTrips = requests.filter((r) => r.status === "clash");
  const myReceivedHistory = !isRunner
    ? requests.filter(
        (r) =>
          r.status === "completed" &&
          r.participants.some(
            (p) => p.name.toLowerCase() === me.name.toLowerCase() && p.status === "received"
          )
      )
    : [];

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b border-line bg-canvas/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={20} className="text-night" />
            <span className="font-display font-semibold text-ink tracking-tight hidden sm:inline">
              Night Canteen Runner
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-ink">{me.name}</p>
              <p className="text-xs text-sub capitalize">{me.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-sub hover:text-ink border border-line rounded-sm px-3 py-1.5 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {loadError && (
          <div className="rounded-sm bg-sleeping-bg border border-sleeping/30 text-sleeping text-sm px-3 py-2">
            {loadError}
          </div>
        )}

        {isRunner && (
          <>
            <RunnerStatusBanner activeRequest={activeRequest} />
            <StatsStrip requests={requests} />
          </>
        )}

        {!isRunner && (
          <section>
            <SectionHeading title="New delivery request" />
            <div className="bg-white border border-line rounded-sm p-5 max-w-md">
              <RequestForm
                me={me}
                onCreated={() => {
                  push("Request submitted. Waiting for the runner.");
                  load();
                }}
              />
            </div>
          </section>
        )}

        {isRunner && activeRequest && (
          <section>
            <SectionHeading title="Active delivery" hint="Mark each participant, then complete the trip." />
            <HandoverPanel
              request={activeRequest}
              onMark={(name, status) => handleMark(activeRequest.id, name, status)}
              onCompleteClick={() => setConfirmOpen(true)}
              marking={marking}
              completing={completing}
            />
            <ConfirmDialog
              open={confirmOpen}
              title="Complete this delivery?"
              body="This marks the trip as done and frees up the runner. Outcomes already recorded cannot be changed afterwards."
              confirmLabel="Complete delivery"
              onConfirm={() => confirmComplete(activeRequest.id)}
              onCancel={() => setConfirmOpen(false)}
            />
          </section>
        )}

        {isRunner && (
          <section>
            <SectionHeading
              title={`Pending requests${pending.length > 0 ? ` (${pending.length})` : ""}`}
            />
            {loading ? (
              <p className="text-sm text-sub">Loading…</p>
            ) : pending.length === 0 ? (
              <EmptyState title="No delivery requests waiting for the runner." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((r) => (
                  <RequestCard key={r.id} request={r} me={me} isRunner onAccept={handleAccept} accepting={accepting === r.id} />
                ))}
              </div>
            )}
          </section>
        )}

        {!isRunner && (
          <section>
            <SectionHeading title="My requests" />
            {loading ? (
              <p className="text-sm text-sub">Loading…</p>
            ) : requests.length === 0 ? (
              <EmptyState title="You haven't filed any delivery requests yet." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {requests.map((r) => (
                  <RequestCard
                    key={r.id}
                    request={r}
                    me={me}
                    isRunner={false}
                    conflictingRequest={r.clashWith ? requestsById[r.clashWith] : null}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!isRunner && (
          <section>
            <SectionHeading
              title="My delivery history"
              hint="Only shows orders where you were marked received."
            />
            {loading ? (
              <p className="text-sm text-sub">Loading…</p>
            ) : myReceivedHistory.length === 0 ? (
              <EmptyState
                title="No completed deliveries yet."
                hint="Orders only show up here once the runner marks you as received."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myReceivedHistory.map((r) => (
                  <RequestCard key={r.id} request={r} me={me} isRunner={false} />
                ))}
              </div>
            )}
          </section>
        )}

        {isRunner && (
          <section>
            <SectionHeading title="Runner history" hint="Every completed delivery, in full." />
            {loading ? (
              <p className="text-sm text-sub">Loading…</p>
            ) : completedTrips.length === 0 ? (
              <EmptyState title="No completed deliveries yet." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {completedTrips.map((r) => (
                  <RequestCard key={r.id} request={r} me={me} isRunner />
                ))}
              </div>
            )}
          </section>
        )}

        {isRunner && (
          <section>
            <SectionHeading
              title="Clashed requests"
              hint="Rejected for a conflict — never counted as completed trips."
            />
            {loading ? (
              <p className="text-sm text-sub">Loading…</p>
            ) : clashedTrips.length === 0 ? (
              <EmptyState title="No clashes recorded." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clashedTrips.map((r) => (
                  <RequestCard
                    key={r.id}
                    request={r}
                    me={me}
                    isRunner
                    conflictingRequest={r.clashWith ? requestsById[r.clashWith] : null}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Toast toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
