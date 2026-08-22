import { FacetData, FacetGroupData } from "interfaces";
import { TFunction } from "next-i18next/pages";
import { searchParams } from "./url";

/**
 * The circulation manager sends facet group names and labels in English,
 * so for the time being we localize them client side.
 * See src/palace/manager/feed/facets/constants.py in circulation for facet group names
 */
export const FACET_GROUP_KEYS = [
  "entrypoint",
  "order",
  "available",
  "distributor",
  "collectionName"
] as const;

export type FacetGroupKey = (typeof FACET_GROUP_KEYS)[number];

const ALL = "All";

/**
 * Groups the facet group keys with the facet values themselves for translation
 */
function readGroup(group: FacetGroupData): {
  key?: FacetGroupKey;
  values: (string | undefined)[];
} {
  const params = group.facets.map(facet => searchParams(facet.href));
  if (params.length < 2) return { values: [] };

  for (const key of FACET_GROUP_KEYS) {
    const values = params.map(param => param?.get(key) ?? undefined);
    // Every facet in the group must name a value...
    if (values.some(value => value === undefined)) continue;
    // ...and each facet must name a different one,
    // so compare for duplicates
    if (new Set(values).size !== values.length) continue;
    return { key, values };
  }
  return { values: [] };
}

export function translateFacetGroupLabel(
  key: FacetGroupKey | undefined,
  label: string,
  t: TFunction
): string {
  switch (key) {
    case "entrypoint":
      return t("utils.facets.groupFormats", "Formats");
    case "order":
      return t("utils.facets.groupSortBy", "Sort by");
    case "available":
      return t("utils.facets.groupAvailability", "Availability");
    case "distributor":
      return t("utils.facets.groupDistributor", "Distributor");
    case "collectionName":
      return t("utils.facets.groupCollectionName", "Collection Name");
    default:
      return label;
  }
}

function translateOrderFacet(value: string, label: string, t: TFunction) {
  switch (value) {
    case "title":
      return t("utils.facets.orderTitle", "Title (A-Z)");
    case "title_desc":
      return t("utils.facets.orderTitleDesc", "Title (Z-A)");
    case "author":
      return t("utils.facets.orderAuthor", "Author (A-Z)");
    case "author_desc":
      return t("utils.facets.orderAuthorDesc", "Author (Z-A)");
    case "added":
      return t("utils.facets.orderAdded", "Date Added (New-Old)");
    case "added_asc":
      return t("utils.facets.orderAddedAsc", "Date Added (Old-New)");
    case "last_update":
      return t("utils.facets.orderLastUpdate", "Last Update");
    case "series":
      return t("utils.facets.orderSeries", "Series Position");
    case "work_id":
      return t("utils.facets.orderWorkId", "Work ID");
    default:
      return label;
  }
}

function translateAvailabilityFacet(
  value: string,
  label: string,
  t: TFunction
): string {
  switch (value) {
    case "now":
      return t("utils.facets.availableNow", "Available now");
    case "all":
      return t("utils.facets.availableAll", "All");
    case "always":
      return t("utils.facets.availableAlways", "Yours to keep");
    default:
      return label;
  }
}

function translateEntrypointFacet(
  value: string,
  label: string,
  t: TFunction
): string {
  switch (value) {
    case "All":
      return t("utils.facets.entrypointAll", "All");
    case "Book":
      return t("utils.facets.entrypointBook", "Ebooks");
    case "Audio":
      return t("utils.facets.entrypointAudio", "Audiobooks");
    default:
      return label;
  }
}

export function translateFacetLabel(
  key: FacetGroupKey | undefined,
  value: string | undefined,
  label: string,
  t: TFunction
): string {
  if (value === undefined) return label;
  switch (key) {
    case "order":
      return translateOrderFacet(value, label, t);
    case "available":
      return translateAvailabilityFacet(value, label, t);
    case "entrypoint":
      return translateEntrypointFacet(value, label, t);
    case "distributor":
      return value === ALL ? t("utils.facets.distributorAll", "All") : label;
    case "collectionName":
      return value === ALL ? t("utils.facets.collectionNameAll", "All") : label;
    default:
      return label;
  }
}

export interface TranslatedFacet {
  href: string;
  label: string;
  active: boolean;
}

export interface TranslatedFacetGroup {
  id: string;
  label: string;
  facets: TranslatedFacet[];
}

export function translateFacetGroup(
  group: FacetGroupData,
  t: TFunction
): TranslatedFacetGroup {
  const { key, values } = readGroup(group);
  return {
    id: key ?? group.label,
    label: translateFacetGroupLabel(key, group.label, t),
    facets: group.facets.map((facet: FacetData, index) => ({
      href: facet.href,
      active: facet.active,
      label: translateFacetLabel(key, values[index], facet.label, t)
    }))
  };
}
