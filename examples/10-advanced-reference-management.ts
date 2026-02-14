import { Whisk } from "../src/Whisk";
import { imageToBase64 } from "../src/Utils";
import type { MediaReference } from "../src/Types";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Advanced Reference Management");

    // Example 1: Upload and store IDs for reuse
    console.log("=== Example 1: Upload and Store IDs ===");
    const patrick = await project.addSubject(await imageToBase64("./assets/patrick.png"));
    const spongebob = await project.addSubject(await imageToBase64("./assets/spongebob.png"));
    const gym = await project.addScene(await imageToBase64("./assets/gym-scene.jpg"));
    const ghibli = await project.addStyle(await imageToBase64("./assets/style-ghibli.jpg"));

    console.log("Patrick ID:", patrick.mediaGenerationId);
    console.log("Spongebob ID:", spongebob.mediaGenerationId);
    console.log("Gym ID:", gym.mediaGenerationId);
    console.log("Ghibli Style ID:", ghibli.mediaGenerationId);

    // Simulate storing in database
    const database: Record<string, MediaReference> = {
        patrick,
        spongebob,
        gym,
        ghibli
    };

    // Example 2: Generate with all references
    console.log("\n=== Example 2: Generate with All References ===");
    const img1 = await project.generateImageWithReferences({
        prompt: "working out together",
        aspectRatio: "IMAGE_ASPECT_RATIO_PORTRAIT"
    });
    img1.save("./output");

    // Example 3: Remove specific character
    console.log("\n=== Example 3: Remove Specific Character ===");
    const removed = project.removeSubject(patrick.mediaGenerationId);
    console.log("Patrick removed:", removed);
    console.log("Remaining subjects:", project.subjects.length);

    const img2 = await project.generateImageWithReferences({
        prompt: "alone at gym",
        aspectRatio: "IMAGE_ASPECT_RATIO_SQUARE"
    });
    img2.save("./output");

    // Example 4: Clear all subjects, keep scene and style
    console.log("\n=== Example 4: Clear All Subjects ===");
    project.clearSubjects();
    console.log("Subjects after clear:", project.subjects.length);
    console.log("Scenes:", project.scenes.length);
    console.log("Styles:", project.styles.length);

    const img3 = await project.generateImageWithReferences("empty gym");
    img3.save("./output");

    // Example 5: Reuse IDs from "database" in new project
    console.log("\n=== Example 5: Reuse IDs in New Project ===");
    const project2 = await whisk.newProject("Story Part 2");

    // Load from database without re-uploading
    project2.addSubjectById(database.patrick.mediaGenerationId, database.patrick.caption);
    project2.addSubjectById(database.spongebob.mediaGenerationId, database.spongebob.caption);
    project2.addSceneById(database.gym.mediaGenerationId, database.gym.caption);

    console.log("Project 2 subjects:", project2.subjects.length);
    console.log("Project 2 scenes:", project2.scenes.length);
    console.log("Project 2 styles:", project2.styles.length);

    const img4 = await project2.generateImageWithReferences("new adventure");
    img4.save("./output");

    // Example 6: Mix and match - swap scene
    console.log("\n=== Example 6: Swap Scene ===");
    project2.clearScenes();
    // In real scenario, you'd have another scene ID from database
    console.log("Scenes after clear:", project2.scenes.length);

    // Example 7: Generate with NO style (flexibility)
    console.log("\n=== Example 7: Generate Without Style ===");
    const project3 = await whisk.newProject("No Style Test");
    project3.addSubjectById(database.patrick.mediaGenerationId, database.patrick.caption);
    project3.addSceneById(database.gym.mediaGenerationId, database.gym.caption);

    console.log("Has subjects:", project3.subjects.length > 0);
    console.log("Has scenes:", project3.scenes.length > 0);
    console.log("Has styles:", project3.styles.length > 0);

    const img5 = await project3.generateImageWithReferences("exercising");
    img5.save("./output");

    // Example 8: Clear all references at once
    console.log("\n=== Example 8: Clear All References ===");
    project3.clearAllReferences();
    console.log("Total references:", 
        project3.subjects.length + 
        project3.scenes.length + 
        project3.styles.length
    );

    console.log("\n=== Complete ===");
}

main();
