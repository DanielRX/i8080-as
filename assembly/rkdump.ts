/*
 * Part of Intel 8080/KR580VM80A in JavaScript project
 *
 * Copyright (C) 2009, 2012 Alexander Demin <alexander@demin.ws>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */

let fs = require('fs');
let path = require('path');
let assert = require('assert');

const hex = (n: number, width: number = 4) => {
  return n.toString(16).toUpperCase().padStart(width, '0');
}

let output = '';

function log(s: string) {
  output += (s + '\n');
}

function dump_file(name: string) {
  let start = 0;
  let end = 0;
  let entry = 0;

  assert.ok(name.includes('.'), `Name '${name}'`);

  const contents: Buffer = fs.readFileSync('files/' + name);
  const sz = contents.length;

  const ext = path.extname(name);

  let n = 0;

  // If the file name starts with 'mon' this is an image of Monitor
  // (no sync-byte, start and end addresses at front).
  if (ext === '.bin' || ext === '.COM') {
    if (name.startsWith('mon')) {
      end = 0xffff;
      start = end - sz + 1;
      entry = 0xf800;
    } else if (ext ==='.COM') {
      start = 0x100;
      end = start + sz - 1;
      entry = start;
    } else {
      end = sz;
      start = 0;
      entry = 0;
    }
  } else {
    // Is it the sync-byte (E6)?
    if (contents[n] == 0xe6) { n += 1; } 

    // start address
    start = (contents[n] << 8) | contents[n + 1];
    n += 2;

    // end address
    start = (contents[n] << 8) | contents[n + 1];
    n += 2;

    entry = start;
  }

  log(`files.set('${name}', new File(0x${hex(start)}, 0x${hex(end)}, 0x${hex(entry)}, [`);
  let line = [];
  const lineSize = 256;
  for(let i = 0; i < contents.length / lineSize; i++) {
    const lineContents = [...contents.slice(i * lineSize, (i + 1) * lineSize)];
    const lineValues = lineContents.map((x: number) => `0x${hex(x, 2)}`);
    line.push(lineValues.join(', '))
  }
  log(line.join(',\n') + '\n]));\n');
}

const fileClassString = `export class File {
  start: u16;
  end: u16;
  entry: u16;
  image: u8[];
  constructor(start: u16, end: u16, entry: u16, image: u8[]) {
      this.start = start;
      this.end = end;
      this.entry = entry;
      this.image = image;
  }
}\n`;

export const dump = () => {
  log(fileClassString)
  log('let files = new Map<string, File>();\n');
  
  for (let file of fs.readdirSync('files')) {
    if (!file) continue;
    dump_file(file);
  }
  
  log('export function preloaded_files(): Map<string, File> { return files; }');
}

dump();

fs.writeFileSync('./assembly/files.ts', output);
