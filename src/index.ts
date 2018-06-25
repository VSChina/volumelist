import {spawn} from 'child_process';
import * as os from 'os';

const platform = os.platform();

async function windowsRun() {
  const cmd = spawn('wmic', ['logicaldisk', 'get', 'name'], {shell: true});
  let output = '';

  return new Promise(
      (resolve: (value: string[]) => void, reject: (reason: Error) => void) => {
        cmd.stdout.on('data', (data) => {
          output += data;
        });

        cmd.on('close', (code) => {
          if (code) {
            return reject(new Error(`get volume failed: ${code}`));
          }

          const volumeMatches = output.match(/^([A-Z]\:)/mg);
          const volumes: string[] = [];
          if (volumeMatches) {
            for (const volume of volumeMatches) {
              volumes.push(volume);
            }
          }

          return resolve(volumes);
        });
      });
}

async function unixRun() {
  const cmd = spawn('df', ['-h'], {shell: true});
  let output = '';

  return new Promise(
      (resolve: (value: string[]) => void, reject: (reason: Error) => void) => {
        cmd.stdout.on('data', (data) => {
          output += data;
        });

        cmd.on('close', (code) => {
          if (code) {
            return reject(new Error(`get volume failed: ${code}`));
          }

          const volumeMatches = output.match(/(\/[\S]*)/mg);
          const volumes: string[] = [];
          if (volumeMatches) {
            for (const volume of volumeMatches) {
              volumes.push(volume);
            }
          }

          return resolve(volumes);
        });
      });
}

export async function volumelist() {
  if (platform === 'win32') {
    return await windowsRun();
  }

  return await unixRun();
}