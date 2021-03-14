import { DynamicImage } from "./lib";
import * as images from "./tests/images";

describe("Pixel", () => {
  const instances: Array<DynamicImage> = [];

  afterEach(() => {
    instances.forEach((instance) => instance.dispose());
    instances.length = 0;
  });

  const createInstance = async (imgPath: string) => {
    const instance = new DynamicImage({
      bytes: await images.read(imgPath),
    });

    instances.push(instance);

    return instance;
  };

  test("getChannels(), setChannels()", async () => {
    const dynamicImage = await createInstance(images.paths.catJpg);
    const pixel = dynamicImage.getPixel({ x: 0, y: 0 });

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([142, 152, 115, 255])
    );

    pixel.setChannels([0, 0]);

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([0, 0, 115, 255])
    );
  });

  // TODO: Check pixel transformations in actual jpg

  // TODO: Write same test for image with alpha channel
  test("apply(), applyWithAlpha(), applyWithoutAlpha() for image without alpha channel", async () => {
    const dynamicImage = await createInstance(images.paths.catJpg);
    const pixel = dynamicImage.getPixel({ x: 0, y: 0 });
    const channels: Array<number> = [];

    pixel.apply((channel) => {
      channels.push(channel);

      return 0;
    });

    expect(channels).toMatchObject([142, 152, 115, 255]);
    // The underlying image has no alpha channel which is why 255 is returned again
    expect(pixel.getChannels()).toMatchObject(Uint8Array.from([0, 0, 0, 255]));

    channels.length = 0;

    pixel.applyWithAlpha(
      (channel) => {
        channels.push(channel);

        return 1;
      },
      (alphaChannel) => {
        channels.push(alphaChannel);

        // Since the image has no alpha channel, the return value will be ignored
        return 1;
      }
    );

    expect(channels).toMatchObject([0, 0, 0, 255]);
    expect(pixel.getChannels()).toMatchObject(Uint8Array.from([1, 1, 1, 255]));

    channels.length = 0;

    pixel.applyWithoutAlpha((channel) => {
      channels.push(channel);

      return 2;
    });

    expect(channels).toMatchObject([1, 1, 1]);
    expect(pixel.getChannels()).toMatchObject(Uint8Array.from([2, 2, 2, 255]));
  });

  test("apply2()", async () => {
    const dynamicImage = await createInstance(images.paths.catJpg);
    const pixel = dynamicImage.getPixel({ x: 0, y: 0 });
    const otherPixel = dynamicImage.getPixel({ x: 100, y: 0 });
    const channelTuples: Array<Array<number>> = [];

    pixel.apply2(otherPixel, (selfChannel, otherChannel) => {
      channelTuples.push([selfChannel, otherChannel]);

      return 0;
    });

    expect(channelTuples).toMatchObject([
      [142, 165],
      [152, 170],
      [115, 148],
      [255, 255],
    ]);
    expect(pixel.getChannels()).toMatchObject(Uint8Array.from([0, 0, 0, 255]));
  });

  test("invert()", async () => {
    const dynamicImage = await createInstance(images.paths.catJpg);
    const pixel = dynamicImage.getPixel({ x: 0, y: 0 });

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([142, 152, 115, 255])
    );

    pixel.invert();

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([113, 103, 140, 255])
    );
  });

  test("blend()", async () => {
    const dynamicImage = await createInstance(images.paths.catJpg);
    const pixel = dynamicImage.getPixel({ x: 0, y: 0 });
    const otherPixel = dynamicImage.getPixel({ x: 100, y: 0 });

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([142, 152, 115, 255])
    );

    pixel.blend(otherPixel);

    expect(pixel.getChannels()).toMatchObject(
      Uint8Array.from([165, 170, 148, 255])
    );
  });
});
