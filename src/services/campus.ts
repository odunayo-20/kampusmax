import { Campus } from "@/types";
import { campuses, defaultCampus } from "@/data/campus";

export function getCampuses(): Campus[] {
  return campuses;
}

export function getDefaultCampus(): Campus {
  return defaultCampus;
}

export function getCampusById(id: string): Campus | undefined {
  return campuses.find((c) => c.id === id);
}
