import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const expoCliPath = fileURLToPath(new URL('../node_modules/expo/bin/cli', import.meta.url));
const expoArguments = process.argv.slice(2);

if (expoArguments.length === 0) {
  console.error('An Expo command is required.');
  process.exit(1);
}

const childProcess = spawn(process.execPath, [expoCliPath, ...expoArguments], {
  env: { ...process.env, EXPO_NO_DOTENV: '1' },
  stdio: 'inherit',
});

childProcess.on('error', (error) => {
  console.error(`Unable to start Expo: ${error.message}`);
  process.exit(1);
});

childProcess.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
