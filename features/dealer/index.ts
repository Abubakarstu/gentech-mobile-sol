export * from "./types";
export * from "./repositories/dealer.repository";
export * from "./services/dealer.service";
export * from "./actions/dealer.actions";
export type {
  AddInventoryInput,
  AddStaffInput,
  CreateBranchInput,
  CreateDealerInput,
  UpdateDealerInput,
} from "./schemas/dealer";
export { addInventoryToDealer as addInventory } from "./repositories/dealer.repository";
export { getUserDealer, getDealerStats } from "./services/dealer.service";
