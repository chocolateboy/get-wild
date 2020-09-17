declare module 'get-wild/getter' {
  export type Options = {
      collect?: (value: {}) => ReadonlyArray<unknown>;
      default?: unknown;
      flatMap?: PropertyKey | false;
      map?: PropertyKey | false;
      parser?: (path: string) => ReadonlyArray<PropertyKey>;
  };
  export type Path = string | ReadonlyArray<PropertyKey>;
  export const getter: (_options?: Options) => {
      <D, O, T extends unknown>(obj: O, path: Path, $default: D): D | O | T | (D | T)[];
      <O_1, T_1 extends unknown>(obj: O_1, path: Path): O_1 | T_1 | (T_1 | undefined)[] | undefined;
  };
  export const get: {
      <D, O, T extends unknown>(obj: O, path: Path, $default: D): D | O | T | (D | T)[];
      <O_1, T_1 extends unknown>(obj: O_1, path: Path): O_1 | T_1 | (T_1 | undefined)[] | undefined;
  };

}
declare module 'get-wild/index' {
  export { get, getter } from 'get-wild/getter';
  export { default as parser } from 'get-wild/parser';

}
declare module 'get-wild/parser' {
  const parser: (path: string) => (string | number)[];
  export default parser;

}
declare module 'get-wild' {
  import main = require('get-wild/index');
  export = main;
}