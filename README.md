<h1 align="center">
    crlf-es
</h1>

<p align="center">
    <img alt="Node Current" src="https://img.shields.io/node/v/crlf-es">
    <img alt="Dependency count" src="https://badgen.net/bundlephobia/dependency-count/crlf-es" />
    <img alt="NPM Unpacked Size" src="https://img.shields.io/npm/unpacked-size/crlf-es">
</p>

0 dependency, promise-based utility to convert files to CRLF or LF or get line endings for files or strings.

Uses all native NodeJS API's: [`util.parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig) [`util.styleText`](https://nodejs.org/api/util.html#utilstyletextformat-text-options) [`fs.glob`](https://nodejs.org/api/fs.html#fspromisesglobpattern-options)

Based on [kolodny/crlf](https://github.com/kolodny/crlf)

- [CLI Usage](#cli-usage)
  - [Set line endings](#set-line-endings)
  - [Get line endings](#get-line-endings)
- [API Usage](#api-usage)
  - [Set line endings in file](#set-line-endings-in-file)
  - [Set line endings in multiple files](#set-line-endings-in-multiple-files)
  - [Get line endings for file](#get-line-endings-for-file)
  - [Get line endings for string](#get-line-endings-for-string)

## CLI Usage

### Set line endings

Use `--set` or `-s`

```
$ crlf-es ./files/**/*.txt -s CRLF

[ SKIPPED ] ./files/10.txt  (7 ms)
[ SKIPPED ] ./files/11.txt  (76 ms)
[ SKIPPED ] ./files/16.txt  (77 ms)
[ SKIPPED ] ./files/17.txt  (77 ms)
[ SKIPPED ] ./files/4.txt   (78 ms)
[ SKIPPED ] ./files/8.txt   (78 ms)
[ SKIPPED ] ./files/12.txt  (81 ms)
[ SKIPPED ] ./files/7.txt   (82 ms)
[ SUCCESS ] ./files/1.txt   (89 ms)
[ SUCCESS ] ./files/13.txt  (90 ms)
[ SUCCESS ] ./files/14.txt  (90 ms)
[ SUCCESS ] ./files/2.txt   (90 ms)
[ SUCCESS ] ./files/15.txt  (91 ms)
[ SUCCESS ] ./files/3.txt   (91 ms)
[ SUCCESS ] ./files/5.txt   (91 ms)
[ SUCCESS ] ./files/6.txt   (91 ms)
[ SUCCESS ] ./files/9.txt   (91 ms)

Done in 133 ms
```

\* Files are skipped when they are already a certain line ending or have no newlines (override with `--force`/`-f`)

### Get line endings

```
$ npx crlf-es ./files/**/*.txt

./files/1.txt   LF
./files/10.txt  CRLF
./files/11.txt  CRLF
./files/13.txt  LF
./files/14.txt  LF
./files/15.txt  LF
./files/16.txt  CRLF
./files/17.txt  CRLF
./files/2.txt   LF
./files/3.txt   LF
./files/4.txt   CRLF
./files/5.txt   LF
./files/6.txt   LF
./files/8.txt   CRLF
./files/9.txt   LF
./files/12.txt  None
./files/7.txt   None

Done in 53 ms
```

## API Usage

### Set line endings in file

```ts
import { setLineEndings } from 'crlf-es';

await setLineEndings('./my-file.txt', 'CRLF');
```

### Set line endings in multiple files

```ts
import { setLineEndings } from 'crlf-es';

// Uses NodeJS fs.glob
await setLineEndings('./files/**/*.txt', 'LF');

// Also accepts array
await setLineEndings(['./files/**/*.txt', './other-files/**/*.txt'], 'CRLF');
```

### Get line endings for file

```ts
import { getFileLineEndings } from 'crlf-es';

await getFileLineEndings('./my-file.txt', 'LF');
```

### Get line endings for string

```ts
import { getStringLineEndings } from 'crlf-es';

const myString =
    'Aut adipisci sit qui.\r\nEnim quibusdam accusamus cum fugiat.\r\nOfficiis qui veritatis facilis sint tempora impedit';

const result = await getStringLineEndings(myString);
// result = "CRLF"
```
