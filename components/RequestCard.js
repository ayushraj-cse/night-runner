"use client";

import { useState } from "react";
import StatusPill from "./StatusPill";

function fmt(dt) {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function outcomeChipClass(status) {
  if (status === "received") return "border-received text-received bg-received-bg";
  if (status === "sleeping") return "border-sleeping text-sleeping bg-sleeping-bg";
  return "border-line text-sub bg-canvas";
}

function outcomeLabel(status) {
  if (status === "received") return "Received";
  if (status === "sleeping") return "Sleeping";
  return "Pending";
}

export default function RequestCard({ request, me, isRunner, onAccept, conflictingRequest, accepting }) {
  const [open, setOpen] = useState(false);
  const received = request.participants.filter((p) => p.status === "received").length;
  const sleeping = request.participants.filter((p) => p.status === "sleeping").length;
  const myEntry =
    !isRunner && me
      ? request.participants.find((p) => p.name.toLowerCase() === me.name.toLowerCase())
      : null;

  return (
    <div className="bg-white border border-line rounded-sm p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="font-display text-sm font-semibold text-ink tracking-tight">
          {request.hostelBlock} · Room {request.roomNumber}
        </p>
        <StatusPill status={request.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-b border-line py-3 mb-3">
        <div>
          <p className="text-[10.5px] text-sub">Delivery time</p>
          <p className="text-[13px] font-medium text-ink mt-0.5">{fmt(request.deliveryTime)}</p>
        </div>
        <div>
          <p className="text-[10.5px] text-sub">Filed by</p>
          <p className="text-[13px] font-medium text-ink mt-0.5">{request.requester.name}</p>
        </div>
        {request.status === "completed" ? (
          <>
            <div>
              <p className="text-[10.5px] text-sub">Received</p>
              <p className="text-[13px] font-medium text-received mt-0.5">{received}</p>
            </div>
            <div>
              <p className="text-[10.5px] text-sub">Sleeping</p>
              <p className="text-[13px] font-medium text-sleeping mt-0.5">{sleeping}</p>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[10.5px] text-sub">People</p>
            <p className="text-[13px] font-medium text-ink mt-0.5">{request.participants.length}</p>
          </div>
        )}
      </div>

      {request.status === "clash" && (
        <div className="text-xs text-sleeping bg-sleeping-bg border border-sleeping/25 rounded-sm px-3 py-2 mb-3">
          Runner unavailable — conflicts with an already-accepted delivery
          {conflictingRequest
            ? ` to ${conflictingRequest.hostelBlock}, Room ${conflictingRequest.roomNumber}.`
            : "."}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-sub hover:text-ink"
      >
        {open ? "Hide participants" : "Show participants"}
      </button>

      {open && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {request.participants.map((p) => (
            <span
              key={p.name}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] border ${outcomeChipClass(
                p.status
              )}`}
            >
              {p.name}
              {p.status !== "pending" && <span className="font-medium">· {outcomeLabel(p.status)}</span>}
            </span>
          ))}
        </div>
      )}

      {myEntry && myEntry.status !== "pending" && (
        <p className="text-xs text-sub mt-3">
          Your status:{" "}
          <span
            className={`font-medium ${myEntry.status === "received" ? "text-received" : "text-sleeping"}`}
          >
            {outcomeLabel(myEntry.status)}
          </span>
        </p>
      )}

      {isRunner && request.status === "pending" && (
        <button
          onClick={() => onAccept(request.id)}
          disabled={accepting}
          className="w-full mt-4 rounded-sm bg-night text-white py-2 text-sm font-medium hover:bg-night/90 disabled:opacity-60"
        >
          {accepting ? "Accepting..." : "Accept delivery"}
        </button>
      )}
    </div>
  );
}
