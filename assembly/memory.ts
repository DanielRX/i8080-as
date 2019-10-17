import {console} from './console';
import {File} from './files';

export class Memory {
  public mem: Uint8Array;

  constructor() {
    this.mem = new Uint8Array(0x10000);
  }

  load_file(files: Map<string, File>, name: string): void {
    const file = files.get(name);
    if(file == null) {
      console.log('File ' + name + ' is not found');
      return;
    }
    const end: u16 = <u16>(file.start + file.image.length - 1);
    for(let i = file.start; i <= end; ++i) {
      unchecked(this.mem[i] = file.image[i - file.start]);
    }
    const size = file.end - file.start + 1;
    console.log('***** File ' + name + ' loaded, size ' + size.toString() + ' *****');
  }
}