import { CallbackRecord } from '../..';
import isNil from 'lodash/isNil';

export default function getLowestFrequency<T>(callbacks: Partial<Pick<CallbackRecord<T>, 'frequencyMs'>>[] = []): number {
    return callbacks
        .map(({ frequencyMs })=>frequencyMs)
        .filter((frequencyMs) => !isNil(frequencyMs) && frequencyMs > 0)
        .reduce((lowest, frequencyMs) => (lowest !== -1 && frequencyMs < lowest) || lowest === -1 ? frequencyMs : lowest, -1);
}
