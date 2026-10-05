import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import type { GeneratedFile } from "./generator.js";

export async function writeProjectFiles({
  targetDirectory,
  files,
}: {
  readonly targetDirectory: string;
  readonly files: readonly GeneratedFile[];
}): Promise<void> {
  const root = resolve(targetDirectory);

  await mkdir(root, { recursive: true });

  for (const file of files) {
    const destination = resolve(root, file.path);

    if (destination !== root && !destination.startsWith(`${root}${sep}`)) {
      throw new Error(
        `Generated file path escapes the project directory: ${file.path}`,
      );
    }

    await mkdir(dirname(destination), {
      recursive: true,
    });

    await writeFile(destination, file.content, {
      encoding: "utf8",
      flag: "wx",
    });
  }
}
