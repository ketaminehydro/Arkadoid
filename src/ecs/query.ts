import type { ComponentType } from './component';
import type { EntityId } from './entity';

export interface Query {
  entities: EntityId[];
}

export interface QueryRecord extends Query {
  required: ComponentType<unknown>[];
  members: Set<EntityId>;
  entityIndex: Map<EntityId, number>;
}
