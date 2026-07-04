import { Vector3Utils as vec3 } from "@minecraft/math";
import { Block, Player, system, Vector2, Vector3, world } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import "./commands.ts";
import { config } from "./config.js";

const blockType = MinecraftBlockTypes.Ladder;
const velocityMap: WeakMap<Player, Vector3> = new WeakMap();
const soundMap: WeakMap<Player, { height: number; blocks: number }> = new WeakMap();

function getMovementDirection(player: Player): Vector2 {
  const input = player.inputInfo.getMovementVector();
  const view = player.getViewDirection();
  const angle = Math.atan2(view.x, view.z);

  return {
    x: input.x * Math.sin(angle + Math.PI / 2) + input.y * Math.sin(angle),
    y: input.x * Math.cos(angle + Math.PI / 2) + input.y * Math.cos(angle),
  };
}

function getVelocity(player: Player): Vector3 {
  if (velocityMap.get(player)) {
    return velocityMap.get(player) as Vector3;
  } else {
    const velocity = player.getVelocity();
    velocityMap.set(player, velocity);
    return velocity;
  }
}

function setVelocity(player: Player, vector?: Vector3) {
  if (!vector) {
    velocityMap.delete(player);
    return;
  }

  velocityMap.set(player, vector);
  player.applyImpulse(vector);
}

function getLadderLocation(block: Block): Vector3 {
  const direction = block.permutation.getState("facing_direction");

  if (block.typeId !== blockType) throw new Error("Block is not of type 'minecraft:ladder'");

  // prettier-ignore
  switch (direction) {
    case 5: return vec3.add(block.location, { x: 0, z: 0.5 });
    case 4: return vec3.add(block.location, { x: 1, z: 0.5 });
    case 3: return vec3.add(block.location, { x: 0.5, z: 0 });
    case 2: return vec3.add(block.location, { x: 0.5, z: 1 });
    default: throw new Error("Ladder rotation not implemented");
  }
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const dimension = player.dimension;
    if (player.location.y < dimension.heightRange.min) continue;
    if (player.location.y > dimension.heightRange.max) continue;

    const velocity = getVelocity(player);
    const highLadderLocation = vec3.add(player.location, { y: velocity.y });

    if (highLadderLocation.y < dimension.heightRange.min) continue;
    if (highLadderLocation.y > dimension.heightRange.max) continue;

    const block = dimension.getBlock(player.location);
    const highLadder = dimension.getBlock(highLadderLocation);

    if (highLadder?.typeId !== blockType || block?.typeId !== blockType) {
      setVelocity(player);
      continue;
    }

    const { x, y: z } = getMovementDirection(player);
    const blockLocation = getLadderLocation(block);
    const outwardsDirection = vec3.normalize(vec3.subtract(player.location, blockLocation));
    const playerDirection = vec3.normalize({ x, y: 0, z });
    const dot = vec3.dot(playerDirection, outwardsDirection);

    if (dot < 0) {
      const impulse = {
        x: 0,
        y: Math.min(Math.max(velocity.y, 0.2) - 0.1, config.ladder_speed) + 0.2,
        z: 0,
      };

      setVelocity(player, impulse);

      if (!soundMap.has(player)) {
        soundMap.set(player, { height: block.y, blocks: 1 });
      } else {
        const soundData = soundMap.get(player) as { height: number; blocks: number };

        if (soundData.height !== block.y) {
          soundData.height = block.y;
          soundData.blocks++;
        }

        if (soundData.blocks % 5 === 0) {
          player.playSound("use.ladder");
        }
      }
    } else {
      setVelocity(player);
    }
  }
});
