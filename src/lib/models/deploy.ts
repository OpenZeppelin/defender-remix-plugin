
/**
 * Deploy Contract Models (simplified)
 * https://github.com/OpenZeppelin/defender-sdk/blob/main/packages/deploy/src/models/deployment.ts
 */
export interface DeployContractRequest {
  contractName: string;
  contractPath: string;
  network: string;
  artifactPayload?: string;
  artifactUri?: string;
  value?: string;
  salt?: string;
  verifySourceCode: boolean;
  licenseType?: SourceCodeLicense;
  /**
   * @example { "contracts/Library.sol:LibraryName": "0x1234567890123456789012345678901234567890" }
   */
  libraries?: DeployRequestLibraries;
  constructorInputs?: (string | boolean | number)[];
  constructorBytecode?: string;
  relayerId?: string;
  approvalProcessId?: string;
  createFactoryAddress?: string;
}

export type SourceCodeLicense = 'None' | 'Unlicense' | 'MIT' | 'GNU GPLv2' | 'GNU GPLv3' | 'GNU LGPLv2.1' | 'GNU LGPLv3' | 'BSD-2-Clause' | 'BSD-3-Clause' | 'MPL-2.0' | 'OSL-3.0' | 'Apache-2.0' | 'GNU AGPLv3' | 'BSL 1.1';

export interface DeployRequestLibraries {
  [k: `${string}:${string}`]: string;
}

/**
 * Deploy Artifact Models
 */
export type ContractArtifact = {
  abi: any;
  evm: {
    bytecode: {
      object: string;
      linkReferences?: any;
    };
    deployedBytecode: {
      object: string;
      linkReferences?: any;
    };
  };
  metadata: string;
};

export type Artifact = {
  input: {
    sources: {
      [path: string]: {
        content: string;
      };
    };
    settings: any;
  };
  output: {
    contracts: {
      [path: string]: {
        [contractName: string]: ContractArtifact;
      };
    };
  };
};

export interface UpdateDeploymentRequest {
  deploymentId: string;
  address: string;
  hash: string;
}

export interface DeploymentResult {
  deploymentId?: string;
  address: string;
  hash: string;
  sender?: string;
}
