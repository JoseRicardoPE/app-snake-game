import { Direction } from "../../components/board/enum/direction";
import { GameState } from "../../components/board/enum/game-state";

export interface GameSnapshot {
    state: GameState;
    direction: Direction;
    snake: number[];
    food: number;
    score: number;
    speed: number;
    highScore: number;
}
