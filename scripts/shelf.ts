import { Vector3Utils as vec3 } from "@minecraft/math";
import { Block, Player, system, Vector2, Vector3, world } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

const goal = { x: 0, y: 0.28, z: 0 };
const blockType = MinecraftBlockTypes.OakShelf;

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    player.onScreenDisplay.setActionBar(vec3.toString(player.getVelocity()));

    const opposite = vec3.multiply(player.getVelocity(), { x: 0, y: -1, z: 0 });

    player.applyImpulse(vec3.add(opposite, { y: -0.0204319 }));
  }
});

function getLadderLocation(block: Block): Vector3 {
  const direction = block.permutation.getState("minecraft:cardinal_direction");

  if (block.typeId !== blockType) throw new Error("Block is not of type 'minecraft:ladder'");

  // prettier-ignore
  switch (direction) {
    case "east": return vec3.add(block.location, { x: 0, z: 0.5 });
    case "west": return vec3.add(block.location, { x: 1, z: 0.5 });
    case "south": return vec3.add(block.location, { x: 0.5, z: 0 });
    case "north": return vec3.add(block.location, { x: 0.5, z: 1 });
    default: throw new Error(`Ladder rotation not implemented "${direction}"`);
  }
}

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
    const blockLocation = getLadderLocation(block);
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
