import { BigNumber } from "bignumber.js";

export const sqrtPriceX64ToPrice = (sqrtPrice: string, decimalsA: number, decimalsB: number): number => {
    if (!sqrtPrice || new BigNumber(sqrtPrice).isZero()) return 0;
    const price = new BigNumber(sqrtPrice)
        .pow(2)
        .div(new BigNumber(2).pow(128))
        .multipliedBy(new BigNumber(10).pow(decimalsA))
        .dividedBy(new BigNumber(10).pow(decimalsB))
        .toNumber();

  return price;
}