/**
 * Crafts & STEM — hub listing all 25 projects. Links to /learn/crafts-stem-{slug}.
 */
import { Link } from 'react-router-dom';
import { CRAFTS_STEM_PROJECTS } from '../data/crafts-stem-projects';
import '../styles/learn.css';
import '../styles/crafts-stem.css';

export default function CraftsStemHub() {
  return (
    <article className="learn-page crafts-stem-hub">
      <Link to="/learn" className="learn-page__back">
        ← Back to Learn & Grow
      </Link>
      <header className="crafts-stem-hub__header">
        <h1 className="learn-page__title">Crafts & STEM</h1>
        <p className="learn-page__intro crafts-stem-hub__intro">
          Twenty-five household-friendly projects: chemistry, physics, and hands-on making.
          Each one includes the science behind it, variations to try, safety notes, and age ranges.
        </p>
      </header>
      <div className="crafts-stem-hub__grid">
        {CRAFTS_STEM_PROJECTS.map((project) => (
          <Link
            key={project.slug}
            to={`/learn/crafts-stem-${project.slug}`}
            className="crafts-stem-card"
          >
            <h3 className="crafts-stem-card__title">{project.title}</h3>
            <p className="crafts-stem-card__wow">{project.wowFactor}</p>
            <div className="crafts-stem-card__meta">
              <span className="crafts-stem-card__age">{project.ageRange}</span>
              <span className="crafts-stem-card__diff">{project.difficulty}</span>
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
