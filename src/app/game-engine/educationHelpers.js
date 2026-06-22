export function getEnrollmentCount(enrollments) {
  if (!Array.isArray(enrollments)) return 0;
  return enrollments.reduce((sum, entry) => sum + Math.max(0, entry.qty || 1), 0);
}

export function getTotalPopulation(state) {
  if (!state) return 0;
  return (
    Math.max(0, state.popChildren || 0) +
    Math.max(0, state.popWorkers || 0) +
    Math.max(0, state.popEngineers || 0)
  );
}
