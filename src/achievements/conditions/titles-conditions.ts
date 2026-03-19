import { AchievementCondition } from './achievement-condition.interface';

export class FirstTitleCondition implements AchievementCondition {
  check(user: any): boolean {
    return user.titles.length >= 1;
  }
}

export class TenTitlesCondition implements AchievementCondition {
  check(user: any): boolean {
    return user.titles.length >= 10;
  }
}

export class FiftyTitlesCondition implements AchievementCondition {
  check(user: any): boolean {
    return user.titles.length >= 50;
  }
}

export class FirstCompletedCondition implements AchievementCondition {
  check(user: any): boolean {
    return user.titles.some((t: any) => t.status === 'COMPLETED');
  }
}

export class TenCompletedCondition implements AchievementCondition {
  check(user: any): boolean {
    return (
      user.titles.filter((t: any) => t.status === 'COMPLETED').length >= 10
    );
  }
}

export class HundredTitlesCondition implements AchievementCondition {
  check(user: any): boolean {
    return user.titles.length >= 100;
  }
}

export class AllTypesCondition implements AchievementCondition {
  check(user: any): boolean {
    const types = new Set(user.titles.map((t: any) => t.type));
    return types.size >= 5; // Assuming 5 types: MOVIE, SERIES, ANIME, GAME, BOOK
  }
}

export class HighRaterCondition implements AchievementCondition {
  check(user: any): boolean {
    const ratedTitles = user.titles.filter(
      (t: any) => t.rating && t.rating >= 9,
    );
    return ratedTitles.length >= 10;
  }
}
