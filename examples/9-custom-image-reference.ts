import { Whisk } from "../src/Whisk";
import { imageToBase64, imageFromUrl } from "../src/Utils";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Custom Image Reference");

    // let add 2 characters as subject (caption + upload handled automatically)
    console.log("Uploading local image as subject...")
    const SubjectBase64 = await imageToBase64("./assets/patrick.png");
    const Subject1Base64 = await imageToBase64("./assets/spongebob.png");
    await project.addSubject(SubjectBase64)
    await project.addSubject(Subject1Base64)

    // can also use imageFromUrl
    console.log("Uploading URL image as scene...")
    const SceneBase64 = await imageToBase64("./assets/gym-scene.jpg");
    await project.addScene(SceneBase64)

    console.log("Uploading URL image as style...")
    const StyleBase64 = await imageToBase64("./assets/style-ghibli.jpg");
    await project.addStyle(StyleBase64)

    console.log("Generating final image with custom references...")
    const generatedImage = await project.generateImageWithReferences("working out in the gym")
    generatedImage.save("./output")
}

main()
