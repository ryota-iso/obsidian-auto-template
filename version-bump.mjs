import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from src/manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("src/manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("src/manifest.json", JSON.stringify(manifest, null, "\t"));

// Also update the dist/manifest.json if it exists
try {
    let distManifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"));
    distManifest.version = targetVersion;
    writeFileSync("dist/manifest.json", JSON.stringify(distManifest, null, "\t"));
} catch (error) {
    console.log("dist/manifest.json not found, skipping update");
}

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
