import { UseMutationOptions, UseQueryOptions, UseMutationResult, UseQueryResult } from "@tanstack/react-query";

export interface UseHookPayload<T = unknown> {
    payload: T | null;
}


/** A hook that accepts a payload and options, and returns a result.
 * 
 * @template P - The type of the payload.
 * @template O - The type of the options, defaults to UseQueryOptions.
 * @template R - The type of the result, defaults to UseQueryResult.
 */
export type UseQueryHook<P, D, O = Omit<UseQueryOptions<D>, 'queryKey'> & { queryKey?: UseQueryOptions<D>['queryKey'] }> = (props: { payload?: P, options?: O }) => UseQueryResult<D, Error>;

/** A hook that accepts a payload and options, and returns a mutation result.
 * 
 * @template P - The type of the payload.
 * @template O - The type of the options, defaults to UseMutationOptions.
 * @template R - The type of the result, defaults to UseMutationResult.
 */
export type UseMutationHook<P, D, O = Omit<UseMutationOptions<D, Error, P>, 'mutationFn'>> = (props: { payload?: P, options?: O }) => UseMutationResult<D, Error, P>;