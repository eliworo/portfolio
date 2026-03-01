import createImageUrlBuilder from "@sanity/image-url";
import { Link } from "@/sanity.types";
import { dataset, projectId, studioUrl } from "@/sanity/lib/api";
import { createDataAttribute, CreateDataAttributeProps } from "next-sanity";
import { getImageDimensions } from "@sanity/asset-utils";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});
const DEFAULT_IMAGE_QUALITY = 72;

export const urlForImage = (source: any) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined;
  }

  const imageRef = source?.asset?._ref;
  const crop = source.crop;

  // get the image's og dimensions
  const { width, height } = getImageDimensions(imageRef);

  if (Boolean(crop)) {
    // compute the cropped image's area
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)));

    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)));

    // compute the cropped image's position
    const left = Math.floor(width * crop.left);
    const top = Math.floor(height * crop.top);

    // gather into a url
    return imageBuilder
      ?.image(source)
      .rect(left, top, croppedWidth, croppedHeight)
      .fit("max")
      .auto("format")
      .quality(DEFAULT_IMAGE_QUALITY);
  }

  return imageBuilder
    ?.image(source)
    .fit("max")
    .auto("format")
    .quality(DEFAULT_IMAGE_QUALITY);
};

export function resolveOpenGraphImage(image: any, width = 1200, height = 627) {
  if (!image) return;
  const url = urlForImage(image)?.width(1200).height(627).fit("crop").url();
  if (!url) return;
  return { url, alt: image?.alt as string, width, height };
}

// Resolve both current (internal/external) and legacy (href/page/post) link values.
export function linkResolver(link: Link | undefined) {
  if (!link) return null;

  // Portable text can contain links without an explicit type (e.g. pasted URLs).
  let linkType = link.linkType as string | undefined;
  if (!linkType) {
    if (link.href) {
      linkType = "external";
    } else if ((link as any).internalLink) {
      linkType = "internal";
    }
  }

  const resolveInternalPath = (value: unknown) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized) return null;
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  };

  switch (linkType) {
    case "external":
    case "href": // legacy
      return link.href || null;
    case "internal":
      return resolveInternalPath((link as any).internalLink);
    case "page": // legacy
      if (link?.page && typeof link.page === "string") {
        return resolveInternalPath(link.page);
      }
      return null;
    case "post": // legacy
      if (link?.post && typeof link.post === "string") {
        return resolveInternalPath(`posts/${link.post}`);
      }
      return null;
    default:
      return null;
  }
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, "id" | "type" | "path">>;

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config);
}
