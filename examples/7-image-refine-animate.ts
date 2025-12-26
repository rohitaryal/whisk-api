import { Whisk } from "../src/Whisk";
import { ImageAspectRatio, VideoGenerationModel } from "../src/Constants";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Creative Workflow");

    // Generate base image (Must be LANDSCAPE for video)
    console.log("Generating base image...");
    const baseImage = await project.generateImage({
        prompt: "A quiet forest in summer, realistic style",
        aspectRatio: ImageAspectRatio.LANDSCAPE
    });

    const basePath = baseImage.save("./workflow/1_base");
    console.log(`Base image saved: ${basePath}`);

    // Refine (Edit) the image
    console.log("Refining: Changing season to winter...");
    const refinedImage = await baseImage.refine("Make it winter with heavy snow");

    const refinedPath = refinedImage.save("./workflow/2_refined");
    console.log(`Refined image saved: ${refinedPath}`);

    // Animate (Image to Video)
    console.log("Animating: Adding movement...");
    try {
        const video = await refinedImage.animate(
            "Slow camera pan, snow falling gently",
            VideoGenerationModel.VEO_FAST_3_1
        );

        const videoPath = video.save("./workflow/3_video");
        console.log(`Video saved: ${videoPath}`);

        // Delete the final video from cloud
        console.log("Cleanup: Deleting generated video from cloud...");
        await video.deleteMedia();
        console.log("Done.");

    } catch (e) {
        console.error("Animation failed:", e);
    }
}

main();
