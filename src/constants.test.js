import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { APP_VERSION } from './constants';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('APP_VERSION と android/app/build.gradle の versionName の一致', () => {
  it('APP_VERSIONがbuild.gradleのversionNameと一致している', () => {
    const gradlePath = join(__dirname, '..', 'android', 'app', 'build.gradle');
    const gradleContent = readFileSync(gradlePath, 'utf-8');
    const match = gradleContent.match(/versionName\s+"([^"]+)"/);
    expect(match).not.toBeNull();
    expect(APP_VERSION).toBe(match[1]);
  });
});
