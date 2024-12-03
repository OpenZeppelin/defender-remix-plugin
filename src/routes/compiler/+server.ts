import type { CompilerInput } from "$lib/models/solc";
import { json } from '@sveltejs/kit';
import { SolidityCompiler } from "./compiler";
import { attempt } from "$lib/utils/attempt";


export async function POST({ request }: { request: Request }) {
  const { input }: { input: CompilerInput } = await request.json();

  const compiler = new SolidityCompiler();

  const [output, error] = await attempt(() => JSON.parse(compiler.compile(input)));

  if (error) {
    return json({ success: false, error: error.msg });
  }

  return json({ success: true, data: { output } });
}
