import type {ExplorationHotspot} from '../../types';

/** Select authored answers only. Invalid edited questions fail closed. */
export function stage1Options(interaction: ExplorationHotspot['interaction']) {
  const source = interaction?.options || [];
  const correct = source.filter(option => option.isCorrect && option.id && option.textVi?.trim());
  const wrong = source.find(option => !option.isCorrect && option.id && option.textVi?.trim() && option.id !== correct[0]?.id && option.textVi.trim() !== correct[0]?.textVi.trim());
  if (correct.length !== 1 || !wrong) return [];
  return [correct[0], wrong];
}
