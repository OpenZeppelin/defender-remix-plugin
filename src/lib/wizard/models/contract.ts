/**
 * Interfaces for the contract object returned by the wizard.
 */

export interface Contract {
  name: string;
  license: string;
  parents: Parent[];
  natspecTags: NatspecTag[];
  imports: ImportContract[];
  functions: ContractFunction[];
  constructorCode: string[];
  constructorArgs: FunctionArgument[];
  variables: string[];
  upgradeable: boolean;
}

export interface NatspecTag {
  key: string;
  value: string;
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Parent {
  contract: ImportContract;
  params: Value[];
  importOnly?: boolean;
}

export interface ImportContract extends ReferencedContract {
  path: string;
}

export interface ReferencedContract {
  name: string;
  transpiled?: boolean;
}

export interface Using {
  library: ImportContract;
  usingFor: string;
}

export interface BaseFunction {
  name: string;
  args: FunctionArgument[];
  returns?: string[];
  kind: FunctionKind;
  mutability?: FunctionMutability;
}

export interface ContractFunction extends BaseFunction {
  override: Set<ReferencedContract>;
  modifiers: string[];
  code: string[];
  mutability: FunctionMutability;
  final: boolean;
  comments: string[];
}

export type FunctionKind = 'internal' | 'public';
export type FunctionMutability = typeof mutabilityRank[number];

// Order is important
const mutabilityRank = ['pure', 'view', 'nonpayable', 'payable'] as const;

export interface FunctionArgument {
  type: string | ReferencedContract;
  name: string;
}

export interface DefenderDeployMessage {
  kind: 'oz-wizard-defender-deploy';
  contract: Contract;
}
