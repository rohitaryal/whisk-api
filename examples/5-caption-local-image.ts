import { Whisk } from "../src/Whisk";
import { imageToBase64 } from "../src/Utils";

const whisk = new Whisk(process.env.COOKIE!);

async function main() {
    // Path to local image
    const imagePath = "../assets/banner.jpeg";

    console.log(`Reading local image: ${imagePath}`);

    // Convert local file to base64
    const base64Data = await imageToBase64(imagePath);

    console.log("Generating captions...");

    // Generate 3 captions
    const captions = await Whisk.generateCaption(base64Data, whisk.account, 3);

    console.log("Generated Captions:");
    captions.forEach((cap, i) => {
        console.log(`${i + 1}. ${cap}`);
    });
}

main();
