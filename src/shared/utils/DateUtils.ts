export class DateUtils {
  static getSaoPauloHours(date: Date = new Date()): number {
    return DateUtils.getSaoPauloTimePart(date, 'hour');
  }

  static getSaoPauloMinutes(date: Date = new Date()): number {
    return DateUtils.getSaoPauloTimePart(date, 'minute');
  }

  private static getSaoPauloTimePart(date: Date, part: 'hour' | 'minute'): number {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const match = formatter.formatToParts(date).find(p => p.type === part)?.value;
    return match ? Number(match) : 0;
  }

  static getSaoPauloDateIso(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const findPart = (type: string) => parts.find(p => p.type === type)?.value;

    const year = findPart('year');
    const month = findPart('month');
    const day = findPart('day');

    return `${year}-${month}-${day}`;
  }
}
