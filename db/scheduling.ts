import { getDatabase } from "./repository";

export const appointmentSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
export type AppointmentType = "CONSULTATION" | "TRAINING";

export type AppointmentBlock = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentType: "ALL" | AppointmentType;
  reason: string;
  active: boolean;
};

export async function getAppointmentAvailability(date: string, type: AppointmentType) {
  const db = await getDatabase();
  const [appointments, blocks] = await Promise.all([
    db.prepare(`SELECT preferred_time FROM appointments WHERE preferred_date = ? AND status IN ('PENDING', 'CONFIRMED')`).bind(date).all<{ preferred_time: string }>(),
    db.prepare(`SELECT start_time, end_time FROM appointment_blocks WHERE date = ? AND active = 1 AND (appointment_type = 'ALL' OR appointment_type = ?)`).bind(date, type).all<{ start_time: string; end_time: string }>(),
  ]);
  const taken = new Set(appointments.results.map((row) => row.preferred_time));
  return appointmentSlots.map((time) => ({
    time,
    available: !taken.has(time) && !blocks.results.some((block) => block.start_time <= time && block.end_time > time),
  }));
}

export async function getAppointmentBlocks() {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT * FROM appointment_blocks ORDER BY date DESC, start_time`).all<Record<string, unknown>>();
  return result.results.map((row): AppointmentBlock => ({
    id: String(row.id), date: String(row.date), startTime: String(row.start_time), endTime: String(row.end_time),
    appointmentType: String(row.appointment_type) as AppointmentBlock["appointmentType"], reason: String(row.reason), active: Boolean(Number(row.active)),
  }));
}

export async function createAppointmentBlock(input: Omit<AppointmentBlock, "id" | "active">) {
  const db = await getDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO appointment_blocks (id, date, start_time, end_time, appointment_type, reason, active) VALUES (?, ?, ?, ?, ?, ?, 1)`)
    .bind(id, input.date, input.startTime, input.endTime, input.appointmentType, input.reason).run();
  return id;
}

export async function setAppointmentBlockActive(id: string, active: boolean) {
  const db = await getDatabase();
  await db.prepare(`UPDATE appointment_blocks SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(active ? 1 : 0, id).run();
}
