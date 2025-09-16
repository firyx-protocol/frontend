import { UseHookPayload, UseQueryHook } from "@/types";
import { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

type UseExamplePayload = UseHookPayload<{
    a: string;
    b: number;
}>

type UseExampleOptions = UseQueryOptions;

type UseExampleResult = UseQueryResult;

export const useExample: UseQueryHook<
    UseExamplePayload,
    UseExampleOptions,
    UseExampleResult
> = ({ payload }) => {
    return {} as UseExampleResult;
}
