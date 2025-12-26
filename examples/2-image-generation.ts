import { Whisk } from "../src/Whisk";
import { ImageAspectRatio, ImageGenerationModel } from "../src/Constants";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    // Initialize a project
    const project = await whisk.newProject("Generation Demo");

    // Simple Generation (Just prompt)
    console.log("Generating simple image...");
    const simpleMedia = await project.generateImage("A cute cyberpunk cat in neon lights");

    // Save to default directory
    console.log("Saving simple image...");
    const simplePath = simpleMedia.save();
    console.log(`Saved at: ${simplePath}`);


    // Advanced Generation (Full Parameters)
    console.log("Generating advanced image...");
    const advancedMedia = await project.generateImage({
        prompt: "Epic landscape of mars, cinematic lighting",
        seed: 99999, // Fixed seed for reproducibility
        model: ImageGenerationModel.IMAGEN_3_5,
        aspectRatio: ImageAspectRatio.LANDSCAPE
    });

    // Save to specific directory
    console.log("Saving advanced image...");
    const advancedPath = advancedMedia.save("./output");
    console.log(`Saved at: ${advancedPath}`);
}

main();
