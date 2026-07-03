import { CommandPermissionLevel, CustomCommandParamType, Player, system } from "@minecraft/server";
import { config } from "./config";

system.beforeEvents.startup.subscribe((event) => {
  const { customCommandRegistry } = event;

  customCommandRegistry.registerCommand(
    {
      description: "Set max ladder speed",
      name: "fl:ladder_speed",
      permissionLevel: CommandPermissionLevel.Admin,
      cheatsRequired: false,
      optionalParameters: [{ name: "Value", type: CustomCommandParamType.Float }],
    },
    (origin, input): undefined => {
      if (input) config.ladder_speed = input;

      if (origin.sourceEntity instanceof Player) {
        origin.sourceEntity.sendMessage(`Ladder speed is set to ${config.ladder_speed}`);
      }
    }
  );
});
