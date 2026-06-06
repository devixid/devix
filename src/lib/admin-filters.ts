export function parseDateRangeFilter(dateFrom?: string, dateTo?: string) {
  const range: { gte?: Date; lte?: Date } = {};

  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00.000Z`);
    if (!Number.isNaN(from.getTime())) {
      range.gte = from;
    }
  }

  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999Z`);
    if (!Number.isNaN(to.getTime())) {
      range.lte = to;
    }
  }

  return Object.keys(range).length > 0 ? range : undefined;
}
