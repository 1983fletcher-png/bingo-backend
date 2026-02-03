import type { TriviaPack, TriviaQuestion } from '../types/trivia';

export type { TriviaPack, TriviaQuestion };

/** Sample music trivia pack — 24 questions. */
export const musicTriviaPack: TriviaPack = {
  id: 'music-general',
  title: 'Music Trivia',
  description: 'Mix of decades and genres',
  questions: [
    { question: 'Which band sang "Bohemian Rhapsody"?', correctAnswer: 'Queen', points: 1 },
    { question: 'Who released the album "Thriller" in 1982?', correctAnswer: 'Michael Jackson', points: 1 },
    { question: 'Which artist is known as the "King of Pop"?', correctAnswer: 'Michael Jackson', points: 1 },
    { question: 'What is the best-selling album of all time?', correctAnswer: 'Thriller', points: 2 },
    { question: 'Which band had a hit with "Sweet Child O\' Mine"?', correctAnswer: 'Guns N\' Roses', points: 1 },
    { question: 'Who sang "Like a Virgin"?', correctAnswer: 'Madonna', points: 1 },
    { question: 'Which group performed "Don\'t Stop Believin\'"?', correctAnswer: 'Journey', points: 1 },
    { question: 'Who wrote and sang "Imagine"?', correctAnswer: 'John Lennon', points: 1 },
    { question: 'Which band is fronted by Bono?', correctAnswer: 'U2', points: 1 },
    { question: 'What instrument did Jimi Hendrix famously play?', correctAnswer: 'Guitar', points: 1 },
    { question: 'Which singer is known as the "Material Girl"?', correctAnswer: 'Madonna', points: 1 },
    { question: 'What year did the Beatles break up?', correctAnswer: '1970', points: 2 },
    { question: 'Which band had a hit with "Livin\' on a Prayer"?', correctAnswer: 'Bon Jovi', points: 1 },
    { question: 'Who sang "Purple Rain"?', correctAnswer: 'Prince', points: 1 },
    { question: 'Which band performed "Stairway to Heaven"?', correctAnswer: 'Led Zeppelin', points: 1 },
    { question: 'Who is the lead singer of Coldplay?', correctAnswer: 'Chris Martin', points: 1 },
    { question: 'Which artist had a hit with "Blinding Lights"?', correctAnswer: 'The Weeknd', points: 1 },
    { question: 'What band sang "Smells Like Teen Spirit"?', correctAnswer: 'Nirvana', points: 1 },
    { question: 'Who performed "Single Ladies (Put a Ring on It)"?', correctAnswer: 'Beyoncé', points: 1 },
    { question: 'Which group sang "Dancing Queen"?', correctAnswer: 'ABBA', points: 1 },
    { question: 'What is the name of Taylor Swift\'s first album?', correctAnswer: 'Taylor Swift', points: 2 },
    { question: 'Which band had a hit with "Hotel California"?', correctAnswer: 'Eagles', points: 1 },
    { question: 'Who sang "Rolling in the Deep"?', correctAnswer: 'Adele', points: 1 },
    { question: 'Which artist is known for "Shape of You"?', correctAnswer: 'Ed Sheeran', points: 1 },
  ],
};

import { allVideoGamePacks } from './triviaPacksVideoGames';
import { allTVMoviesDecadesPacks } from './triviaPacksTVMoviesDecades';

/** All default packs: Music, TV, Movies, Decades, Video Games (consoles, Nintendo, Sega, PlayStation, PC/handheld, classics). */
export const defaultTriviaPacks: TriviaPack[] = [
  musicTriviaPack,
  ...allTVMoviesDecadesPacks,
  ...allVideoGamePacks,
];
