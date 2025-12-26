
# whisk-api

Unofficial free reverse engineered API for Google's Whisk from [labs.google](https://labs.google).

![Banner](https://raw.githubusercontent.com/rohitaryal/whisk-api/refs/heads/main/assets/banner.jpeg)

## Installation

```bash
npm i -g @rohitaryal/whisk-api
# or
bun i -g @rohitaryal/whisk-api
```

## Features

1. Text to Image using `IMAGEN_3_5`
2. Image to Video (Animation) using `VEO`
3. Image Refinement (Editing/Inpainting using NanoBanana)
4. Image to Text
5. Project & Media Management
6. Command line support

## Usage

`whisk` can be invoked through both command line and as a module.

<details>
<summary style="font-weight: bold;font-size:15px;">Command Line</summary>

Make sure you have:

1. Installed `whisk-api` globally ([How to install?](#installation))
2. Obtained your google account cookies ([How to get cookies?](#help))
3. Set env variable `COOKIE` containing your cookie

    Bash:

    ```bash
    export COOKIE="__YOUR__COOKIE__HERE__"
    ```

    Command Prompt:

    ```bat
    set "COOKIE=__YOUR__COOKIE__HERE__"
    ```

    Powershell:

    ```ps
    $COOKIE = "__YOUR__GOOGLE__COOKIE__HERE__"
    ```

#### Basic Usages

> **NOTE:**
> If you are using environment variables, keep the quotes around cookie to avoid word-splitting and authentication errors.
>
> - Linux/macOS: `"$COOKIE"`
> - PowerShell: `"$env:COOKIE"`
> - Command Prompt: `"%COOKIE%"`

- Generating image with prompt

    ```bash
    # saves generated image at ./output/ by default
    whisk generate --prompt "A bad friend" --cookie "$COOKIE"
    ```

- Selecting a specific aspect ratio

    ```bash
    # Available: SQUARE, PORTRAIT, LANDSCAPE (Default: LANDSCAPE)
    whisk generate --prompt "Reptillian CEO" --aspect "PORTRAIT" --cookie "$COOKIE"
    ```

- Animating an existing image (Image to Video)

    ```bash
    # Requires the Media ID of a LANDSCAPE image
    whisk animate "__MEDIA__ID__HERE__" --script "Camera pans slowly to the left" --cookie "$COOKIE"
    ```

- Refining (Editing) an image

    ```bash
    whisk refine "__MEDIA__ID__HERE__" --prompt "Add a red hat to the character" --cookie "$COOKIE"
    ```

- Generating caption from a local image file

    ```bash
    whisk caption --file /path/to/img.webp --count 3 --cookie "$COOKIE"
    ```

- Deleting media from the cloud

    ```bash
    whisk delete "__MEDIA__ID__HERE__" --cookie "$COOKIE"
    ```

Full generation help:

```text
whisk generate <options>

Options:
      --version     Show version number
  -h, --help        Show help
  -p, --prompt      Description of the image
  -m, --model       Image generation model (Default: IMAGEN_3_5)
  -a, --aspect      Aspect ratio (SQUARE, PORTRAIT, LANDSCAPE)
  -s, --seed        Seed value (0 for random)
  -d, --dir         Output directory
  -c, --cookie      Google account cookie
```

Full animation help:

```text
whisk animate <mediaId>

Positionals:
  mediaId  The ID of the image to animate

Options:
  -s, --script    Prompt/Script for the video animation
  -m, --model     Video generation model (Default: VEO_FAST_3_1)
  -d, --dir       Output directory
  -c, --cookie    Google account cookie
```

Full fetch help:

```text
whisk fetch <mediaId>

Positionals:
  mediaId  Unique ID of generated media

Options:
  -d, --dir      Output directory
  -c, --cookie   Google account cookie
```

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Importing as module</summary>

- Basic image generation

    ```typescript
    import { Whisk } from "@rohitaryal/whisk-api";

    const whisk = new Whisk(process.env.COOKIE);

    // 1. Create a project context
    const project = await whisk.newProject("My Project");

    // 2. Generate image
    const media = await project.generateImage("A big black cockroach");
    
    // 3. Save to disk
    const savedPath = media.save("./output");
    console.log("[+] Image saved at: " + savedPath);
    ```

- Advanced Workflow (Gen -> Refine -> Animate)

    ```typescript
    import { Whisk, ImageAspectRatio } from "@rohitaryal/whisk-api";

    const whisk = new Whisk(process.env.COOKIE);
    const project = await whisk.newProject("Video Workflow");

    // 1. Generate Base Image (Must be LANDSCAPE for video)
    const baseImage = await project.generateImage({
        prompt: "A cybernetic city",
        aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
    });

    // 2. Refine (Edit)
    const refinedImage = await baseImage.refine("Make it raining neon rain");

    // 3. Animate (Video)
    const video = await refinedImage.animate("Camera flies through the streets", "VEO_FAST_3_1");

    video.save("./videos");
    ```

More examples are at: [/examples](https://github.com/rohitaryal/imageFX-api/tree/main/examples)
</details>

## Help

<details>
<summary style="font-weight: bold;font-size:15px;">How to extract cookies?</summary>

#### Easy way

1. Install [Cookie Editor](https://github.com/Moustachauve/cookie-editor) extension in your browser.
2. Open [labs.google](https://labs.google/fx/tools/whisk/project), make sure you are logged in
3. Click on <kbd>Cookie Editor</kbd> icon from Extensions section.
4. Click on <kbd>Export</kbd> -> <kbd>Header String</kbd>

#### Manual way

1. Open [labs.google](https://labs.google/fx/tools/whisk/project), make sure you are logged in
2. Press <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>I</kbd> to open console
3. Click on <kbd>Network</kbd> tab at top of console
4. Press <kbd>CTRL</kbd> + <kbd>L</kbd> to clear network logs
5. Click <kbd>CTRL</kbd> + <kbd>R</kbd> to refresh page
6. Click on `image-fx` which should be at top
7. Goto <kbd>Request Headers</kbd> section and copy all the content of <kbd>Cookie</kbd>

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">ImageFX not available in your country?</summary>

1. Install a free VPN (Windscribe, Proton, etc)
2. Open [labs.google](https://labs.google/fx/tools/whisk/project) and login
3. From here follow the "How to extract cookie?" in [HELP](#help) section (above).
4. Once you have obtained this cookie, you don't need VPN anymore.

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Not able to generate images?</summary>

Create an issue [here](https://github.com/rohitaryal/imageFX-api/issues). Make sure the pasted logs don't contain cookie or tokens.
</details>

## Contributions

Contribution are welcome but ensure to pass all test cases and follow existing coding standard.

## Disclaimer

This project demonstrates usage of Google's private API but is not affiliated with Google. Use at your own risk.
