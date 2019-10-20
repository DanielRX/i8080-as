export function hexSimple(x: u8): string {
    return x < 10 ? x.toString() : String.fromCharCode(x  + 87);
}

export function hex8(x: u8): string {
    return hexSimple(x >> 4) + hexSimple(x & 0xf);
}

export function hex16(x: u16): string {
    return hex8(<u8>(x >> 8)) + hex8(<u8>(x & 0xff));
}