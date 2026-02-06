/**
 * Baking Soda Volcano — surface first, then dive deeper (golden standard).
 * Renders main content via LearningPageView, then "How deep do you want to go?" tier cards
 * and an expandable "Go Deeper" section so depth is optional.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import type { LearningPage, LearningSection, ContentBlock } from "../types/learningEngine";
import { BAKING_SODA_VOLCANO_TIERS, type BakingSodaVolcanoTier } from "../types/learningEngine";
import type { VolcanoImage } from "../types/volcanoImages";
import LearningPageView from "./LearningPageView";
import "../styles/learn.css";

const DEPTH_SECTION_IDS = ["depth.tiers", "further.exploration"] as const;

function getFurtherExplorationSection(page: LearningPage): LearningSection | null {
  return page.sections.find((s) => s.id === "further.exploration") ?? null;
}

function renderContentBlock(block: ContentBlock, index: number) {
  const key = `block-${index}`;
  const emphasisClass = block.emphasis ? ` learn-content-block--${block.emphasis}` : "";

  if (block.type === "paragraph") {
    const text = typeof block.content === "string" ? block.content : block.content.join(" ");
    return (
      <p key={key} className={`learn-content-block learn-content-block--paragraph${emphasisClass}`}>
        {text}
      </p>
    );
  }
  if (block.type === "bullet-list") {
    const items = Array.isArray(block.content) ? block.content : [block.content];
    return (
      <ul key={key} className={`learn-content-block learn-content-block--list${emphasisClass}`}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "callout") {
    const text = typeof block.content === "string" ? block.content : block.content.join(" ");
    return (
      <div key={key} className={`learn-content-block learn-content-block--callout${emphasisClass}`} role="note">
        {text}
      </div>
    );
  }
  if (block.type === "divider") {
    return <hr key={key} className="learn-content-block learn-content-block--divider" />;
  }
  return null;
}

export interface BakingSodaVolcanoExplorationViewProps {
  page: LearningPage;
  volcanoImages?: VolcanoImage[];
}

export default function BakingSodaVolcanoExplorationView({
  page,
  volcanoImages = [],
}: BakingSodaVolcanoExplorationViewProps) {
  const [expandedTierId, setExpandedTierId] = useState<BakingSodaVolcanoTier["id"] | null>(null);
  const [goDeeperOpen, setGoDeeperOpen] = useState(false);

  const surfacePage: LearningPage = {
    ...page,
    sections: page.sections.filter((s) => !DEPTH_SECTION_IDS.includes(s.id as (typeof DEPTH_SECTION_IDS)[number])),
  };

  const furtherSection = getFurtherExplorationSection(page);

  return (
    <div className="learn-page learn-page--baking-soda-exploration">
      <Link to="/learn" className="learn-page__back">
        ← Back to Learn & Grow
      </Link>

      <LearningPageView page={surfacePage} volcanoImages={volcanoImages} />

      {/* How deep do you want to go? — tier cards */}
      <section className="learn-page-view__section volcano-depth-tiers" aria-labelledby="depth-tiers-heading">
        <h2 id="depth-tiers-heading" className="learn-page-view__section-title">
          Choose Your Depth
        </h2>
        <p className="learn-content-block learn-content-block--paragraph volcano-depth-tiers__intro">
          Pick how far you want to go: just watch it erupt, build it yourself, understand the science, or go advanced with equations and science-fair ideas.
        </p>
        <div className="volcano-depth-tiers__grid">
          {BAKING_SODA_VOLCANO_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`volcano-depth-tiers__card ${expandedTierId === tier.id ? "volcano-depth-tiers__card--open" : ""}`}
            >
              <button
                type="button"
                className="volcano-depth-tiers__card-head"
                onClick={() => setExpandedTierId(expandedTierId === tier.id ? null : tier.id)}
                aria-expanded={expandedTierId === tier.id}
                aria-controls={`tier-content-${tier.id}`}
                id={`tier-head-${tier.id}`}
              >
                <span className="volcano-depth-tiers__card-title">{tier.title}</span>
                <span className="volcano-depth-tiers__card-tagline">{tier.tagline}</span>
                <span className="volcano-depth-tiers__card-toggle" aria-hidden>
                  {expandedTierId === tier.id ? "−" : "+"}
                </span>
              </button>
              <div
                id={`tier-content-${tier.id}`}
                className="volcano-depth-tiers__card-body"
                role="region"
                aria-labelledby={`tier-head-${tier.id}`}
                hidden={expandedTierId !== tier.id}
              >
                <p className="learn-content-block learn-content-block--paragraph">{tier.description}</p>
                {tier.relatedTopicId && (
                  <p className="volcano-depth-tiers__related">
                    <Link to={`/learn/${tier.relatedTopicId}`}>Explore: {tier.relatedTopicId.replace(/-/g, " ")}</Link>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Go Deeper — expandable */}
      {furtherSection && (
        <section className="learn-page-view__section volcano-go-deeper" aria-labelledby="go-deeper-heading">
          <h2 id="go-deeper-heading" className="learn-page-view__section-title">
            Go Deeper
          </h2>
          <button
            type="button"
            className="volcano-go-deeper__trigger"
            onClick={() => setGoDeeperOpen(!goDeeperOpen)}
            aria-expanded={goDeeperOpen}
            aria-controls="go-deeper-content"
          >
            {goDeeperOpen ? "− Collapse" : "+ Go Advanced: equation, real volcanoes, science-fair ideas"}
          </button>
          <div
            id="go-deeper-content"
            className="volcano-go-deeper__content"
            hidden={!goDeeperOpen}
          >
            {furtherSection.contentBlocks.map((block, i) => renderContentBlock(block, i))}
          </div>
        </section>
      )}
    </div>
  );
}
