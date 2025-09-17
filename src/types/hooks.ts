import { UseMutationOptions, UseQueryOptions, UseMutationResult, UseQueryResult } from "@tanstack/react-query";

export interface UseHookPayload<T = any> {
    payload: T | null;
}

/**
 * A hook that accepts a payload and options, and returns a result.
 * 
 * @template O - The type of the options, defaults to UseMutationOptions or UseQueryOptions.
 * @template R - The type of the result, defaults to UseMutationResult or UseQueryResult.
 */
export type UseMutationHook<O = UseMutationOptions, R = UseMutationResult> = (options?: O) => R;

/** A hook that accepts a payload and options, and returns a result.
 * 
 * @template P - The type of the payload.
 * @template O - The type of the options, defaults to UseQueryOptions.
 * @template R - The type of the result, defaults to UseQueryResult.
 */
export type UseQueryHook<P, O = UseQueryOptions, R = UseQueryResult> = (props: { payload?: P, options?: O }) => R;