import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBaobei } from '../server/server.mjs';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const firmwareRoot = path.resolve(appRoot, '../../cardputer_voice_led_1.1');
const app = createBaobei({ dataDir: process.env.BAOBEI_DATA_DIR, token: process.env.BAOBEI_DEVICE_TOKEN });
const key = process.env.BAOBEI_DEVICE_TOKEN || fs.readFileSync(app.tokenFile, 'utf8').trim();
const password = process.env.BAOBEI_WIFI_PASSWORD || 'Baobei2850';
if (password.length < 8 || password.length > 63 || !/^[\x20-\x7e]+$/.test(password)) throw new Error('Hotspot password must be 8 to 63 ASCII characters.');
const example = fs.readFileSync(path.join(firmwareRoot, 'shared/config.example.h'), 'utf8');
const source = example.replace('"GENERATE_LOCAL_CONFIG_FIRST"', JSON.stringify(key)).replace('"Baobei2850"', JSON.stringify(password));
const destination = path.join(firmwareRoot, 'shared/config.h');
fs.writeFileSync(destination, source, { mode: 0o600 });
console.log(`Hardware configuration ready: ${destination}`);
console.log(`App pairing key file: ${app.tokenFile}`);
