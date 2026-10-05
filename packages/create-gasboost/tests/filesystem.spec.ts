import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { writeProjectFiles } from "../src/filesystem.js";

const temporaryDirectories: string[] = [];

describe("writeProjectFiles", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.splice(0).map((directory) =>
        rm(directory, {
          force: true,
          recursive: true,
        }),
      ),
    );
  });

  it("writes generated files into an existing non-empty directory", async () => {
    const targetDirectory = await makeTemporaryDirectory();
    const existingFile = join(targetDirectory, "README.md");

    await writeFile(existingFile, "# Existing project\n", "utf8");

    await writeProjectFiles({
      targetDirectory,
      files: [
        {
          path: "src/backend/main.ts",
          content: "export const message = 'hello';\n",
        },
      ],
    });

    await expect(readFile(existingFile, "utf8")).resolves.toBe(
      "# Existing project\n",
    );
    await expect(
      readFile(join(targetDirectory, "src/backend/main.ts"), "utf8"),
    ).resolves.toBe("export const message = 'hello';\n");
  });

  it("does not overwrite existing files", async () => {
    const targetDirectory = await makeTemporaryDirectory();
    const existingFile = join(targetDirectory, "package.json");

    await writeFile(existingFile, '{"name":"existing"}\n', "utf8");

    await expect(
      writeProjectFiles({
        targetDirectory,
        files: [
          {
            path: "package.json",
            content: '{"name":"generated"}\n',
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: "EEXIST",
    });

    await expect(readFile(existingFile, "utf8")).resolves.toBe(
      '{"name":"existing"}\n',
    );
  });
});

async function makeTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "create-gasboost-"));

  temporaryDirectories.push(directory);

  return directory;
}
