import { Whisk } from "../src/Whisk";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    // Replace this with a valid ID you generated previously
    // This ones public to everyone can test
    const targetMediaId = "7k4r91g4t0000";

    console.log(`Fetching info for ID: ${targetMediaId}`);

    try {
        const media = await Whisk.getMedia(targetMediaId, whisk.account);

        console.log("Media Information found:");
        console.log(`Type: ${media.mediaType}`);
        console.log(`Prompt: ${media.prompt}`);

        // Download the fetched media
        const savedPath = media.save("./downloads");
        console.log(`Media downloaded to: ${savedPath}`);

    } catch (error) {
        console.error("Failed to fetch media. ID might be invalid or expired.");
    }
}

main();
