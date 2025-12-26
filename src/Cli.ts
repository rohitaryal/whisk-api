#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import { Whisk } from "./Whisk.js";
import { imageToBase64 } from "./Utils.js";
import {
    ImageAspectRatio,
    ImageGenerationModel,
    VideoGenerationModel
} from "./Constants.js";

const y = yargs(hideBin(process.argv));

await y
    .scriptName("whisk")
    .usage('$0 <cmd> [args]')
    .command(
        "generate",
        "Generate new images using a temporary project",
        (yargs) => {
            return yargs
                .option("prompt", {
                    alias: "p",
                    describe: "Description of the image",
                    type: "string",
                    demandOption: true,
                })
                .option("model", {
                    alias: "m",
                    describe: "Image generation model",
                    type: "string",
                    default: "IMAGEN_3_5",
                    choices: Object.keys(ImageGenerationModel)
                })
                .option("aspect", {
                    alias: "a",
                    describe: "Aspect ratio",
                    type: "string",
                    default: "LANDSCAPE",
                    choices: ["SQUARE", "PORTRAIT", "LANDSCAPE"]
                })
                .option("seed", {
                    alias: "s",
                    describe: "Seed value (0 for random)",
                    type: "number",
                    default: 0,
                })
                .option("dir", {
                    alias: "d",
                    describe: "Output directory",
                    type: "string",
                    default: "./output",
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            console.log("[*] Initializing session...");

            const project = await whisk.newProject(`CLI-Gen-${Date.now()}`);
            console.log(`[*] Created temporary workflow: ${project.projectId}`);

            try {
                console.log("[*] Generating image...");

                const aspectKey = argv.aspect as keyof typeof ImageAspectRatio;
                const aspectVal = ImageAspectRatio[aspectKey];

                const media = await project.generateImage({
                    prompt: argv.prompt,
                    model: ImageGenerationModel[argv.model as keyof typeof ImageGenerationModel],
                    aspectRatio: aspectVal,
                    seed: argv.seed
                });

                const savedPath = media.save(argv.dir);
                console.log(`[+] Image generated successfully!`);
                console.log(`[+] Saved to: ${savedPath}`);
                console.log(`[+] ID: ${media.mediaGenerationId}`);

            } catch (error) {
                console.error("[!] Generation failed:", error);
            }
        }
    )
    .command(
        "animate <mediaId>",
        "Animate an existing landscape image into a video",
        (yargs) => {
            return yargs
                .positional("mediaId", {
                    describe: "The ID of the image to animate",
                    type: "string",
                    demandOption: true
                })
                .option("script", {
                    alias: "s",
                    describe: "Prompt/Script for the video animation",
                    type: "string",
                    demandOption: true
                })
                .option("model", {
                    alias: "m",
                    describe: "Video generation model",
                    type: "string",
                    default: "VEO_FAST_3_1",
                    choices: Object.keys(VideoGenerationModel)
                })
                .option("dir", {
                    alias: "d",
                    describe: "Output directory",
                    type: "string",
                    default: "./output",
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            console.log("[*] Fetching original media...");

            try {
                const originalMedia = await Whisk.getMedia(argv.mediaId, whisk.account);

                console.log("[*] Requesting animation (this takes time)...");

                const videoMedia = await originalMedia.animate(
                    argv.script,
                    VideoGenerationModel[argv.model as keyof typeof VideoGenerationModel]
                );

                const savedPath = videoMedia.save(argv.dir);
                console.log(`[+] Video generated successfully!`);
                console.log(`[+] Saved to: ${savedPath}`);

            } catch (error) {
                console.error("[!] Animation failed:", error);
            }
        }
    )
    .command(
        "refine <mediaId>",
        "Edit/Refine an existing image",
        (yargs) => {
            return yargs
                .positional("mediaId", {
                    describe: "The ID of the image to refine",
                    type: "string",
                    demandOption: true
                })
                .option("prompt", {
                    alias: "p",
                    describe: "Instruction for editing (e.g., 'Make it snowy')",
                    type: "string",
                    demandOption: true
                })
                .option("dir", {
                    alias: "d",
                    describe: "Output directory",
                    type: "string",
                    default: "./output",
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            console.log("[*] Fetching original media...");

            try {
                const originalMedia = await Whisk.getMedia(argv.mediaId, whisk.account);

                console.log("[*] Refining image...");
                const refinedMedia = await originalMedia.refine(argv.prompt);

                const savedPath = refinedMedia.save(argv.dir);
                console.log(`[+] Image refined successfully!`);
                console.log(`[+] Saved to: ${savedPath}`);

            } catch (error) {
                console.error("[!] Refinement failed:", error);
            }
        }
    )
    .command(
        "caption",
        "Generate captions for a local image file",
        (yargs) => {
            return yargs
                .option("file", {
                    alias: "f",
                    describe: "Path to local image file",
                    type: "string",
                    demandOption: true
                })
                .option("count", {
                    alias: "n",
                    describe: "Number of captions",
                    type: "number",
                    default: 1
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            console.log("[*] Reading file and generating captions...");

            try {
                const base64 = await imageToBase64(argv.file);

                // Split at the comma to get the raw base64 string
                const rawBase64 = base64.split(",")[1];

                const captions = await Whisk.generateCaption(rawBase64, whisk.account, argv.count);

                console.log("\n--- Captions ---");
                captions.forEach((cap, i) => {
                    console.log(`[${i + 1}] ${cap}`);
                });

            } catch (error) {
                console.error("[!] Captioning failed:", error);
            }
        }
    )
    .command(
        "fetch <mediaId>",
        "Download an existing generated media by ID",
        (yargs) => {
            return yargs
                .positional("mediaId", {
                    describe: "Unique ID of generated media",
                    type: "string",
                    demandOption: true,
                })
                .option("dir", {
                    alias: "d",
                    describe: "Output directory",
                    type: "string",
                    default: "./output",
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            try {
                console.log(`[*] Fetching media info for ${argv.mediaId}...`);
                const media = await Whisk.getMedia(argv.mediaId, whisk.account);

                const savedPath = media.save(argv.dir);
                console.log(`[+] Downloaded successfully to: ${savedPath}`);
            } catch (error) {
                console.error("[!] Fetch failed:", error);
            }
        }
    )
    .command(
        "delete <mediaId>",
        "Delete a generated media from the cloud",
        (yargs) => {
            return yargs
                .positional("mediaId", {
                    describe: "Unique ID of generated media to delete",
                    type: "string",
                    demandOption: true,
                })
                .option("cookie", {
                    alias: "c",
                    describe: "Google account cookie",
                    type: "string",
                    demandOption: true,
                })
        },
        async (argv) => {
            const whisk = new Whisk(argv.cookie);
            await whisk.account.refresh();
            console.log(whisk.account.toString());

            try {
                console.log(`[*] Deleting media ${argv.mediaId}...`);
                await Whisk.deleteMedia(argv.mediaId, whisk.account);
                console.log(`[+] Media deleted.`);
            } catch (error) {
                console.error("[!] Delete failed:", error);
            }
        }
    )
    .demandCommand(1, "You need to provide a command")
    .strict()
    .help()
    .alias("help", "h")
    .parse();
