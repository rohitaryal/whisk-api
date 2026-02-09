import { Whisk } from "../src/Whisk.ts";

const whisk = new Whisk(process.env.COOKIE!);

// PLEASE READ THIS:
//
// Subjects, Scenes and Styles are used in following format
//
// You provide a in detail caption --> image generated --> detailed caption --> Used as subject,scene,style
// You provide your own image --> detail caption --> Used as subject,scene,style
//
// The point is, it is provided as a prompt, not the image directly.

async function main() {
    const project = await whisk.newProject("Generation with reference");

    // Lets add a subject
    console.log("Attaching a subject")
    project.subjects.push(...await whisk.generateImage("jack the ripper in zebra stripped suit"));

    // Lets add a scene
    console.log("Attaching a scene")
    project.scenes.push(...await whisk.generateImage("Green hilly farm with blue sky"))

    // Lets add a style
    console.log("Attaching a style")
    project.styles.push(...await whisk.generateImage("spontaneous, often unstructured, and hand-drawn illustration that combines various, seemingly random elements into a cohesive, often whimsical, composition"))

    console.log("Generating final image with above references")
    const generatedImage = await project.generateImageWithReferences("A pilot driving helicopter")
    generatedImage.save("./output")
}

main()
