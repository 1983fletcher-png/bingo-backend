/**
 * Survey Showdown player reveal — 2-layer: frame-only art + live tiles.
 * No baked answers/numbers in assets.
 */
import type { FeudState } from '../../types/feud';
import { SurveyShowdownFrame } from './SurveyShowdownFrame';
import { SurveyShowdownBoard } from './SurveyShowdownBoard';
import './feud-player-reveal.css';

type Props = {
  feud: FeudState;
};

export function FeudPlayerReveal({ feud }: Props) {
  return (
    <div className="feud-player-reveal">
      <p className="feud-player-reveal__prompt">{feud.prompt || 'Top answers'}</p>
      <SurveyShowdownFrame variant="player">
        <SurveyShowdownBoard variant="player" feud={feud} />
      </SurveyShowdownFrame>
    </div>
  );
}
