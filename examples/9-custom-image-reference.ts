import { Whisk } from "../src/Whisk";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    const project = await whisk.newProject("Custom Image Reference");

    // let add 2 characters as subject (caption + upload handled automatically)
    console.log("Uploading local image as subject...")
    await project.addSubject({ file: "./assets/patrick.png" })
    await project.addSubject({ file: "./assets/spongebob.png" })

    // can also use a URL directly
    console.log("Uploading URL image as scene...")
    await project.addScene({ file: "./assets/gym-scene.jpg" })

    console.log("Uploading URL image as style...")
    await project.addStyle({ file: "./assets/style-ghibli.jpg" })

    console.log("Generating final image with custom references...")
    const generatedImage = await project.generateImageWithReferences("working out in the gym")
    generatedImage.save("./output")
}

main()
