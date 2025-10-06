// Utilitare pentru dashboard-ul de activități

interface Activity {
  id: number;
  date: string;
  displayDate?: string;
  employee: string;
  activity: string;
  work: string;
  status: string;
  timeSpent?: number;
}

/**
 * Parsează data unei activități în mai multe formate (ISO și românesc)
 */
export function parseActivityDate(dateString: string): Date {
  // Dacă data este deja în format ISO (YYYY-MM-DD)
  if (dateString.includes("-") && dateString.length === 10) {
    return new Date(dateString + "T00:00:00.000Z");
  }

  // Dacă data este în format românesc (DD.MM.YYYY)
  if (dateString.includes(".")) {
    const parts = dateString.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Luna în JavaScript e 0-indexed
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
  }

  // Fallback la parsing normal
  return new Date(dateString);
}

/**
 * Validează și normalizează valoarea timeSpent
 */
export function validateTimeSpent(
  timeSpent: number | undefined,
  maxHours: number = 24
): number {
  let validatedTime = timeSpent || 0;

  // Validare: timeSpent nu poate fi mai mare decât maxHours
  if (validatedTime > maxHours) {
    validatedTime = maxHours;
  }

  // Validare: timeSpent nu poate fi negativă
  if (validatedTime < 0) {
    validatedTime = 0;
  }

  return validatedTime;
}

/**
 * Verifică dacă o activitate aparține unei luni/an specifice
 */
export function isActivityInMonth(
  activity: Activity,
  year: number,
  month: number
): boolean {
  const activityDate = parseActivityDate(activity.date);
  return (
    activityDate.getFullYear() === year && activityDate.getMonth() === month
  );
}

/**
 * Calculează orele lucrate într-o lună din activități
 */
export function getMonthlyWorkedHours(
  activities: Activity[],
  year: number,
  month: number
): number {
  return activities
    .filter((activity) => isActivityInMonth(activity, year, month))
    .reduce((total, activity) => {
      const validatedTime = validateTimeSpent(activity.timeSpent);
      return total + validatedTime;
    }, 0);
}

/**
 * Calculează zilele completate dintr-un array de activități
 */
export function getCompletedDaysFromActivities(
  activities: Activity[],
  year: number,
  month: number
): number {
  const completedDates = new Set<string>();

  activities
    .filter((activity) => isActivityInMonth(activity, year, month))
    .forEach((activity) => {
      const activityDate = parseActivityDate(activity.date);
      const dateStr = activityDate.toISOString().split("T")[0];
      completedDates.add(dateStr);
    });

  return completedDates.size;
}

/**
 * Calculează zilele lucrătoare într-o lună (excluzând weekendurile)
 */
export function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    // 0 = Duminică, 6 = Sâmbătă
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
}

/**
 * Calculează orele totale pe lună (vineri 6h, restul 8h)
 */
export function getTotalMonthlyHours(year: number, month: number): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalHours = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Doar zilele lucrătoare
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Vineri (5) = 6 ore, restul = 8 ore
      totalHours += dayOfWeek === 5 ? 6 : 8;
    }
  }

  return totalHours;
}
