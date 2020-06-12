/* eslint-disable @typescript-eslint/ban-ts-ignore*/
/* @ts-ignore*/
interface Annotator {
  getLastReadingPosition(): Promise<any>;
  saveLastReadingPosition(position: any): Promise<void>;
}

export default Annotator;
