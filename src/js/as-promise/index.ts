import asCallback from '../as-callback';
import { CallbackHandler, CallbackResponse, FetchOptions } from '..';
export interface AsPromise {
    agentName: string;
    path: string;
    options?: FetchOptions;
}

export default function asPromise<T>({ agentName, path, options }: AsPromise): Promise<CallbackResponse<T>> {
    return new Promise<CallbackResponse<T>>( (resolve, reject): void => {
        const callback: CallbackHandler<T> = (error: Error, res?: CallbackResponse<T>): void => {
            if (error) {
                reject(error);
            }

            resolve(res);
        };

        asCallback({ agentName, path, options, frequencyMs: 0, callback });
    });
}
