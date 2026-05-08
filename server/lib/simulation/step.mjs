export function stepSimulationFallback(state, speed = 1) {
  if (!state || typeof state !== "object") {
    return { error: "Missing simulation state" };
  }

  const elapsedMinutes = Number(state.elapsedMinutes ?? 120) + 5 * Number(speed || 1);
  const tick = Number(state.tick ?? 0) + 1;
  const simulatedTime = timeFromMinutes(elapsedMinutes);

  return {
    ...state,
    tick,
    elapsedMinutes,
    simulatedTime,
    lastUpdatedAt: simulatedTime,
  };
}

function timeFromMinutes(minutes) {
  const base = 8 * 60;
  const total = base + minutes;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = ((hours + 11) % 12) + 1;
  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
}

