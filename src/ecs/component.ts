// This file serves only to formalise the Entity.
// Make symbols that carry type information for TypeScript
export type ComponentType<T> = symbol & { __type?: T };