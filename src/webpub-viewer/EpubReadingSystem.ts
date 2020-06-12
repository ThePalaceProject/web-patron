/* eslint-disable @typescript-eslint/ban-ts-ignore*/
/* @ts-ignore next-line*/
interface EpubReadingSystemObject {
  readonly name: string;
  readonly version: string;
}

interface EpubReadingSystem extends Navigator {
  epubReadingSystem: EpubReadingSystemObject;
}
