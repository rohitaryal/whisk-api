import { Whisk } from "../src/Whisk";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const HARDCODED_ID = "7k4r91g4t0000";

    console.log(`Fetching media: ${HARDCODED_ID}`);

    // Get the media object first
    const media = await Whisk.getMedia(HARDCODED_ID, whisk.account);

    // Save it locally just in case
    media.save("./captions_input");

    console.log("Generating captions...");

    // Generate 4 variations of captions
    const captions = await media.caption(4);

    console.log("Generated Captions:");
    captions.forEach((cap, i) => {
        console.log(`${i + 1}. ${cap}`);
    });
}

main();
