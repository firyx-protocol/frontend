export interface MoveObject<T = Record<string, unknown>> {
  inner: string
  data?: T
}

export type MoveValue = Record<string, unknown>

export interface TokenMetadata {
  name?: string
  symbol?: string
  decimals?: number
  logoUri?: string
}

export interface SignerCapability {
  account: string
}

export interface LoanPositionParameters {
  feeTier: number
  tickLower: number
  tickUpper: number
  slopeBeforeKink: string
  slopeAfterKink: string
  kinkUtilization: string
  riskFactor: number
  tokenFee: MoveObject<TokenMetadata>
}

export interface LoanPositionCap {
  signerCap: SignerCapability
}

export interface PositionInfo {
  id?: string
  [key: string]: unknown
}

export interface LoanPosition {
  id: string,
  posObject: MoveObject<PositionInfo>
  liquidity: string
  utilization: string
  currentDebtIdx: string
  feeGrowthGlobalA: string
  feeGrowthGlobalB: string
  availableBorrow: string
  totalBorrowed: string
  parameters: LoanPositionParameters
  lendingPositionCap: LoanPositionCap
  active: boolean
  createdAtTs: number
  lastUpdateTs: number
  lastAccrualTs: number
  totalInterestEarned: string
  activeLoansCount: number
  totalShare: string
}

export interface DepositSlot {
  lender: string
  accumulatedDeposits: string
  active: boolean
  createdAtTs: string
  feeGrowthDebtA: string
  feeGrowthDebtB: string
  yieldEarnedA: string
  yieldEarnedB: string
  lastDepositTs: string
  lastWithdrawTs: string
  loanPosAddr: string
  originalPrincipal: string
  share: string
};

export interface LoanSlot {
  loanPosAddr: string
  principal: string
  originalPrincipal: string
  share: string
  reserve: string
  durationIdx: number
  debtIdxAtBorrow: string
  feeGrowthDebtA: string
  feeGrowthDebtB: string
  createdAtTs: string
  active: boolean
  yieldEarnedA: string,
  yieldEarnedB: string,
  withdrawnAmount: string
  availableWithdraw: string
  lastPaymentTs: string
  arrearsStartTs?: string
}
export type CreateLoanPositionInput = Partial<LoanPosition> & {
  posObject: MoveObject<PositionInfo>
  liquidity: string
};

export type UpdateLoanPositionInput = Partial<Omit<LoanPosition, 'posObject' | 'createdAtTs'>> & {
  posObject: MoveObject<PositionInfo>
};
