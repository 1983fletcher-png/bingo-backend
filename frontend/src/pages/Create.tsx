/**
 * Create a page – template family selection.
 * All five tabs are active: Hospitality, Education & Learning, Care & Wellness, Business & Corporate, General Page.
 */
import { Link } from 'react-router-dom';
import '../styles/create.css';

const TEMPLATE_FAMILIES = [
  { id: 'hospitality', title: 'Hospitality & Venues', description: 'Bars, restaurants, breweries, food trucks, music venues, hotels', to: '/create/hospitality' },
  { id: 'education', title: 'Education & Learning', description: 'Schools, classrooms, libraries, youth programs, workshops', to: '/create/education' },
  { id: 'care', title: 'Care & Wellness', description: 'Assisted living, clinics, therapy offices, hospitals', to: '/create/care' },
  { id: 'business', title: 'Business & Corporate', description: 'Training, onboarding, internal communication', to: '/create/business' },
  { id: 'general', title: 'General Page', description: 'Announcements, flyers, quick pages', to: '/create/general' },
] as const;

export default function Create() {
  return (
    <div className="create">
      <section className="create__hero" aria-label="Choose a template">
        <Link to="/" className="create__back">← Back to Playroom</Link>
        <Link to="/create" className="create__back" style={{ marginLeft: 12 }}>Creative Studio</Link>
        <h1 className="create__title">Create a page</h1>
        <p className="create__tagline">
          Pick what you need. We’ll guide you step by step—no design experience required.
        </p>
      </section>
      <div className="create__cards">
        {TEMPLATE_FAMILIES.map((card) => (
          <Link key={card.id} to={card.to} className="create__card">
            <span className="create__card-title">{card.title}</span>
            <span className="create__card-desc">{card.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
