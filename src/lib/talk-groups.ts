/** The slice of a speaking entry that grouping reads. */
export interface GroupableTalk {
  id: string;
  data: {
    title: string;
    event: string;
    city: string;
    date: Date;
    format?: string;
  };
}

/** Sessions of one event in one city and year. */
export interface EventGroup<T extends GroupableTalk> {
  key: string;
  event: string;
  city: string;
  /** Timestamp of the newest session. */
  latest: number;
  /** Sessions in agenda order (oldest first). */
  talks: T[];
}

/**
 * One group per event: talks at the same event, city and year are grouped, so an
 * event with two sessions or a talk plus a workshop counts once. Groups come back
 * newest first; sessions inside a group in agenda order.
 */
export function groupTalksByEvent<T extends GroupableTalk>(talks: T[]): EventGroup<T>[] {
  const groups = new Map<string, EventGroup<T>>();
  for (const talk of talks) {
    const year = talk.data.date.getUTCFullYear();
    const key = `${year}|${talk.data.event}|${talk.data.city}`;
    const group = groups.get(key) ?? { key, event: talk.data.event, city: talk.data.city, latest: 0, talks: [] };
    group.talks.push(talk);
    group.latest = Math.max(group.latest, talk.data.date.valueOf());
    groups.set(key, group);
  }
  const sorted = [...groups.values()].sort((a, b) => b.latest - a.latest);
  for (const group of sorted) {
    group.talks.sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  }
  return sorted;
}

/**
 * Keep the newest `limit` EVENTS. The limit counts events, never sessions: an event
 * with three sessions uses one slot. No limit (or a non-positive one) keeps everything.
 */
export function limitEvents<T extends GroupableTalk>(groups: EventGroup<T>[], limit?: number): EventGroup<T>[] {
  return limit && limit > 0 ? groups.slice(0, limit) : groups;
}

/** Event groups by calendar year (UTC), newest year first. */
export function groupEventsByYear<T extends GroupableTalk>(groups: EventGroup<T>[]): Array<[number, EventGroup<T>[]]> {
  const byYear = new Map<number, EventGroup<T>[]>();
  for (const group of groups) {
    const year = new Date(group.latest).getUTCFullYear();
    byYear.set(year, [...(byYear.get(year) ?? []), group]);
  }
  return [...byYear.entries()];
}

/**
 * The single newest session. When several sessions share the newest date (a talk and a
 * workshop on one day), a regular talk wins over other formats, then the title decides,
 * so the choice never depends on file order.
 */
export function newestTalk<T extends GroupableTalk>(talks: T[]): T | undefined {
  const isTalk = (talk: T) => !talk.data.format || talk.data.format === 'talk';
  return [...talks].sort(
    (a, b) =>
      b.data.date.valueOf() - a.data.date.valueOf() ||
      Number(isTalk(b)) - Number(isTalk(a)) ||
      a.data.title.localeCompare(b.data.title),
  )[0];
}
