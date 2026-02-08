import { describe, expect, test } from "bun:test";
import { Whisk } from "../src/Whisk";

const cookie = process.env.COOKIE;

if (!cookie) {
    console.warn("Skipping integration tests: COOKIE environment variable is missing.");
    test.skip("Integration tests (Skipped due to missing COOKIE)", () => { });
} else {
    const whisk = new Whisk(cookie);

    test("Generate image with subject reference", async () => {
        const project = await whisk.newProject("Reference Test Project");

        const subjectImage = await project.generateImage("A cute cat");
        expect(subjectImage).toBeDefined();

        project.subjects.push(subjectImage);

        const generatedImage = await project.generateImageWithReferences("The cat wearing a hat");

        expect(generatedImage).toBeDefined();
        expect(generatedImage.account).toBe(whisk.account);
        expect(generatedImage.mediaType).toBe("IMAGE");
        expect(generatedImage.model).toBe("GEM_PIX");
        expect(generatedImage.workflowId).toBe(project.projectId);

        await project.delete();
    }, 60000);

    test("Generate image with style reference", async () => {
        const project = await whisk.newProject("Style Test Project");

        const styleImage = await project.generateImage("Oil painting of a sunset");
        expect(styleImage).toBeDefined();

        project.styles.push(styleImage);

        const generatedImage = await project.generateImageWithReferences("A futuristic city");

        expect(generatedImage).toBeDefined();
        expect(generatedImage.model).toBe("GEM_PIX");

        await project.delete();
    }, 60000);

    test("Generate image with scene reference", async () => {
        const project = await whisk.newProject("Scene Test Project");

        const sceneImage = await project.generateImage("A dense forest");
        expect(sceneImage).toBeDefined();

        project.scenes.push(sceneImage);

        const generatedImage = await project.generateImageWithReferences("A bear standing");

        expect(generatedImage).toBeDefined();
        expect(generatedImage.model).toBe("GEM_PIX");

        await project.delete();
    }, 60000);
}
