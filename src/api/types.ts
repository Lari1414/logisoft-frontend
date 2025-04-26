import { User } from "@/models/user";
import { Path, PathImpl2 } from "@/lib/DeepProps";

export interface Auth {
  token: string;
  user: User;
}

export interface FilterResult<T> {
  total: number;
  limit?: number;
  offset: number;
  items: T[];
}

export type Filter<T> = FilterParameters<T> & FilterInner<T>;

export type FilterParameters<T> = {
  offset?: number;
  limit?: number;
  sort?: PathImpl2<T>;
  direction?: "asc" | "desc";
};

export function FilterAnd<T>(...inner: FilterInner<T>[]): FilterInner<T> {
  return {
    kind: "and",
    children: inner,
  };
}

export function FilterOr<T>(...inner: FilterInner<T>[]): FilterInner<T> {
  return {
    kind: "or",
    children: inner,
  };
}

export function FilterNot<T>(inner: FilterInner<T>): FilterInner<T> {
  return {
    kind: "not",
    children: [inner],
  };
}

export function FilterEq<T>(attribute: Path<T>, value: any): FilterInner<T> {
  return {
    kind: "eq",
    attribute,
    value,
  };
}

export function FilterIn<T>(attribute: Path<T>, value: string): FilterInner<T> {
  return {
    kind: "in",
    attribute,
    value,
  };
}

export function FilterOneOf<T>(
  attribute: Path<T>,
  value: (string | number | null)[],
): FilterInner<T> {
  return {
    kind: "oneof",
    attribute,
    value,
  };
}

export type FilterInner<T> =
  | {}
  | {
      kind: "and" | "or";
      children: FilterInner<T>[];
    }
  | {
      kind: "not";
      children: [FilterInner<T>];
    }
  | {
      kind: "eq";
      attribute: Path<T>;
      value: string | number | null;
    }
  | {
      // includes in value, case insentive
      kind: "in";
      attribute: Path<T>;
      value: string;
    }
  | {
      // including lower and upper
      kind: "range";
      attribute: Path<T>;
      upper?: string | number;
      lower?: string | number;
    }
  | {
      // one of the items in array
      kind: "oneof";
      attribute: Path<T>;
      value: (string | number | null)[];
    };
