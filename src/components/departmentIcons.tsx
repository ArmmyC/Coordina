import { Ambulance, Bed, ClipboardCheck, Pill, ScanLine, Truck } from "lucide-react";
import type { DepartmentSignal } from "../types";

export const getDepartmentIcon = (id: DepartmentSignal["id"]) => {
  switch (id) {
    case "ed":
      return Ambulance;
    case "beds":
      return Bed;
    case "pharmacy":
      return Pill;
    case "discharge":
      return ClipboardCheck;
    case "transport":
      return Truck;
    case "radiology":
      return ScanLine;
    default:
      return ClipboardCheck;
  }
};

export const getDepartmentTone = (id: DepartmentSignal["id"]) => {
  switch (id) {
    case "ed":
      return "red";
    case "beds":
      return "amber";
    case "pharmacy":
      return "violet";
    case "discharge":
      return "green";
    case "transport":
      return "teal";
    case "radiology":
      return "blue";
    default:
      return "teal";
  }
};
