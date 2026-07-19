import { supabase } from "./supabase";

let SEQ_CACHE = Math.floor(Math.random() * 90000) + 10000;

export function genReceiptNo() {
  SEQ_CACHE += 1;
  return `WG-${new Date().getFullYear()}${String(SEQ_CACHE).padStart(5, "0")}`;
}

export async function createRequest({ customerId, items, slot, address, memo, totalPrice }) {
  return await supabase
    .from("requests")
    .insert({
      receipt_no: genReceiptNo(),
      customer_id: customerId,
      items,
      slot,
      address,
      memo,
      total_price: totalPrice,
      status: "요청접수",
    })
    .select()
    .single();
}

export async function fetchMyRequests(customerId) {
  return await supabase
    .from("requests")
    .select("*, driver:driver_id(name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
}

export async function fetchOpenRequests() {
  return await supabase
    .from("requests")
    .select("*")
    .eq("status", "요청접수")
    .order("created_at", { ascending: false });
}

export async function fetchMyJobs(driverId) {
  return await supabase
    .from("requests")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
}

export async function acceptRequest(requestId, driverId) {
  return await supabase
    .from("requests")
    .update({ driver_id: driverId, status: "기사배정", updated_at: new Date().toISOString() })
    .eq("id", requestId);
}

export async function advanceStatus(requestId, nextStatus) {
  return await supabase
    .from("requests")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", requestId);
}

export function subscribeToRequests(onChange) {
  const channel = supabase
    .channel("requests-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
