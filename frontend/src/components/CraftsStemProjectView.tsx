/**
 * Crafts & STEM — single project view. Renders full structure: wow, materials, steps, science, variations, learnings, age, safety, why it matters.
 */
import { Link } from 'react-router-dom';
import { CRAFTS_STEM_PROJECTS } from '../data/crafts-stem-projects';
import '../styles/learn.css';
import '../styles/crafts-stem.css';

interface CraftsStemProjectViewProps {
  slug: string;
}

export default function CraftsStemProjectView({ slug }: CraftsStemProjectViewProps) {
  const project = CRAFTS_STEM_PROJECTS.find((p) => p.slug === slug) ?? null;

  if (!project) {
    return (
      <div className="learn-page">
        <Link to="/learn" className="learn-page__back">← Back to Learn & Grow</Link>
        <Link to="/learn/crafts-stem" className="learn-page__back">Crafts & STEM</Link>
        <p className="learn-page__error">Project not found.</p>
      </div>
    );
  }

  return (
    <article className="learn-page crafts-stem-project">
      <Link to="/learn" className="learn-page__back">← Back to Learn & Grow</Link>
      <Link to="/learn/crafts-stem" className="learn-page__back">Crafts & STEM</Link>

      <header className="crafts-stem-project__header">
        <h1 className="crafts-stem-project__title">{project.title}</h1>
        <p className="crafts-stem-project__wow">{project.wowFactor}</p>
        <div className="crafts-stem-project__badges">
          <span className="crafts-stem-project__age">Ages {project.ageRange}</span>
          <span className="crafts-stem-project__diff">{project.difficulty}</span>
        </div>
      </header>

      <section className="crafts-stem-project__section" aria-labelledby="materials-head">
        <h2 id="materials-head" className="crafts-stem-project__h2">What You’ll Need</h2>
        <ul className="crafts-stem-project__materials">
          {project.materials.map((m, i) => (
            <li key={i} className="crafts-stem-project__material">
              {m.household && <span className="crafts-stem-project__icon" aria-hidden>✓</span>}
              {m.optional && <span className="crafts-stem-project__icon crafts-stem-project__icon--optional" aria-hidden>↻</span>}
              {m.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="crafts-stem-project__section" aria-labelledby="steps-head">
        <h2 id="steps-head" className="crafts-stem-project__h2">Step-by-Step</h2>
        <ol className="crafts-stem-project__steps">
          {project.steps.map((step, i) => (
            <li key={i} className="crafts-stem-project__step">{step}</li>
          ))}
        </ol>
      </section>

      <section className="crafts-stem-project__section crafts-stem-project__section--science" aria-labelledby="science-head">
        <h2 id="science-head" className="crafts-stem-project__h2">What’s Happening? (The Science)</h2>
        <p className="crafts-stem-project__science">{project.science}</p>
      </section>

      <section className="crafts-stem-project__section" aria-labelledby="variations-head">
        <h2 id="variations-head" className="crafts-stem-project__h2">Try This Too (Variations)</h2>
        <ul className="crafts-stem-project__variations">
          {project.variations.map((v, i) => (
            <li key={i} className="crafts-stem-project__variation">
              <strong>{v.title}.</strong> {v.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="crafts-stem-project__section" aria-labelledby="learnings-head">
        <h2 id="learnings-head" className="crafts-stem-project__h2">What Did We Learn?</h2>
        <ul className="crafts-stem-project__learnings">
          {project.learnings.map((l, i) => (
            <li key={i} className="crafts-stem-project__learning">{l}</li>
          ))}
        </ul>
      </section>

      <section className="crafts-stem-project__section crafts-stem-project__section--callout" aria-labelledby="why-head">
        <h2 id="why-head" className="crafts-stem-project__h2">Why This Project Matters</h2>
        <p className="crafts-stem-project__why">{project.whyItMatters}</p>
      </section>

      {project.safety && (
        <section className="crafts-stem-project__section crafts-stem-project__section--safety" aria-labelledby="safety-head">
          <h2 id="safety-head" className="crafts-stem-project__h2">Safety Notes</h2>
          <p className="crafts-stem-project__safety">{project.safety}</p>
        </section>
      )}
    </article>
  );
}
