import { describe, expect, test } from "bun:test";
import { Whisk } from "../src/Whisk";
import { imageToBase64 } from "../src/Utils";
import { ImageAspectRatio, ImageGenerationModel } from "../src/Constants";

const cookie = process.env.COOKIE;

if (!cookie) {
    console.warn("Skipping integration tests: COOKIE environment variable is missing.");
    test.skip("Integration tests (Skipped due to missing COOKIE)", () => { });
} else {
    const whisk = new Whisk(cookie);

    test("Generate caption", async () => {
        const result = await Whisk.generateCaption(
            await imageToBase64("assets/banner.jpeg"),
            whisk.account
        );

        expect(result).toBeArrayOfSize(1);
        expect(result[0]).toBeString();
    }, 20000);

    test("Generate multiple caption", async () => {
        const result = await Whisk.generateCaption(
            await imageToBase64("assets/banner.jpeg"),
            whisk.account, 8
        );

        expect(result).toBeArrayOfSize(8);

        result.forEach(caption => expect(caption).toBeString());
    }, 20000);

    test("Get media information", async () => {
        const result = await Whisk.getMedia("7k4r91g4t0000", whisk.account);

        expect(result).toBeDefined()
        expect(result.account).toBe(whisk.account);
        expect(result.prompt.length).toBeGreaterThan(1);
        // NOTE: Hard coded here to match my results
        expect(result.aspectRatio).toBe("IMAGE_ASPECT_RATIO_LANDSCAPE")
        expect(result.mediaType).toBe("IMAGE");
        expect(result.model).toBe("IMAGEN_3_5");
        expect(result.seed).toBe(170884);
    }, 20000);

    test("Create new project", async () => {
        const result = await whisk.newProject("STUPID PROJECT");

        expect(result.account).toBe(whisk.account);
        expect(result.projectId).toBeString();
    }, 20000);

    test("Generate image", async () => {
        const result = await whisk.newProject("STUPID PROJECT");

        const generatedImage = await result.generateImage("Scary spongebob face");

        expect(generatedImage.account).toBe(whisk.account);
        // These are default ones so 
        expect(generatedImage.aspectRatio).toBe("IMAGE_ASPECT_RATIO_LANDSCAPE");
        expect(generatedImage.model).toBe("IMAGEN_3_5");
        // Min base64 image length
        expect(generatedImage.encodedMedia.length).toBeGreaterThan(82);
        expect(generatedImage.mediaGenerationId.length).toBeGreaterThan(10);
        expect(generatedImage.seed).toBeNumber()
        expect(generatedImage.workflowId).toBe(result.projectId);
    }, 20000);

    test("Generate image with parameters", async () => {
        const result = await whisk.newProject();

        const generatedImage = await result.generateImage({
            prompt: "A scary spongebob face",
            aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE",
            model: "IMAGEN_3_5",
            seed: 123,
        });

        expect(generatedImage.aspectRatio).toBe("IMAGE_ASPECT_RATIO_LANDSCAPE");
        expect(generatedImage.model).toBe("IMAGEN_3_5");
        expect(generatedImage.encodedMedia.length).toBeGreaterThan(82);
        expect(generatedImage.mediaGenerationId.length).toBeGreaterThan(10);
        expect(generatedImage.seed).toBeNumber()
        expect(generatedImage.workflowId).toBe(result.projectId);

    }, 20000);

    test("Refine image", async () => {
        const result = await whisk.newProject();

        const generatedImage = await result.generateImage("A cool master heker");

        const refinedImage = await generatedImage.refine("Master heker is actually a cat");

        expect(refinedImage).toBeDefined()
        expect(refinedImage.account).toBe(whisk.account);
        expect(refinedImage.aspectRatio).toBe(generatedImage.aspectRatio);
        expect(refinedImage.encodedMedia).not.toBe(generatedImage.aspectRatio);
        expect(refinedImage.mediaGenerationId).toBe(generatedImage.mediaGenerationId);
        expect(refinedImage.model).toBe("GEM_PIX");
        expect(refinedImage.refined).toBeTrue();
        expect(refinedImage.workflowId).toBe(generatedImage.workflowId);
    }, 40000); // Large timeout because generation + refinement

    test("Nested image refinement", async () => {
        const result = await whisk.newProject();

        const generatedImage = await result.generateImage("A cool master heker");

        let refinedImage = await generatedImage.refine("Master heker has cute a cat");
        refinedImage = await refinedImage.refine("THe cat has red eyes");

        expect(refinedImage).toBeDefined()
        expect(refinedImage.account).toBe(whisk.account);
        expect(refinedImage.aspectRatio).toBe(generatedImage.aspectRatio);
        expect(refinedImage.encodedMedia).not.toBe(generatedImage.aspectRatio);
        expect(refinedImage.mediaGenerationId).toBe(generatedImage.mediaGenerationId);
        expect(refinedImage.model).toBe("GEM_PIX");
        expect(refinedImage.refined).toBeTrue();
        expect(refinedImage.workflowId).toBe(generatedImage.workflowId);
    }, 60000); // Large timeout because generation + refinement + refinement

    describe("Generate image with diff. models", async () => {
        const result = await whisk.newProject();

        Object.values(ImageGenerationModel).forEach(model => {
            test("Selected model: " + model, async () => {
                const generatedImage = await result.generateImage({
                    model, prompt: "Scary spongebob face",
                });

                expect(generatedImage.aspectRatio).toBe("IMAGE_ASPECT_RATIO_LANDSCAPE");
                expect(generatedImage.model).toBe(model);
                expect(generatedImage.encodedMedia.length).toBeGreaterThan(82);
                expect(generatedImage.mediaGenerationId.length).toBeGreaterThan(10);
                expect(generatedImage.seed).toBeNumber()
                expect(generatedImage.workflowId).toBe(result.projectId);
            }, 20000);
        });
    });

    describe("Generate image with diff. aspect ratio", async () => {
        const result = await whisk.newProject();

        Object.values(ImageAspectRatio).forEach(aspectRatio => {
            test("Selected aspect ratio: " + aspectRatio, async () => {
                const generatedImage = await result.generateImage({
                    aspectRatio, prompt: "Scary spongebob face",
                });

                expect(generatedImage.aspectRatio).toBe(aspectRatio);
                expect(generatedImage.model).toBe("IMAGEN_3_5");
                expect(generatedImage.encodedMedia.length).toBeGreaterThan(82);
                expect(generatedImage.mediaGenerationId.length).toBeGreaterThan(10);
                expect(generatedImage.seed).toBeNumber()
                expect(generatedImage.workflowId).toBe(result.projectId);
            }, 20000);
        })
    });

    test("Generate image with imagefx", async () => {
        let image = await whisk.generateImage("a cute cat");
        expect(image).toBeArrayOfSize(1);
        image = image[0];

        expect(image.account).toBe(whisk.account);
        expect(image.encodedMedia).toBeString();
        expect(image.encodedMedia.length).toBeGreaterThan(82);
        expect(image.model).toBe("IMAGEN_3_5");
    }, 20000);


    test("Generate multiple images with imagefx", async () => {
        let image = await whisk.generateImage("a cute cat", 4);
        expect(image).toBeArrayOfSize(4);
        image = image[0];

        expect(image.account).toBe(whisk.account);
        expect(image.encodedMedia).toBeString();
        expect(image.encodedMedia.length).toBeGreaterThan(82);
        expect(image.model).toBe("IMAGEN_3_5");
    }, 20000)
}
