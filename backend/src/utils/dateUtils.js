export const isValidDateString = (s) => {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export const MAX_ADVANCE_DAYS = 30;

export const nepalToday = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kathmandu" });

export const nepalNowTime = () =>
    new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).replace(/^24:/, "00:");

export const dayOfWeek = (dateStr) =>
    new Date(`${dateStr}T00:00:00Z`).getUTCDay();

export const addDays = (dateStr, n) => {
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
};

export const BOOKING_CUTOFF_MINUTES = 60;
export const CANCEL_CUTOFF_HOURS = 6;

export const slotStartAsDate = (dateStr, timeStr) =>
    new Date(`${dateStr}T${timeStr}:00+05:45`);
