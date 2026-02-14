import { Whisk } from "../src/Whisk";
import { imageToBase64 } from "../src/Utils";
import { ImageAspectRatio } from "../src/Constants";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Custom Image Reference");

    // let add 2 characters as subject (caption + upload handled automatically)
    console.log("Uploading local image as subject...")
    const SubjectBase64 = await imageToBase64("./assets/patrick.png");
    const Subject1Base64 = await imageToBase64("./assets/spongebob.png");
    const patrick = await project.addSubject(SubjectBase64)
    const spongebob = await project.addSubject(Subject1Base64)

    console.log("Patrick uploaded:", patrick.mediaGenerationId)
    console.log("Spongebob uploaded:", spongebob.mediaGenerationId)

    // can also use imageFromUrl
    console.log("Uploading URL image as scene...")
    const SceneBase64 = await imageToBase64("./assets/gym-scene.jpg");
    const gym = await project.addScene(SceneBase64)

    console.log("Uploading URL image as style...")
    const StyleBase64 = await imageToBase64("./assets/style-ghibli.jpg");
    const style = await project.addStyle(StyleBase64)

    console.log("Generating final image with custom references...")
    const generatedImage = await project.generateImageWithReferences({
        prompt: "working out in the gym",
        aspectRatio: ImageAspectRatio.SQUARE
    });
    generatedImage.save("./output")
}

main()
