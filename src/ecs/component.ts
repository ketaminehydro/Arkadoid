// This file serves only to formalise the Component structure.
// Make symbols that carry type information for TypeScript
export type ComponentType<T> = symbol & { __type?: T };