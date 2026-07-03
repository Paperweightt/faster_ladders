import { world } from "@minecraft/server";

export const config = {
  get ladder_speed(): number {
    return (world.getDynamicProperty("ladder_speed") as number) ?? 1.5;
  },
  set ladder_speed(value: number) {
    world.setDynamicProperty("ladder_speed", value);
  },
};
