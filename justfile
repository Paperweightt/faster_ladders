set windows-shell := ["powershell.exe", "-NoProfile", "/c"]

prettier := ".\\node_modules\\.bin\\prettier.cmd"

mojang := env_var("USERPROFILE")+"/AppData/Roaming/Minecraft Bedrock/Users/Shared/games/com.mojang"
mojang_bp := mojang + "/development_behavior_packs/ladder_c534c4f8-448d-4bf5-819f-de642e4a6dc8"
mojang_rp := mojang + "/development_resource_packs/ladder_378a50c5-8b17-4928-8bc5-165136450a3d"

bump TYPE:
    mcbe bump \
    -p ./behavior_packs/pack0/manifest.json \
    -p ./resource_packs/pack1/manifest.json \
    -t {{ TYPE }}
    {{prettier}} --write .\behavior_packs\pack0\manifest.json
    {{prettier}} --write .\resource_packs\pack1\manifest.json

build:
    node esbuild.config.mjs

build-watch:
    node esbuild.config.mjs --watch

link:
    mcbe link \
    -i ./behavior_packs/pack0 \
    -o "{{mojang_bp}}"

unlink:
    mcbe unlink "{{mojang_bp}}"

mcaddon:
    Compress-Archive \
    -Path "./behavior_packs/pack0" \
    -DestinationPath "./dist/faster_ladder.mcaddon" \
    -CompressionLevel "Optimal" \
    -Force
    
