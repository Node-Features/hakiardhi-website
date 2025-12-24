import moment from "moment-timezone";

export function toEAT(date: Date | string = new Date()): string {
  return moment(date).tz("Africa/Nairobi").format("YYYY-MM-DD HH:mm:ss");
}
