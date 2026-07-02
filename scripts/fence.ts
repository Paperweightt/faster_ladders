import { Vector3Utils as vec3 } from "@minecraft/math";
import { Player, system, Vector2, world } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

const goal = { x: 0, y: 0.28, z: 0 };
const blockType = MinecraftBlockTypes.AcaciaFence;

function getMovementDirection(player: Player): Vector2 {
  const input = player.inputInfo.getMovementVector();
  const view = player.getViewDirection();
  const angle = Math.atan2(view.x, view.z);

  return {
    x: input.x * Math.sin(angle + Math.PI / 2) + input.y * Math.sin(angle),
    y: input.x * Math.cos(angle + Math.PI / 2) + input.y * Math.cos(angle),
  };
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const block = player.dimension.getBlock(player.location);

    if (block?.typeId !== blockType) continue;

    const { x, y: z } = getMovementDirection(player);
    const blockLocation = vec3.add(block.location, { x: 0.5, z: 0.5 });
    const outwardsDirection = vec3.normalize(vec3.subtract(player.location, blockLocation));
    const playerDirection = vec3.normalize({ x, y: 0, z });
    const dot = vec3.dot(playerDirection, outwardsDirection);

    const impulse = {
      x: 0,
      y: goal.y - player.getVelocity().y,
      z: 0,
    };

    if (dot < 0) player.applyImpulse(impulse);
  }
});
