import * as fs from "fs";
import * as path from "path";

async function removeFile(filePath: string): Promise<void> {
  return fs.promises.unlink(filePath);
}

async function removeFolder(folderPath: string): Promise<void> {
  const files = await fs.promises.readdir(folderPath);

  for (const fileName of files) {
    const filePath = path.join(folderPath, fileName);
    const stats = await fs.promises.lstat(filePath);

    if (stats.isDirectory()) {
        await removeFolder(filePath);
    } else {
        await fs.promises.unlink(filePath);
    }
  }

  await fs.promises.rmdir(folderPath);
}

export { removeFile, removeFolder };
