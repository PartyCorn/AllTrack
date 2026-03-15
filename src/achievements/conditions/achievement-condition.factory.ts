import { AchievementCondition } from './achievement-condition.interface';
import {
  FirstTitleCondition,
  TenTitlesCondition,
  FiftyTitlesCondition,
  FirstCompletedCondition,
  TenCompletedCondition,
  HundredTitlesCondition,
  AllTypesCondition,
  HighRaterCondition,
} from './titles-conditions';

export class AchievementConditionFactory {
  private static conditions: Map<string, AchievementCondition> = new Map([
    ['FIRST_TITLE', new FirstTitleCondition()],
    ['TEN_TITLES', new TenTitlesCondition()],
    ['FIFTY_TITLES', new FiftyTitlesCondition()],
    ['FIRST_COMPLETED', new FirstCompletedCondition()],
    ['TEN_COMPLETED', new TenCompletedCondition()],
    ['HUNDRED_TITLES', new HundredTitlesCondition()],
    ['ALL_TYPES', new AllTypesCondition()],
    ['HIGH_RATER', new HighRaterCondition()],
  ]);

  static getCondition(code: string): AchievementCondition | undefined {
    return this.conditions.get(code);
  }
}