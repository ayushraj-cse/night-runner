// Night Canteen Runner — delivery request model.
//
// One MongoDB collection ("deliveryRequests") holds everything: the room
// that filed the request, every participating student, and the single
// runner's handling of it. There is exactly one runner in this system, so
// "only one request can be `accepted` at any moment" (enforced in the
// accept route) is what actually represents "the runner is busy."

export const HOSTEL_BLOCKS = ["A Block", "B Block", "C Block", "D Block", "E Block"];

export const REQUEST_STATUS = {
  PENDING: "pending", // filed, waiting for the runner
  ACCEPTED: "accepted", // runner is on this delivery — runner is busy
  CLASH: "clash", // rejected because the runner was already busy
  COMPLETED: "completed", // handover finished, runner is free again
};

export const PARTICIPANT_STATUS = {
  PENDING: "pending", // not yet handed over
  RECEIVED: "received",
  SLEEPING: "sleeping", // missed / asleep / didn't answer the door
};

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function serializeRequest(doc) {
  return {
    id: doc._id.toString(),
    hostelBlock: doc.hostelBlock,
    roomNumber: doc.roomNumber,
    deliveryTime: doc.deliveryTime,
    requester: doc.requester,
    participants: doc.participants,
    status: doc.status,
    clashWith: doc.clashWith ? doc.clashWith.toString() : null,
    createdAt: doc.createdAt,
    acceptedAt: doc.acceptedAt || null,
    completedAt: doc.completedAt || null,
    updatedAt: doc.updatedAt,
  };
}
