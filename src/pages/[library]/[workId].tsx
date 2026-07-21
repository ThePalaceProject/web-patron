/**
 * Cross-library item landing page: /{itemLandingSlug}/{workId} for each
 * configured landing slug
 * (default: /_item_/{workId}; see constants/app.ts).
 *
 * Accepts a work identifier (the path segment after /works/ in a Palace CM OPDS
 * entry URL) and lets the user choose which of their libraries to open it in.
 * On selection the page navigates to /{slug}/book/{encodedBookUrl}, where
 * bookUrl is constructed as {catalogUrl}/works/{encodedWorkId}.
 *
 * The route is dynamic so the landing slugs can be configured at runtime via
 * the item_landing_slugs config property (multiple slugs may be active at
 * once, e.g. during a slug migration). Static sibling routes take precedence
 * over this dynamic segment, so only two-segment URLs that match no other
 * route reach this page; those whose first segment is not a landing slug 404.
 *
 * This file is intentionally thin: the slug check and redirect/selector logic
 * live in dataflow/itemLanding.ts and the page body in
 * components/ItemLandingPage.tsx.
 */
import { GetServerSideProps, NextPage } from "next";
import ItemLandingPage from "components/ItemLandingPage";
import {
  getItemLandingRouteProps,
  ItemLandingProps
} from "dataflow/itemLanding";

const ItemLandingRoute: NextPage<ItemLandingProps> = ({ workId }) => (
  <ItemLandingPage workId={workId} />
);

export const getServerSideProps: GetServerSideProps<
  ItemLandingProps
> = async ctx => getItemLandingRouteProps(ctx.params);

export default ItemLandingRoute;
