// This is a Type for path of objects
// See https://www.calebpitan.com/blog/dot-notation-type-accessor-in-typescript
type IsAny<T> = unknown extends T
  ? [keyof T] extends [never]
    ? false
    : true
  : false;

type PathImpl<T, Key extends keyof T> = Key extends string
  ? IsAny<T[Key]> extends true
    ? never
    : T[Key] extends Record<string, any>
      ?
          | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
              string}`
          | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
      : never
  : never;

export type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

export type Path<T> = keyof T extends string
  ? PathImpl2<T> extends infer P
    ? P extends string | keyof T
      ? P
      : keyof T
    : keyof T
  : never;

export function traverse<T>(obj: T, path: Path<T>): any {
  // type is checked by signature
  return path.split(".").reduce((acc: any, key) => acc[key], obj);
}

// type DeepPartial<T> = {
//   [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
// };
