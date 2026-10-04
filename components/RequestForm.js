"use client";

import { useState } from "react";

const HOSTEL_BLOCKS = ["A Block", "B Block", "C Block", "D Block", "E Block"];

export default function RequestForm({ me, onCreated }) {
  const [hostelBlock, setHostelBlock] = useState(HOSTEL_BLOCKS[0]);
  const [roomNumber, setRoomNumber] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [participants, setParticipants] = useState([me?.name || ""]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateParticipant(i, value) {
    setParticipants((p) => p.map((n, idx) => (idx === i ? value : n)));
  }
  function addParticipant() {
    setParticipants((p) => [...p, ""]);
  }
  function removeParticipant(i) {
    setParticipants((p) => p.filter((_, idx) => idx !== i));
  }

  function validate(names) {
    if (!roomNumber.trim()) return "Room number is required.";
    if (!deliveryTime) return "Pick a delivery date and time.";
    if (names.length === 0) return "Add at least one participant name.";
    const seen = new Set();
    for (const n of names) {
      const key = n.toLowerCase();
      if (seen.has(key)) return `"${n}" is listed more than once. Each participant must be unique.`;
      seen.add(key);
    }
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const names = participants.map((n) => n.trim()).filter(Boolean);
    const problem = validate(names);
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostelBlock, roomNumber: roomNumber.trim(), deliveryTime, participants: names }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit the request.");
        setSubmitting(false);
        return;
      }
      setParticipants([me?.name || ""]);
      setRoomNumber("");
      setDeliveryTime("");
      onCreated?.(data.request);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-sub mb-1.5">Hostel block</label>
          <select
            value={hostelBlock}
            onChange={(e) => setHostelBlock(e.target.value)}
            className="w-full rounded-sm border border-line px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-night"
          >
            {HOSTEL_BLOCKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-sub mb-1.5">Room number</label>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 214"
            className="w-full rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-sub mb-1.5">Delivery time</label>
        <input
          type="datetime-local"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className="w-full rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="block text-xs font-medium text-sub">Participants</label>
          <span className="text-xs text-sub">{participants.filter((p) => p.trim()).length} people</span>
        </div>
        <div className="space-y-2">
          {participants.map((name, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 w-6 h-9 flex items-center justify-center text-xs text-sub">
                {i + 1}
              </span>
              <input
                value={name}
                onChange={(e) => updateParticipant(i, e.target.value)}
                placeholder={`Participant ${i + 1} name`}
                className="flex-1 min-w-0 rounded-sm border border-line px-3 py-2.5 text-sm focus:outline-none focus:border-night"
              />
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(i)}
                  className="shrink-0 px-3 rounded-sm border border-line text-sub text-sm hover:bg-canvas"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addParticipant}
          className="mt-2 text-sm font-medium text-night hover:text-lamp-dark"
        >
          + Add participant
        </button>
      </div>

      {error && (
        <p className="text-sm text-sleeping bg-sleeping-bg border border-sleeping/25 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-sm bg-night text-white py-2.5 text-sm font-medium hover:bg-night/90 transition disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit delivery request"}
      </button>
    </form>
  );
}
