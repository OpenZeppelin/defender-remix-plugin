// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare interface Window {
  ethereum?: import('ethers').Eip1193Provider & import('ethers').BrowserProvider;
}

// solc does not have a type definition file.
declare module 'solc' {
  export function compile(input: string, opts?: any): any;
}
