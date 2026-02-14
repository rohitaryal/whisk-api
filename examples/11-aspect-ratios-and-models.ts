import { Whisk } from "../src/Whisk";
import { imageToBase64 } from "../src/Utils";
import { ImageAspectRatio } from "../src/Constants";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Aspect Ratio Test");

    // Upload references once
    console.log("Uploading references...");
    const character = await project.addSubject(await imageToBase64("./assets/patrick.png"));
    const scene = await project.addScene(await imageToBase64("./assets/gym-scene.jpg"));
    const style = await project.addStyle(await imageToBase64("./assets/style-ghibli.jpg"));

    console.log("Character:", character.caption);
    console.log("Scene:", scene.caption);
    console.log("Style:", style.caption);

    // Test 1: LANDSCAPE (default)
    console.log("\n=== Test 1: LANDSCAPE ===");
    const landscape = await project.generateImageWithReferences({
        prompt: "exercising in the gym",
        aspectRatio: ImageAspectRatio.LANDSCAPE
    });
    landscape.save("./output");
    console.log("Saved landscape image");

    // Test 2: PORTRAIT
    console.log("\n=== Test 2: PORTRAIT ===");
    const portrait = await project.generateImageWithReferences({
        prompt: "standing tall in the gym",
        aspectRatio: ImageAspectRatio.PORTRAIT
    });
    portrait.save("./output");
    console.log("Saved portrait image");

    // Test 3: SQUARE
    console.log("\n=== Test 3: SQUARE ===");
    const square = await project.generateImageWithReferences({
        prompt: "posing in the gym",
        aspectRatio: ImageAspectRatio.SQUARE
    });
    square.save("./output");
    console.log("Saved square image");

    // Test 4: With custom seed for reproducibility
    console.log("\n=== Test 4: Custom Seed ===");
    const seeded1 = await project.generateImageWithReferences({
        prompt: "lifting weights",
        aspectRatio: ImageAspectRatio.LANDSCAPE,
        seed: 12345
    });
    seeded1.save("./output");
    console.log("Saved seeded image (seed: 12345)");

    // Test 5: Same seed should produce similar result
    const seeded2 = await project.generateImageWithReferences({
        prompt: "lifting weights",
        aspectRatio: ImageAspectRatio.LANDSCAPE,
        seed: 12345
    });
    seeded2.save("./output");
    console.log("Saved seeded image again (seed: 12345)");

    // Test 6: String prompt (uses defaults)
    console.log("\n=== Test 6: Simple String Prompt ===");
    const simple = await project.generateImageWithReferences("relaxing after workout");
    simple.save("./output");
    console.log("Saved with default settings (LANDSCAPE)");

    console.log("\n=== Complete ===");
    console.log("Generated 6 images with different aspect ratios and settings");
}

main();
