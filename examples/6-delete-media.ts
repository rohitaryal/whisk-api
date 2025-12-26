import { Whisk } from "../src/Whisk";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Temp Storage");

    console.log("Generating image...");
    const media = await project.generateImage("A sand castle on the beach");

    // Save it before deleting so we have a copy
    const path = media.save("./temp");
    console.log(`Image saved locally at: ${path}`);

    console.log("Deleting image from cloud...");

    // Delete the media
    await media.deleteMedia();

    console.log("Image deleted from server.");
}

main();
