import {spawn,execSync} from 'child_process';
import * as os from 'os';

const platform = os.platform();

function parseVolumeWindows(output: string) {
  const lines = output.split(/[\n\r]+/);
  const volumes: {path: string, name?: string}[] = [];
  for (const line of lines) {
    const volumeMatches = line.match(/^([A-Z]\:)\s*(.*?)?\s*$/);
    if (volumeMatches) {
      const path = volumeMatches[1];
      const name = volumeMatches[2];
      volumes.push({path, name});
    }
  }

  return volumes;
}

async function windowsRun() {
  const cmd = spawn('wmic', ['logicaldisk', 'get', 'name,VolumeName'], {shell: true});
  let output = '';

  return new Promise(
      (resolve: (value: {path: string, name?: string}[]) => void, reject: (reason: Error) => void) => {
        cmd.stdout.on('data', (data) => {
          output += data;
        });

        cmd.on('close', (code) => {
          if (code) {
            return reject(new Error(`get volume failed: ${code}`));
          }

          const volumes = parseVolumeWindows(output);

          return resolve(volumes);
        });
      });
}

function windowsRunSync() {
  const output = execSync('wmic logicaldisk get name,VolumeName', {
    encoding: 'utf8'
  });

  return parseVolumeWindows(output);
}

function parseVolumeUnix(output: string) {
  const lines = output.split(/[\n\r]+/);
  const volumes: {path: string, name?: string}[] = [];
  for (const line of lines) {
    const volumeMatches = line.match(/on (\/[\S]*).*?(\[(.*?)\])?\s*$/);
    if (volumeMatches) {
      const path = volumeMatches[1];
      const name = volumeMatches[3];
      volumes.push({path, name});
    }
  }

  return volumes;
}

async function unixRun() {
  const cmd = spawn('mount', ['-l', '-t', 'ext3,ext4,ntfs,vfat,exfat,fuseblk,drvfs'], {shell: true});
  let output = '';

  return new Promise(
      (resolve: (value: {path: string, name?: string}[]) => void, reject: (reason: Error) => void) => {
        cmd.stdout.on('data', (data) => {
          output += data;
        });

        cmd.on('close', (code) => {
          if (code) {
            return reject(new Error(`get volume failed: ${code}`));
          }

          const volumes = parseVolumeUnix(output);

          return resolve(volumes);
        });
      });
}

function unixRunSync() {
  const output = execSync('mount -l -t ext3,ext4,ntfs,vfat,exfat,fuseblk,drvfs', {
    encoding: 'utf8'
  });

  return parseVolumeUnix(output);
}

function parseVolumeDarwin(output: string) {
  const lines = output.split(/[\n\r]+/);
  const volumes: {path: string, name?: string}[] = [];
  for (const line of lines) {
    const volumeMatches = line.match(/on (\/.*?([^\/]+?))\s*\(/);
    if (volumeMatches) {
      const path = volumeMatches[1];
      const name = volumeMatches[2];
      volumes.push({path, name});
    }
  }

  return volumes;
}

async function darwinRun() {
  const cmd = spawn('mount', ['-t', 'ext3,ext4,ntfs,vfat,exfat,fuseblk,drvfs'], {shell: true});
  let output = '';

  return new Promise(
      (resolve: (value: {path: string, name?: string}[]) => void, reject: (reason: Error) => void) => {
        cmd.stdout.on('data', (data) => {
          output += data;
        });

        cmd.on('close', (code) => {
          if (code) {
            return reject(new Error(`get volume failed: ${code}`));
          }

          const volumes = parseVolumeDarwin(output);

          return resolve(volumes);
        });
      });
}

function darwinRunSync() {
  const output = execSync('mount -t ext3,ext4,ntfs,vfat,exfat,fuseblk,drvfs', {
    encoding: 'utf8'
  });

  return parseVolumeDarwin(output);
}

export async function volumelistName() {
  return platform === 'win32' ?
      await windowsRun() :
        platform === 'darwin' ?
        await darwinRun() :
        await unixRun();
}

export function volumelistNameSync() {
  return platform === 'win32' ?
      windowsRunSync() :
        platform === 'darwin' ?
        darwinRunSync() :
        unixRunSync();
}

export async function volumelist() {
  const list = await volumelistName();
  return list.map(v => v.path);
}

export function volumelistSync() {
  const list = volumelistNameSync();
  return list.map(v => v.path);
}