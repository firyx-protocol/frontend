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

export type CreateLoanPositionInput = Partial<LoanPosition> & {
  posObject: MoveObject<PositionInfo>
  liquidity: string
}

export type UpdateLoanPositionInput = Partial<Omit<LoanPosition, 'posObject' | 'createdAtTs'>> & {
  posObject: MoveObject<PositionInfo>
}
