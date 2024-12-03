export type CompilerInput = {
  /**
   * The language, currently only Solidity is supported.
   */
  language: string;
  /**
   * Name of the file and the content of the file.
   * e.g. { 'test.sol': { content: 'contract C { function f() public { L.f(); } }' } }
   */
  sources: Record<string, { content: string }>;
  /**
   * Settings for the compiler.
   * e.g. { outputSelection: { '*': { '*': ['*'] } }"
   */
  settings: {
    outputSelection: Record<string, Record<string, string[]>>;
  };
};

export type ImportContents = Record<string, { contents: string }>;
