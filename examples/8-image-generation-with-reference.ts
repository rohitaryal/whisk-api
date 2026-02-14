import { Whisk } from "../src/Whisk.ts";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Generation with reference");

    // Generate images and use them as references
    console.log("Generating subject image...")
    const subjectImages = await whisk.generateImage("jack the ripper in zebra stripped suit");
    project.addSubjectById(subjectImages[0].mediaGenerationId, subjectImages[0].prompt);

    console.log("Generating scene image...")
    const sceneImages = await whisk.generateImage("Green hilly farm with blue sky");
    project.addSceneById(sceneImages[0].mediaGenerationId, sceneImages[0].prompt);

    console.log("Generating style image...")
    const styleImages = await whisk.generateImage("spontaneous, often unstructured, and hand-drawn illustration that combines various, seemingly random elements into a cohesive, often whimsical, composition");
    project.addStyleById(styleImages[0].mediaGenerationId, styleImages[0].prompt);

    console.log("Generating final image with above references")
    const generatedImage = await project.generateImageWithReferences("A pilot driving helicopter")
    generatedImage.save("./output")
}

main()
